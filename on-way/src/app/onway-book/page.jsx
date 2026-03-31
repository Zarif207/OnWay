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
import { MapPin, Clock, Route, DollarSign, Loader2, AlertTriangle, Car, Star, Phone, MessageCircle, XCircle, ArrowRight, ShieldCheck, User, Wallet, Navigation, CreditCard } from "lucide-react";
import '@/styles/location-dropdown.css';
import { getDemandMultiplier } from "@/utils/demandService";
import { useRide } from "@/context/RideContext";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/app/root-components/Navbar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Dynamically import the Leaflet map (disables SSR)
const RideMap = dynamic(() => import("@/components/Map/RideMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center animate-pulse">
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
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      weatherCondition = res.data.weather[0].main;
      temp = res.data.main.temp;
      humidity = res.data.main.humidity;
      visibility = res.data.visibility;
      rainMm = res.data.rain?.["1h"] ?? 0;
    } catch (err) {
      console.error("Weather API error:", err);
    }

    try {
      const trafficRes = await axios.get(`${API_BASE_URL}/traffic/flow`, {
        params: { lat, lon },
        timeout: 5000,
      });
      if (trafficRes?.data?.success && trafficRes.data.data) {
        trafficRatio = trafficRes.data.data.ratio;
      }
    } catch (err) {
      console.warn("Traffic API unavailable.");
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

    setTrafficInfo({
      ratio: trafficRatio,
      currentSpeed: Math.round(40 * trafficRatio),
      freeFlowSpeed: 40,
      fromSurge: true,
    });
  }, []);

  useEffect(() => {
    if (pickupLocation) {
      const currentAddress = pickupLocation.name || pickupQuery || "";
      updateSurgeAndFare(pickupLocation.lat, pickupLocation.lon, currentAddress);
    }
  }, [pickupLocation, updateSurgeAndFare, pickupQuery]);

  useEffect(() => {
    if (distance > 0) {
      setFare(calculateFare(distance, rideType, surge.multiplier));
    } else {
      setFare(0);
    }
  }, [distance, rideType, surge.multiplier]);

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
            if (routeData.routeInfo?.isFallback) {
              setError("⚠️ Using estimated route (network issues detected).");
            }
          }
        } catch (err) {
          setError(`Route calculation failed: ${err.message}`);
          resetRouteState();
        } finally {
          setIsRouting(false);
        }
      } else {
        resetRouteState();
      }
    };
    fetchRoute();
  }, [pickupLocation, dropoffLocation]);

  useEffect(() => {
    let timeout;
    const fetchNearbyRiders = async () => {
      if (!pickupLocation) return;
      try {
        const res = await fetch(`${API_BASE_URL}/riders/nearby?lat=${pickupLocation.lat}&lng=${pickupLocation.lon}&radius=5`);
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          const ridersObj = {};
          result.data.forEach(rider => { ridersObj[rider.id] = rider; });
          setOnlineRiders(ridersObj);
        }
      } catch (err) {
        console.error("Failed to fetch nearby riders:", err);
      }
    };
    if (pickupLocation) timeout = setTimeout(fetchNearbyRiders, 500);
    const interval = setInterval(fetchNearbyRiders, 15000);
    return () => { if (timeout) clearTimeout(timeout); clearInterval(interval); };
  }, [pickupLocation]);

  const resetRouteState = () => {
    setDistance(0);
    setDuration(0);
    setRouteGeometry([]);
    setFare(0);
  };

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
      const newLoc = { lat: coords.lat, lon: coords.lon, name: addressData.name, address: addressData.address || {} };
      if (activeInput === "pickup") {
        setPickupLocation(newLoc);
        setPickupQuery(addressData.name);
        setActiveInput("dropoff");
      } else {
        setDropoffLocation(newLoc);
        setDropoffQuery(addressData.name);
      }
    } catch (err) {
      setError("Failed to get address.");
    }
  };

  const handlePickupYourLocation = (loc) => {
    setPickupLocation(loc);
    setActiveInput("dropoff");
  };

  const handleDropoffYourLocation = (loc) => {
    setDropoffLocation(loc);
  };

  const handleCurrentLocationFound = (loc) => {
    reverseGeocode(loc.lat, loc.lng).then(addr => {
      const newLoc = { lat: loc.lat, lon: loc.lng, name: addr.name };
      if (activeInput === "pickup") {
        setPickupLocation(newLoc);
        setPickupQuery(addr.name);
        setActiveInput("dropoff");
      } else {
        setDropoffLocation(newLoc);
        setDropoffQuery(addr.name);
      }
    });
  };

  const handleConfirmBooking = async () => {
    if (!pickupLocation || !dropoffLocation || routeGeometry.length === 0) {
      setError("Please select pickup and drop-off.");
      return;
    }
    if (!session?.user?.id) {
      setError("Please login to book a ride.");
      alert("Please login to book a ride.");
      router.push("/login?callbackUrl=/onway-book");
      return;
    }
    if (rideStatus !== "idle" && !isPaid) {
      const msg = "You have a pending payment for your previous ride. Please complete it before booking a new ride.";
      setError(msg);
      alert(msg);
      return;
    }
    setIsSubmitting(true);
    setError("");
    const currentFare = fare > 0 ? fare : calculateFare(distance, rideType, surge.multiplier);

    let bookingId = null;
    try {
      const bookingData = {
        pickupLocation: {
          lat: pickupLocation.lat,
          lng: pickupLocation.lng,
          address: pickupQuery || pickupLocation.address || "Pickup Point"
        },
        dropoffLocation: {
          lat: dropoffLocation.lat,
          lng: dropoffLocation.lng,
          address: dropoffQuery || dropoffLocation.address || "Drop-off Point"
        },
        routeGeometry,
        distance,
        duration,
        price: currentFare,
        passengerId: session.user.id,
        rideType: rideType,
        surgeApplied: surge.multiplier > 1.0
      };

      const bookingRes = await axios.post(`${API_BASE_URL}/bookings`, bookingData);

      if (bookingRes.data.success) {
        bookingId = bookingRes.data.booking._id;

        // ONLY start searching if booking was created
        startSearching({
          pickup: pickupLocation,
          dropoff: dropoffLocation,
          routeGeometry: routeGeometry,
          fare: currentFare,
          duration: duration,
          distance: distance,
          rideType: rideType,
          bookingId: bookingId
        });
      } else {
        throw new Error(bookingRes.data.message || "Failed to create booking");
      }
    } catch (err) {
      console.error("Booking creation failed:", err);
      const errorMsg = err.response?.data?.message || err.message || "Something went wrong. Please try again.";
      setError(errorMsg);
      alert(errorMsg);
      setIsSubmitting(false);
      return; // Stop flow
    }
    const delay = Math.floor(Math.random() * 3000) + 2000;
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/riders`);
        let available = res.data.success ? res.data.data : [];
        if (available.length === 0) {
          setError("No drivers available.");
          cancelRide();
          setIsSubmitting(false);
          return;
        }
        const mappedType = rideType === "classic" ? "car" : rideType;
        let matched = available.filter(r => r.vehicle?.category?.toLowerCase() === mappedType.toLowerCase() && r.status === "online");
        if (matched.length === 0) matched = available.slice(0, 3);
        const sel = matched[Math.floor(Math.random() * matched.length)];
        const driver = {
          id: sel._id,
          name: sel.profile?.fullName || "Driver",
          car: `${sel.vehicle?.model || "Toyota"}`,
          plate: sel.vehicle?.number || "DHK-000",
          rating: "4.9",
          eta: "3 min",
          phone: sel.phone,
          avatar: sel.profile?.image || "adventurer/svg?seed=Driver",
          otp: Math.floor(1000 + Math.random() * 9000).toString()
        };
        setMatched(driver);

        // Update booking in backend with riderId and accepted status
        if (bookingId) {
          try {
            await axios.patch(`${API_BASE_URL}/bookings/${bookingId}`, {
              riderId: driver.id,
              bookingStatus: "accepted"
            });
          } catch (patchErr) {
            console.error("Failed to update booking with rider:", patchErr);
          }
        }

        setIsSubmitting(false);
      } catch (err) {
        setError("Matching failed.");
        cancelRide();
        setIsSubmitting(false);
      }
    }, delay);
  };

  const handleCancelBooking = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    cancelRide();
    setIsSubmitting(false);
  };

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // If payment was done or localStorage cleared, reset ride state
  useEffect(() => {
    const saved = localStorage.getItem("onway_current_ride");
    if (!saved && rideStatus !== "idle") {
      cancelRide();
    }
    // If paid, always reset
    if (isPaid) {
      cancelRide();
      localStorage.removeItem("onway_current_ride");
    }
  }, []);

  return (
    <>
      <main className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden relative bg-white selection:bg-blue-100">

        {/* LEFT PANEL: Booking Sidebar (Responsive Width, Internal Scroll) */}
        <aside className="w-full lg:w-[420px] h-auto lg:h-full flex-shrink-0 bg-white border-r border-gray-100 flex flex-col z-20 relative shadow-sm">
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 space-y-8">
            <header className="pb-2">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Book a Ride</h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Comfort & Safety First</p>
            </header>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <section className="space-y-6">
              <LocationInput
                label="PICKUP LOCATION"
                placeholder="Enter pickup point"
                value={pickupQuery}
                onChange={setPickupQuery}
                onLocationSelect={handlePickupLocationSelect}
                type="pickup"
                isActive={activeInput === "pickup"}
                onFocus={() => setActiveInput("pickup")}
                showYourLocationButton={true}
                onYourLocationClick={handlePickupYourLocation}
              />
              <LocationInput
                label="DROP-OFF LOCATION (CLICK MAP OR TYPE)"
                placeholder="Where to?"
                value={dropoffQuery}
                onChange={setDropoffQuery}
                onLocationSelect={handleDropoffLocationSelect}
                type="dropoff"
                isActive={activeInput === "dropoff"}
                onFocus={() => setActiveInput("dropoff")}
                showYourLocationButton={true}
                onYourLocationClick={handleDropoffYourLocation}
              />
            </section>

            <section>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Available Rides</h3>
              <div className="grid grid-cols-2 gap-3 pb-2">
                {Object.entries(FARE_RATES).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => setRideType(key)}
                    className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-3 aspect-square group ${rideType === key
                      ? "border-blue-600 bg-blue-50/20 text-blue-600 shadow-lg shadow-blue-500/10 scale-[1.02]"
                      : "border-gray-50 bg-gray-50/50 hover:bg-gray-100 text-gray-400"
                      }`}
                  >
                    <span className="text-5xl mb-1 transform group-hover:scale-110 transition-transform">{data.icon}</span>
                    <div className="text-center">
                      <p className="text-[12px] font-black uppercase tracking-tight leading-none mb-1">{data.name}</p>
                      <p className="text-[10px] font-bold opacity-60 italic">{data.baseFare} ৳/km</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <AnimatePresence>
              {surge.multiplier > 1.0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-orange-500 text-white rounded-[1rem] flex items-center justify-center text-xl shadow-lg shadow-orange-500/20">⚡</div>
                    <div>
                      <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1">High Demand</p>
                      <p className="text-gray-900 text-xs font-black tracking-tight">{surge.label}</p>
                    </div>
                  </div>
                  <p className="text-lg font-black text-orange-600 tracking-tighter">x{surge.multiplier}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {distance > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1E293B] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                    <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <Clock className="w-4 h-4 mx-auto mb-2 text-blue-400" />
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Duration</p>
                      <p className="text-sm font-black tracking-tight">{duration} min</p>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <Route className="w-4 h-4 mx-auto mb-2 text-emerald-400" />
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Distance</p>
                      <p className="text-sm font-black tracking-tight">{distance} km</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-white/10 relative z-10">
                    <p className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Estimated Fare</p>
                    <p className="text-4xl font-black tracking-tighter text-blue-400 flex items-center gap-1">
                      {fare}<span className="text-base opacity-40 ml-1">৳</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 lg:p-8 border-t border-gray-100 bg-white shadow-inner space-y-4">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <button
              onClick={handleConfirmBooking}
              disabled={(!pickupLocation || !dropoffLocation) || isSubmitting}
              className={`w-full py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98]
                ${(!pickupLocation || !dropoffLocation) || isSubmitting ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"}`}
            >
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Finding your driver...</> : <><MapPin size={20} /> Confirm Booking</>}
            </button>
          </div>
        </aside>

        {/* RIGHT PANEL: Map Container (Premium App Aesthetic) */}
        <div className="flex-1 h-full lg:p-3 bg-gray-50 overflow-hidden">
          <div className="w-full h-full lg:rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 relative bg-white">
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
        </div>
      </main>

      <AnimatePresence>
        {(rideStatus === "searching" || rideStatus === "accepted") && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl border border-white/20"
            >
              {rideStatus === "searching" ? (
                /* --- SEARCHING STATE --- */
                <div className="p-12 text-center space-y-8">
                  {error ? (
                    /* --- ERROR STATE --- */
                    <div className="space-y-6">
                      <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto border border-red-100">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Search Failed</h3>
                        <p className="text-gray-400 text-xs font-medium leading-relaxed">{error}</p>
                      </div>
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => { setError(""); handleConfirmBooking(); }}
                          className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 text-xs uppercase tracking-widest active:scale-95"
                        >
                          Retry Search
                        </button>
                        <button
                          onClick={() => { setError(""); handleCancelBooking(); }}
                          className="w-full py-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* --- LOADING STATE --- */
                    <>
                      <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 border-4 border-blue-50 rounded-[2.5rem]" />
                        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-[2.5rem] animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Car className="w-10 h-10 text-blue-600 animate-pulse" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Finding your driver...</h3>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-[0.2em]">Connecting you to the nearest OnWay partner</p>
                      </div>
                      <button
                        onClick={handleCancelBooking}
                        className="w-full py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors"
                      >
                        Cancel Request
                      </button>
                    </>
                  )}
                </div>
              ) : (
                /* --- DRIVER FOUND STATE --- */
                assignedDriver && (
                  <div className="flex flex-col">
                    <div className="p-10 text-center bg-gray-50/50 border-b border-gray-100">
                      <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 mx-auto mb-6 rounded-[2rem] overflow-hidden shadow-xl ring-8 ring-white relative"
                      >
                        <img src={`https://api.dicebear.com/7.x/${assignedDriver.avatar}`} alt="Driver" className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-lg border-2 border-white">
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                      </motion.div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">{assignedDriver.name}</h3>
                      <div className="flex items-center justify-center gap-1.5 text-amber-500 font-black text-xs">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{assignedDriver.rating}</span>
                        <span className="text-gray-300 font-medium ml-1">• Verified Partner</span>
                      </div>
                    </div>

                    <div className="p-10 space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white border border-gray-100 rounded-3xl text-center shadow-sm">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Vehicle</p>
                          <p className="text-sm font-black text-gray-900 tracking-tight">{assignedDriver.car}</p>
                          <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-tighter bg-blue-50 inline-block px-2 py-0.5 rounded-md">
                            {assignedDriver.plate}
                          </p>
                        </div>
                        <div className="p-5 bg-white border border-gray-100 rounded-3xl text-center shadow-sm">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Arrival</p>
                          <p className="text-sm font-black text-gray-900 tracking-tight">{assignedDriver.eta}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter italic">Nearby</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-500/20">
                        <div>
                          <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Total Fare</p>
                          <p className="text-2xl font-black tracking-tighter">৳{fare}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Security PIN</p>
                          <p className="text-2xl font-black tracking-[0.2em] text-blue-100">{assignedDriver.otp}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 pt-2">
                        <button
                          onClick={markAsPaid}
                          className="w-full py-5 bg-[#2FCA71] text-white font-black rounded-2xl hover:bg-[#28b363] transition shadow-xl text-xs uppercase tracking-[0.2em] active:scale-95 flex items-center justify-center gap-3"
                        >
                          <CreditCard className="w-5 h-5" />
                          Pay Now
                        </button>
                        <button
                          onClick={() => router.push("/dashboard/passenger/ride")}
                          className="w-full py-4 bg-white text-gray-400 font-bold rounded-2xl border-2 border-gray-100 hover:bg-gray-50 transition text-[10px] uppercase tracking-widest"
                        >
                          Pay Later
                        </button>
                        <button
                          onClick={handleCancelBooking}
                          className="w-full py-3 text-gray-400 font-medium text-[9px] uppercase tracking-widest hover:text-red-500 transition-colors"
                        >
                          Cancel Trip
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
