"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import axios from "axios";
import { getDrivingRoute } from "@/utils/routingService";
import { calculateFare, FARE_RATES } from "@/utils/fareCalculator";
import { reverseGeocode } from "@/utils/geocodingService";
import { useRouter } from "next/navigation";
import LocationInput from "@/components/LocationInput";
import NetworkStatus from "@/components/NetworkStatus";
import { MapPin, Clock, Route, DollarSign, Loader2, AlertTriangle, Car } from "lucide-react";
import '@/styles/location-dropdown.css';
import { getDemandMultiplier } from "@/utils/demandService";
import { useRide } from "@/context/RideContext";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Phone, MessageCircle, XCircle, ArrowRight, ShieldCheck } from "lucide-react";

const MOCK_DRIVERS = [
  { id: 1, name: "Rahim", car: "Toyota Axio", plate: "DHK-12-3456", rating: 4.8, eta: "3 min", phone: "+8801700000001", avatar: "adventurer/svg?seed=Felix", vehicleType: "car" },
  { id: 2, name: "Karim", car: "Honda Fit", plate: "DHK-56-7890", rating: 4.7, eta: "2 min", phone: "+8801700000002", avatar: "adventurer/svg?seed=Aneka", vehicleType: "suv" },
  { id: 3, name: "Sakib", car: "Nissan Sunny", plate: "DHK-23-4567", rating: 4.9, eta: "4 min", phone: "+8801700000003", avatar: "adventurer/svg?seed=Jack", vehicleType: "bike" },
  { id: 4, name: "Dr. Asif", car: "Emergency Unit", plate: "AMB-99-1122", rating: 5.0, eta: "5 min", phone: "+8801700000004", avatar: "adventurer/svg?seed=Doc", vehicleType: "ambulance" }
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Dynamically import the Leaflet map (disables SSR)
const RideMap = dynamic(() => import("@/components/Map/RideMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-2xl animate-pulse">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto mb-2" />
        <span className="text-gray-500 font-medium tracking-wide">Loading Route Map...</span>
      </div>
    </div>
  ),
});

export default function BookRidePage() {
  // Location states
  const [pickupQuery, setPickupQuery] = useState("");
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);

  // Route and fare states
  const [routeGeometry, setRouteGeometry] = useState([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rideType, setRideType] = useState("classic");
  const [fare, setFare] = useState(0);

  // Weather & Surge states
  const [surge, setSurge] = useState({ multiplier: 1.0, label: "Normal", icon: "☀️" });
  const [trafficInfo, setTrafficInfo] = useState(null);
  // UI states
  const [isRouting, setIsRouting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeInput, setActiveInput] = useState("pickup");
  const [onlineRiders, setOnlineRiders] = useState({});
  const {
    rideStatus, pickup, dropoff, assignedDriver, routeGeometry: contextRoute, isPaid,
    startSearching, setMatched, cancelRide, markAsPaid
  } = useRide();

  const searchTimeoutRef = useRef(null);
  const { data: session } = useSession();


  const router = useRouter();

  // --- 1. Comprehensive Surge Manager ---
  const updateSurgeAndFare = useCallback(async (lat, lon, address = "") => {
    const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    if (!API_KEY) return;

    let weatherCondition = "Clear";
    let rainMm = 0;
    let visibility = 10000;
    let temp = 30;
    let humidity = 60;
    let trafficRatio = 1.0;

    try {
      // ── Weather API ──
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lsat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      weatherCondition = res.data.weather[0].main;
      temp = res.data.main.temp;
      humidity = res.data.main.humidity;
      visibility = res.data.visibility;
      rainMm = res.data.rain?.["1h"] ?? 0;

      console.log(`Weather: ${weatherCondition}, Visibility: ${visibility}, Temp: ${temp}, Rain: ${rainMm}mm`);

    } catch (err) {
      console.error("Weather API error, using default multiplier:", err);
    }

    try {
      // ── TomTom Traffic API (via backend proxy to avoid CORS) ──
      const trafficRes = await axios.get(`${API_BASE_URL}/traffic/flow`, {
        params: { lat, lon },
        timeout: 5000,
      });

      if (trafficRes?.data?.success && trafficRes.data.data) {
        const { currentSpeed, freeFlowSpeed, ratio } = trafficRes.data.data;
        trafficRatio = ratio;
        console.log(`Traffic: ${currentSpeed}km/h of ${freeFlowSpeed}km/h = ratio ${ratio.toFixed(2)}`);
        setTrafficInfo({ currentSpeed, freeFlowSpeed, ratio });
      }
    } catch (err) {
      console.warn("Traffic API unavailable for this location, skipping.");
    }
    const finalSurge = getDemandMultiplier({
      pickupAddress: address,
      weatherCondition,
      rainMm,
      visibility,
      temp,
      humidity,
      trafficRatio,
    });

    setSurge({
      multiplier: finalSurge.value,
      label: finalSurge.reasons[0] || "Normal",
      reasons: finalSurge.reasons,
      icon: finalSurge.value > 1.3 ? "⚡" : finalSurge.value > 1.0 ? "🌩️" : "☀️",
      isSurge: finalSurge.isSurge
    });

    // Derive traffic status from surge multiplier for display
    // trafficRatio: 1.0 = free flow, 0.0 = standstill
    setTrafficInfo({
      ratio: trafficRatio,
      currentSpeed: Math.round(40 * trafficRatio),   // estimated
      freeFlowSpeed: 40,                              // typical city speed
      fromSurge: true,
    });
  }, []);

  // Fetch surge whenever pickup location or address changes
  useEffect(() => {
    if (pickupLocation) {
      const currentAddress = pickupLocation.name || pickupQuery || "";
      updateSurgeAndFare(pickupLocation.lat, pickupLocation.lon, currentAddress);
    }
  }, [pickupLocation, updateSurgeAndFare, pickupQuery]);

  // ---2. Unified Fare Calculation ---
  useEffect(() => {
    if (distance > 0) {
      const finalFare = calculateFare(distance, rideType, surge.multiplier);
      setFare(finalFare);
    } else {
      setFare(0);
    }
  }, [distance, rideType, surge.multiplier]);




  // --- 3. Route Calculation Logic ---
  useEffect(() => {
    const fetchRoute = async () => {
      if (pickupLocation && dropoffLocation) {
        setIsRouting(true);
        setError("");
        try {
          const routeData = await getDrivingRoute(pickupLocation, dropoffLocation);
          if (routeData) {
            setDistance(routeData.distanceKm);
            setDuration(routeData.durationMin);
            setRouteGeometry(routeData.geometry);

            // Show different messages for fallback vs real routes
            if (routeData.routeInfo?.isFallback) {
              setError("⚠️ Using estimated route (network issues detected).");
            }
          } else {
            setError("Could not find a driving route between these locations.");
            resetRouteState();
          }
        } catch (err) {
          console.error("❌ Route calculation failed:", err);

          // Handle specific network errors
          if (err.message.includes('Network Error') || err.code === 'ERR_NETWORK') {
            setError("⚠️ Network connection issue. Using estimated route calculation.");

            // Create a fallback route manually
            try {
              const { createFallbackRoute } = await import('@/utils/routingService');
              const fallbackRoute = createFallbackRoute(pickupLocation, dropoffLocation);
              setDistance(fallbackRoute.distanceKm);
              setDuration(fallbackRoute.durationMin);
              setRouteGeometry(fallbackRoute.geometry);
            } catch (fallbackErr) {
              console.error("Failed to create fallback route:", fallbackErr);
              resetRouteState();
            }
          } else {
            setError(`Route calculation failed: ${err.message}`);
            resetRouteState();
          }
        } finally {
          setIsRouting(false);
        }
      } else {
        resetRouteState();
      }
    };

    fetchRoute();
  }, [pickupLocation, dropoffLocation]);

  // Update fare when distance or ride type changes
  useEffect(() => {
    setFare(calculateFare(distance, rideType));
  }, [distance, rideType]);

  // Fetch nearby riders (with small delay to prevent rapid-fire on location changes)
  useEffect(() => {
    let timeout;
    const fetchNearbyRiders = async () => {
      if (!pickupLocation) return;
      try {
        const res = await fetch(`${API_BASE_URL}/riders/nearby?lat=${pickupLocation.lat}&lng=${pickupLocation.lon}&radius=5`);
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          const ridersObj = {};
          result.data.forEach(rider => {
            ridersObj[rider.id] = rider;
          });
          setOnlineRiders(ridersObj);
        }
      } catch (err) {
        console.error("Failed to fetch nearby riders:", err);
      }
    };

    if (pickupLocation) {
      timeout = setTimeout(fetchNearbyRiders, 500); // 500ms debounce for rider polling
    }

    const interval = setInterval(fetchNearbyRiders, 15000); // Refresh every 15s instead of 10s
    return () => {
      if (timeout) clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [pickupLocation]);

  const resetRouteState = () => {
    setDistance(0);
    setDuration(0);
    setRouteGeometry([]);
    setFare(0);
  };

  // --- 4. Event Handlers ---
  const handlePickupLocationSelect = (location) => {
    setPickupLocation(location);
    setActiveInput("dropoff");
  };

  const handleDropoffLocationSelect = (location) => {
    setDropoffLocation(location);
  };

  const handleMapClick = async (coords) => {
    setError("");
    try {
      const addressData = await reverseGeocode(coords.lat, coords.lon);
      const newLocationObj = {
        lat: coords.lat,
        lon: coords.lon,
        name: addressData.name,
        address: addressData.address || {}
      };

      if (activeInput === "pickup") {
        setPickupLocation(newLocationObj);
        setPickupQuery(addressData.name);
        setActiveInput("dropoff");
      } else {
        setDropoffLocation(newLocationObj);
        setDropoffQuery(addressData.name);
      }
    } catch (err) {
      setError("Failed to get address for selected location.");
    }
  };

  // Handle "Your Location" button clicks
  const handlePickupYourLocation = (locationData) => {
    setPickupLocation(locationData);
    setActiveInput("dropoff");

    // Also trigger map update if we have a map reference
    // The RideMap component will handle centering and marker placement
  };

  const handleDropoffYourLocation = (locationData) => {
    setDropoffLocation(locationData);

    // The RideMap component will handle centering and marker placement
  };
  // Handle current location from map button
  const handleCurrentLocationFound = (locationData) => {
    const { lat, lng } = locationData;

    // Use the enhanced reverse geocoding
    reverseGeocode(lat, lng).then(addressData => {
      const newLocationObj = { lat, lon: lng, name: addressData.name };
      if (activeInput === "pickup") {
        setPickupLocation(newLocationObj);
        setPickupQuery(addressData.name);
        setActiveInput("dropoff");
      } else {
        setDropoffLocation(newLocationObj);
        setDropoffQuery(addressData.name);
      }
    });
  };

  const handleConfirmBooking = async () => {
    if (!pickupLocation || !dropoffLocation || routeGeometry.length === 0) {
      setError("Please select both pickup and drop-off locations.");
      return;
    }

    if (!session?.user?.id) {
      setError("Please login to book a ride.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    // Select driver based on ride type
    const mappedType = rideType === "classic" ? "car" : rideType;
    const selectedDriver = MOCK_DRIVERS.find(d => d.vehicleType === mappedType) || MOCK_DRIVERS[0];

    // Use global context to start searching
    startSearching({
      pickup: pickupLocation,
      dropoff: dropoffLocation,
      routeGeometry: routeGeometry,
      fare: fare,
      duration: duration,
      distance: distance,
      rideType: rideType
    });

    // 1. Simulate "Searching" delay
    searchTimeoutRef.current = setTimeout(() => {
      // 2. Trigger match in context with the specific driver
      setMatched(selectedDriver);
      setIsSubmitting(false);
    }, 4500); // 4.5s delay for realism
  };

  const handleCancelBooking = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    cancelRide();
    setIsSubmitting(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-3 sm:px-6 lg:px-8">
      <NetworkStatus />
      <div className="max-w-7xl mx-auto">

        {/* MOBILE: map first, then form below | DESKTOP: side by side */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* MAP — top on mobile, right on desktop */}
          <div className="order-1 lg:order-2 w-full lg:flex-1 h-[55vw] min-h-[280px] max-h-[420px] lg:max-h-none lg:min-h-[600px] rounded-2xl overflow-hidden shadow-lg border relative z-0">
            <RideMap
              pickup={pickupLocation}
              dropoff={dropoffLocation}
              routeGeometry={routeGeometry}
              durationMin={duration}
              onMapClick={handleMapClick}
              showCurrentLocationButton={true}
              onCurrentLocationFound={handleCurrentLocationFound}
              onlineRiders={onlineRiders}
              trafficInfo={trafficInfo}
              rideStatus={rideStatus}
            />
          </div>

          {/* FORM — below map on mobile, left on desktop */}
          <div className={`order-2 lg:order-1 w-full lg:w-96 xl:w-[420px] shrink-0 flex flex-col gap-5 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 h-fit ${(activeInput === "pickup" || activeInput === "dropoff") ? 'has-active-dropdown' : ''}`}>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">Book a Ride</h1>
              <p className="text-gray-400 text-xs">Dynamic pricing based on demand & weather.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Location Inputs */}
            <div className="flex flex-col gap-4 relative">
              <div className="absolute left-3.5 top-10 bottom-10 w-0.5 bg-gray-200 z-0"></div>
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-600"></div>
                </div>
                <LocationInput
                  label="Pickup Location"
                  value={pickupQuery}
                  onChange={setPickupQuery}
                  onLocationSelect={handlePickupLocationSelect}
                  type="pickup"
                  isActive={activeInput === "pickup"}
                  onFocus={() => setActiveInput("pickup")}
                  showYourLocationButton={true}
                  onYourLocationClick={(loc) => { setPickupLocation(loc); setActiveInput("dropoff"); }}
                  className="flex-1"
                />
              </div>
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                </div>
                <LocationInput
                  label="Drop-off Location"
                  value={dropoffQuery}
                  onChange={setDropoffQuery}
                  onLocationSelect={handleDropoffLocationSelect}
                  type="dropoff"
                  isActive={activeInput === "dropoff"}
                  onFocus={() => setActiveInput("dropoff")}
                  showYourLocationButton={true}
                  onYourLocationClick={(loc) => setDropoffLocation(loc)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="h-px w-full bg-gray-100"></div>

            {/* Ride Types */}
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4" />
                Available Rides
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(FARE_RATES).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => setRideType(key)}
                    className={`p-3 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${rideType === key
                      ? "border-black bg-gray-50 shadow-sm scale-[1.02]"
                      : "border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-500"
                      }`}
                  >
                    <span className="text-xl mb-0.5">{data.icon}</span>
                    <span className="font-semibold capitalize text-gray-900 text-xs">{data.name}</span>
                    <span className="text-[10px] mt-0.5 text-gray-500">{data.perKm} ৳/km</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Surge Badge */}
            {surge.multiplier > 1.0 && (
              <div className="flex flex-col gap-2 bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-500 p-1.5 rounded-lg text-white">
                      <span className="text-sm">{surge.icon}</span>
                    </div>
                    <div>
                      <p className="text-orange-600 text-[9px] font-bold uppercase tracking-wider">High Demand</p>
                      <p className="text-gray-900 text-xs font-bold">{surge.label}</p>
                    </div>
                  </div>
                  <span className="text-orange-600 font-black text-base">x{surge.multiplier}</span>
                </div>
                <div className="flex gap-1 flex-wrap border-t border-orange-200/30 pt-1.5">
                  {surge.reasons?.map((reason, i) => (
                    <span key={i} className="text-[9px] bg-white/50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                      • {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Route Summary */}
            {isRouting ? (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-gray-600 text-sm font-medium">Calculating route...</span>
              </div>
            ) : routeGeometry.length > 0 ? (
              <div className="bg-linear-to-br from-gray-900 to-gray-800 text-white p-4 rounded-xl shadow-lg">
                <div className="flex gap-3 mb-3 bg-white/10 rounded-lg p-2.5">
                  <div className="flex-1 flex flex-col items-center border-r border-white/20">
                    <Clock className="w-3.5 h-3.5 text-gray-300 mb-0.5" />
                    <span className="text-gray-400 text-[10px] font-semibold">Time</span>
                    <span className="font-bold text-base">{duration} min</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <Route className="w-3.5 h-3.5 text-gray-300 mb-0.5" />
                    <span className="text-gray-400 text-[10px] font-semibold">Distance</span>
                    <span className="font-bold text-base">{distance} km</span>
                  </div>
                </div>
                <div className="flex justify-between items-end pt-2 border-t border-white/10">
                  <span className="text-gray-300 text-sm font-medium">Estimated Fare</span>
                  <span className={`font-bold text-3xl ${surge.multiplier > 1.0 ? 'text-orange-400' : 'text-emerald-400'}`}>{fare} ৳</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl border border-dashed flex items-center justify-center">
                <div className="text-gray-400 text-sm">Select locations to see fare</div>
              </div>
            )}

            {/* Confirm Button */}
            <button
              onClick={handleConfirmBooking}
              disabled={routeGeometry.length === 0 || isSubmitting}
              className="w-full bg-linear-to-r from-primary to-blue-700 text-white py-3.5 rounded-xl font-semibold text-base hover:from-blue-700 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {isSubmitting ? "Confirming..." : "Confirm Booking"}
            </button>
          </div>

        </div>
      </div>

      {/* --- BRANDED SEARCHING MODAL --- */}
      <AnimatePresence>
        {rideStatus === "searching" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-secondary/40 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-12 rounded-[3.5rem] shadow-2xl flex flex-col items-center text-center max-w-sm"
            >
              <div className="relative mb-10">
                <div className="w-24 h-24 border-8 border-primary/10 rounded-full border-t-primary animate-spin" />
                <div className="absolute inset-0 w-24 h-24 border-8 border-primary/20 rounded-full animate-pulse blur-sm" />
                <div className="absolute inset-4 bg-primary/5 rounded-full flex items-center justify-center">
                  <Car className="text-primary animate-bounce pt-1" size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-black text-secondary tracking-tighter mb-3 leading-tight">Finding Your Driver</h3>
              <p className="text-gray-400 font-medium text-sm leading-relaxed mb-10 px-4">
                We're connecting you with premium OnWay riders near your pickup point.
              </p>
              <button
                onClick={handleCancelBooking}
                className="w-full py-4 bg-red-50 text-red-500 font-black rounded-2xl hover:bg-red-100 transition active:scale-95 text-xs uppercase tracking-widest"
              >
                Cancel Search
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DRIVER ASSIGNED MODAL (Transition to tracking) --- */}
      <AnimatePresence>
        {rideStatus === "accepted" && assignedDriver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative"
            >
              {/* Header Visual */}
              <div className="bg-gradient-to-br from-primary to-indigo-700 p-8 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 0 L100 100 M100 0 L0 100" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/10 rounded-3xl mx-auto mb-4 overflow-hidden shadow-xl p-1 border-4 border-white/20">
                    <img
                      src={`https://api.dicebear.com/7.x/${assignedDriver.avatar || "avataaars/svg"}`}
                      alt="Driver"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter">Driver Assigned!</h3>
                  <div className="flex items-center justify-center gap-2 mt-1 text-primary-content opacity-80 font-medium text-xs">
                    <ShieldCheck size={14} />
                    <span>Background Checked</span>
                  </div>
                </div>
              </div>

              {/* Driver Specs */}
              <div className="p-8 space-y-6">
                <div className="text-center">
                  <p className="text-2xl font-black text-secondary tracking-tight">{assignedDriver.name}</p>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{assignedDriver.car} • {assignedDriver.plate}</p>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-inner">
                  <div className="text-center flex-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-lg font-black text-secondary">{assignedDriver.rating}</span>
                      <Star size={16} fill="#F59E0B" stroke="#F59E0B" />
                    </div>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="text-center flex-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ETA</p>
                    <p className="text-lg font-black text-primary">{assignedDriver.eta}</p>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm font-bold text-secondary">
                    <span>Estimated Fare</span>
                    <span className="text-xl font-black text-primary">৳{fare}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { markAsPaid(); router.push("/dashboard/user/ride"); }}
                      className="py-3 bg-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CreditCard size={14} /> Pay Now
                    </button>
                    <button
                      onClick={() => router.push("/dashboard/user/ride")}
                      className="py-3 bg-white border border-gray-200 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition active:scale-95"
                    >
                      Pay Later
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/dashboard/passenger/ride")}
                    className="w-full py-5 bg-primary text-white font-black rounded-2xl hover:bg-primary/95 transition active:scale-[0.98] shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 uppercase tracking-tighter"
                  >
                    Track My Ride <ArrowRight size={20} />
                  </button>
                  <button
                    onClick={handleCancelBooking}
                    className="w-full py-4 bg-gray-50 text-gray-400 font-bold rounded-2xl hover:bg-gray-100 hover:text-red-500 transition active:scale-[0.98] text-sm uppercase tracking-widest"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Icon helper for payment
function CreditCard({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
