"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { getDrivingRoute } from "@/utils/routingService";
import { calculateFare, FARE_RATES } from "@/utils/fareCalculator";
import { reverseGeocode } from "@/utils/geocodingService";
import { useRouter } from "next/navigation";
import LocationInput from "@/components/LocationInput";
import NetworkStatus from "@/components/NetworkStatus";
import { MapPin, Clock, Route, DollarSign, Loader2, AlertTriangle } from "lucide-react";
import '@/styles/location-dropdown.css';
import { getDemandMultiplier } from "@/utils/demandService";

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
  const [rideType, setRideType] = useState("standard");
  const [fare, setFare] = useState(0);

  // Weather & Surge states
  const [surge, setSurge] = useState({ multiplier: 1.0, label: "Normal", icon: "☀️" });
  // UI states
  const [isRouting, setIsRouting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeInput, setActiveInput] = useState("pickup");

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
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
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
      // ── TomTom Traffic API ──
      const TOMTOM_KEY = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;
      if (TOMTOM_KEY) {
        const trafficRes = await axios.get(
          `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json`,
          {
            params: {
              point: `${lat},${lon}`,
              unit: "KMPH",
              key: TOMTOM_KEY,
            },
            validateStatus: (status) => status === 200,
          }
        );

        if (trafficRes?.data?.flowSegmentData) {
          const { currentSpeed, freeFlowSpeed } = trafficRes.data.flowSegmentData;
          if (freeFlowSpeed > 0) {
            trafficRatio = currentSpeed / freeFlowSpeed;
            console.log(`Traffic: ${currentSpeed}km/h of ${freeFlowSpeed}km/h = ratio ${trafficRatio.toFixed(2)}`);
          }
        }
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

  console.log(distance, fare, surge.multiplier);


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

            if (routeData.routeInfo?.isFallback) {
              setError("⚠️ Using estimated route (network issues detected).");
            }
          } else {
            setError("Could not find a driving route between these locations.");
            resetRouteState();
          }
        } catch (err) {
          console.error("Route calculation failed:", err);
          setError("Route calculation failed. Please try again.");
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

  const handleCurrentLocationFound = (locationData) => {
    const { lat, lng } = locationData;
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

    setIsSubmitting(true);
    setError("");

    try {
      const bookingData = {
        pickupLocation: { name: pickupLocation.name, lat: pickupLocation.lat, lng: pickupLocation.lon },
        dropoffLocation: { name: dropoffLocation.name, lat: dropoffLocation.lat, lng: dropoffLocation.lon },
        routeGeometry: routeGeometry.map((coord) => ({ lat: coord[0], lng: coord[1] })),
        distance,
        duration,
        price: fare,
        rideType,
        surgeApplied: surge.multiplier > 1.0,
        bookingStatus: "pending",
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const response = await fetch(`${apiUrl}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      if (result.success) {
        router.push(`/dashboard/passenger/book-ride?bookingId=${result.booking._id}`);
      } else {
        setError(result.message || "Failed to confirm booking.");
      }
    } catch (err) {
      setError("An error occurred while confirming your booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container min-h-screen bg-gray-50 pt-38 pb-20 px-4 sm:px-6 lg:px-8">
      <NetworkStatus />
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* LEFT SIDE: Form Section */}
        <div className={`form-container w-full lg:w-100 xl:w-112.5 shrink-0 flex flex-col gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-fit ${(activeInput === "pickup" || activeInput === "dropoff") ? 'has-active-dropdown' : ''}`}>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Book a Ride</h1>
            <p className="text-gray-500 text-sm">Demand prediction & Dynamic pricing based on weather.</p>
          </div>


          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Location Inputs */}
          <div className="flex flex-col gap-5 relative">
            <div className="absolute left-3.75 top-11.25 bottom-11.25 w-0.5 bg-gray-200 z-0"></div>
            <div className="flex items-start gap-4 relative">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
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

            <div className="flex items-start gap-4 relative">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
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

          <div className="h-px w-full bg-gray-100 my-2"></div>

          {/* Ride Types */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Available Rides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(FARE_RATES).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setRideType(key)}
                  className={`p-4 border-2 rounded-2xl flex flex-col items-center justify-center transition-all ${rideType === key ? "border-black bg-gray-50 shadow-sm transform scale-[1.02]" : "border-gray-100 text-gray-500"}`}
                >
                  <span className="text-2xl mb-1">{data.icon}</span>
                  <span className="font-semibold capitalize text-gray-900">{data.name}</span>
                  <span className="text-xs mt-0.5">{data.perKm} ৳/km</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Surge Badge Section */}
          {surge.multiplier > 1.0 && (
            <div className="flex flex-col gap-2 bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 p-2 rounded-lg text-white shadow-sm">
                    <span className="text-lg">{surge.icon}</span>
                  </div>
                  <div>
                    <p className="text-orange-600 text-[10px] font-bold uppercase tracking-wider">High Demand detected</p>
                    <p className="text-gray-900 text-sm font-bold">{surge.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-orange-600 font-black text-lg">x{surge.multiplier}</span>
                </div>
              </div>

              {/* All reasons as small tags */}
              <div className="flex gap-1.5 flex-wrap border-t border-orange-200/30 pt-2 mt-1">
                {surge.reasons?.map((reason, index) => (
                  <span key={index} className="text-[9px] bg-white/50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                    • {reason}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing & Route Summary */}
          {isRouting ? (
            <div className="bg-gray-50 p-6 rounded-2xl mt-2 border border-gray-200 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <span className="text-gray-600 font-medium">Calculating optimal route...</span>
            </div>
          ) : routeGeometry.length > 0 ? (
            <div className="bg-linear-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl mt-2 shadow-lg relative">
              <div className="flex gap-4 mb-4 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex-1 flex flex-col items-center border-r border-white/20">
                  <Clock className="w-4 h-4 text-gray-300 mb-1" />
                  <span className="text-gray-400 text-xs font-semibold">Time</span>
                  <span className="font-bold text-lg">{duration} min</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <Route className="w-4 h-4 text-gray-300 mb-1" />
                  <span className="text-gray-400 text-xs font-semibold">Distance</span>
                  <span className="font-bold text-lg">{distance} km</span>
                </div>
              </div>
              <div className="flex justify-between items-end pt-2 border-t border-white/10">
                <span className="text-gray-300 font-medium">Estimated Fare</span>
                <span className={`font-bold text-4xl ${surge.multiplier > 1.0 ? 'text-orange-400' : 'text-emerald-400'}`}>{fare} ৳</span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-5 rounded-2xl mt-2 border border-dashed flex items-center justify-center text-center">
              <div className="text-gray-400 text-sm">Select locations to see fare</div>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirmBooking}
            disabled={routeGeometry.length === 0 || isSubmitting}
            className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
            {isSubmitting ? "Confirming..." : "Confirm Booking"}
          </button>
        </div>

        {/* RIGHT SIDE: Map View */}
        <div className="w-full flex-1 min-h-150 rounded-3xl overflow-hidden shadow-lg border relative z-0">
          <RideMap
            pickup={pickupLocation}
            dropoff={dropoffLocation}
            routeGeometry={routeGeometry}
            durationMin={duration}
            onMapClick={handleMapClick}
            showCurrentLocationButton={true}
            onCurrentLocationFound={handleCurrentLocationFound}
          />
        </div>
      </div>
    </div>
  );
}


// "use client";

// import { useState, useEffect } from "react";
// import dynamic from "next/dynamic";
// import { getDrivingRoute } from "@/utils/routingService";
// import { calculateFare, FARE_RATES } from "@/utils/fareCalculator";
// import { reverseGeocode } from "@/utils/geocodingService";
// import { useRouter } from "next/navigation";
// import LocationInput from "@/components/LocationInput";
// import NetworkStatus from "@/components/NetworkStatus";
// import { MapPin, Clock, Route, DollarSign, Loader2 } from "lucide-react";
// import '@/styles/location-dropdown.css';

// // Dynamically import the Leaflet map (disables SSR)
// const RideMap = dynamic(() => import("@/components/Map/RideMap"), {
//   ssr: false,
//   loading: () => (
//     <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-2xl animate-pulse">
//       <div className="text-center">
//         <Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto mb-2" />
//         <span className="text-gray-500 font-medium tracking-wide">Loading Route Map...</span>
//       </div>
//     </div>
//   ),
// });

// export default function BookRidePage() {
//   // Location states
//   const [pickupQuery, setPickupQuery] = useState("");
//   const [dropoffQuery, setDropoffQuery] = useState("");
//   const [pickupLocation, setPickupLocation] = useState(null);
//   const [dropoffLocation, setDropoffLocation] = useState(null);

//   // Route and fare states
//   const [routeGeometry, setRouteGeometry] = useState([]);
//   const [distance, setDistance] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [rideType, setRideType] = useState("standard");
//   const [fare, setFare] = useState(0);

//   // UI states
//   const [isRouting, setIsRouting] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [activeInput, setActiveInput] = useState("pickup");

//   const router = useRouter();

//   // 1. State add koro
//   const [surge, setSurge] = useState({ multiplier: 1.0, label: "Normal", icon: "☀️" });

//   // 2. Weather check korar function
//   const checkWeatherSurge = async (lat, lon) => {
//     const data = await getSurgeData(lat, lon);
//     setSurge(data);
//   };

//   // 3. useEffect logic update (pickupLocation thakle weather check hobe)
//   useEffect(() => {
//     if (pickupLocation) {
//       checkWeatherSurge(pickupLocation.lat, pickupLocation.lon);
//     }
//   }, [pickupLocation]);

//   // 4. Fare Calculation-e surge multiplier add koro
//   useEffect(() => {
//     const baseFare = calculateFare(distance, rideType);
//     setFare(Math.round(baseFare * surge.multiplier));
//   }, [distance, rideType, surge.multiplier]);

//   // Fetch route when both locations are available
//   useEffect(() => {
//     const fetchRoute = async () => {
//       if (pickupLocation && dropoffLocation) {
//         setIsRouting(true);
//         setError("");
//         try {
//           console.log("🔄 Calculating route...", { pickup: pickupLocation, dropoff: dropoffLocation });
//           const routeData = await getDrivingRoute(pickupLocation, dropoffLocation);
//           if (routeData) {
//             setDistance(routeData.distanceKm);
//             setDuration(routeData.durationMin);
//             setRouteGeometry(routeData.geometry);

//             // Show different messages for fallback vs real routes
//             if (routeData.routeInfo?.isFallback) {
//               setError("⚠️ Using estimated route (network issues detected). Distance and time are approximate.");
//             } else {
//               console.log("✅ Route calculated successfully using:", routeData.routeInfo?.endpoint);
//             }
//           } else {
//             setError("Could not find a driving route between these locations.");
//             resetRouteState();
//           }
//         } catch (err) {
//           console.error("❌ Route calculation failed:", err);

//           // Handle specific network errors
//           if (err.message.includes('Network Error') || err.code === 'ERR_NETWORK') {
//             setError("⚠️ Network connection issue. Using estimated route calculation.");

//             // Create a fallback route manually
//             try {
//               const { createFallbackRoute } = await import('@/utils/routingService');
//               const fallbackRoute = createFallbackRoute(pickupLocation, dropoffLocation);
//               setDistance(fallbackRoute.distanceKm);
//               setDuration(fallbackRoute.durationMin);
//               setRouteGeometry(fallbackRoute.geometry);
//             } catch (fallbackErr) {
//               console.error("Failed to create fallback route:", fallbackErr);
//               resetRouteState();
//             }
//           } else {
//             setError(`Route calculation failed: ${err.message}`);
//             resetRouteState();
//           }
//         } finally {
//           setIsRouting(false);
//         }
//       } else {
//         resetRouteState();
//       }
//     };

//     fetchRoute();
//   }, [pickupLocation, dropoffLocation]);

//   // Update fare when distance or ride type changes
//   useEffect(() => {
//     setFare(calculateFare(distance, rideType));
//   }, [distance, rideType]);

//   const resetRouteState = () => {
//     setDistance(0);
//     setDuration(0);
//     setRouteGeometry([]);
//     setFare(0);
//   };

//   // Handle location selection from LocationInput component
//   const handlePickupLocationSelect = (location) => {
//     setPickupLocation(location);
//     setActiveInput("dropoff");
//   };

//   const handleDropoffLocationSelect = (location) => {
//     setDropoffLocation(location);
//   };

//   // Handle map click for location selection
//   const handleMapClick = async (coords) => {
//     setError("");
//     try {
//       const addressData = await reverseGeocode(coords.lat, coords.lon);

//       const newLocationObj = {
//         lat: coords.lat,
//         lon: coords.lon,
//         name: addressData.name,
//         address: addressData.address || {}
//       };

//       if (activeInput === "pickup") {
//         setPickupLocation(newLocationObj);
//         setPickupQuery(addressData.name);
//         setActiveInput("dropoff");
//       } else {
//         setDropoffLocation(newLocationObj);
//         setDropoffQuery(addressData.name);
//       }
//     } catch (err) {
//       setError("Failed to get address for selected location.");
//     }
//   };

//   // Handle "Your Location" button clicks
//   const handlePickupYourLocation = (locationData) => {
//     setPickupLocation(locationData);
//     setActiveInput("dropoff");

//     // Also trigger map update if we have a map reference
//     // The RideMap component will handle centering and marker placement
//   };

//   const handleDropoffYourLocation = (locationData) => {
//     setDropoffLocation(locationData);

//     // The RideMap component will handle centering and marker placement
//   };
//   // Handle current location from map button
//   const handleCurrentLocationFound = (locationData) => {
//     const { lat, lng } = locationData;

//     // Use the enhanced reverse geocoding
//     reverseGeocode(lat, lng).then(addressData => {
//       const newLocationObj = {
//         lat,
//         lon: lng,
//         name: addressData.name,
//         address: addressData.address || {}
//       };

//       if (activeInput === "pickup") {
//         setPickupLocation(newLocationObj);
//         setPickupQuery(addressData.name);
//         setActiveInput("dropoff");
//       } else {
//         setDropoffLocation(newLocationObj);
//         setDropoffQuery(addressData.name);
//       }
//     }).catch(err => {
//       console.error("Failed to get address for current location:", err);
//       // Still set the location with coordinates
//       const newLocationObj = {
//         lat,
//         lon: lng,
//         name: `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
//         address: {}
//       };

//       if (activeInput === "pickup") {
//         setPickupLocation(newLocationObj);
//         setPickupQuery(newLocationObj.name);
//         setActiveInput("dropoff");
//       } else {
//         setDropoffLocation(newLocationObj);
//         setDropoffQuery(newLocationObj.name);
//       }
//     });
//   };

//   // Handle booking confirmation
//   const handleConfirmBooking = async () => {
//     if (!pickupLocation || !dropoffLocation || routeGeometry.length === 0) {
//       setError("Please select both pickup and drop-off locations.");
//       return;
//     }

//     setIsSubmitting(true);
//     setError("");

//     try {
//       const bookingData = {
//         pickupLocation: {
//           name: pickupLocation.name,
//           lat: pickupLocation.lat,
//           lng: pickupLocation.lon,
//         },
//         dropoffLocation: {
//           name: dropoffLocation.name,
//           lat: dropoffLocation.lat,
//           lng: dropoffLocation.lon,
//         },
//         routeGeometry: routeGeometry.map((coord) => ({
//           lat: coord[0],
//           lng: coord[1],
//         })),
//         distance,
//         duration,
//         price: fare,
//         rideType,
//         bookingStatus: "pending",
//       };

//       const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
//       const response = await fetch(`${apiUrl}/bookings`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(bookingData),
//       });

//       const result = await response.json();

//       if (result.success) {
//         router.push(`/dashboard/passenger/book-ride?bookingId=${result.booking._id}`);
//       } else {
//         setError(result.message || "Failed to confirm booking. Please try again.");
//       }
//     } catch (err) {
//       console.error("Booking submission error:", err);
//       setError("An error occurred while confirming your booking. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="page-container min-h-screen bg-gray-50 pt-38 pb-20 px-4 sm:px-6 lg:px-8">
//       <NetworkStatus />
//       <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

//         {/* LEFT SIDE: Enhanced Form Section */}
//         <div className={`form-container w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 flex flex-col gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-fit ${(activeInput === "pickup" || activeInput === "dropoff") ? 'has-active-dropdown' : ''
//           }`}>

//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Book a Ride</h1>
//             <p className="text-gray-500 text-sm">Real-time navigation & dynamic pricing with accurate location mapping.</p>
//           </div>

//           {/* Global Error Display */}
//           {error && (
//             <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//               </svg>
//               {error}
//             </div>
//           )}

//           {/* Enhanced Location Inputs */}
//           <div className="flex flex-col gap-5 relative">
//             <div className="absolute left-[15px] top-[45px] bottom-[45px] w-[2px] bg-gray-200 z-0"></div>

//             {/* Pickup Location Input */}
//             <div className="flex items-start gap-4 relative">
//               <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
//                 <div className="w-3 h-3 rounded-full bg-green-600"></div>
//               </div>
//               <LocationInput
//                 label="Pickup Location"
//                 placeholder="E.g., Dhanmondi, Dhaka"
//                 value={pickupQuery}
//                 onChange={setPickupQuery}
//                 onLocationSelect={handlePickupLocationSelect}
//                 type="pickup"
//                 isActive={activeInput === "pickup"}
//                 onFocus={() => setActiveInput("pickup")}
//                 className="flex-1"
//                 showYourLocationButton={true}
//                 onYourLocationClick={handlePickupYourLocation}
//               />
//             </div>

//             {/* Drop-off Location Input */}
//             <div className="flex items-start gap-4 relative">
//               <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
//                 <div className="w-3 h-3 rounded-full bg-red-600"></div>
//               </div>
//               <LocationInput
//                 label="Drop-off Location"
//                 placeholder="E.g., Gulshan 2, Dhaka"
//                 value={dropoffQuery}
//                 onChange={setDropoffQuery}
//                 onLocationSelect={handleDropoffLocationSelect}
//                 type="dropoff"
//                 isActive={activeInput === "dropoff"}
//                 onFocus={() => setActiveInput("dropoff")}
//                 className="flex-1"
//                 showYourLocationButton={true}
//                 onYourLocationClick={handleDropoffYourLocation}
//               />
//             </div>
//           </div>

//           <div className="h-[1px] w-full bg-gray-100 my-2"></div>

//           {/* Ride Types */}
//           <div className="flex flex-col gap-4">
//             <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//               <DollarSign className="w-5 h-5" />
//               Available Rides
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//               {Object.entries(FARE_RATES).map(([key, data]) => (
//                 <button
//                   key={key}
//                   onClick={() => setRideType(key)}
//                   className={`p-4 border-2 rounded-2xl flex flex-col items-center justify-center transition-all ${rideType === key
//                     ? "border-black bg-gray-50 shadow-sm transform scale-[1.02]"
//                     : "border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-500"
//                     }`}
//                 >
//                   <span className="text-2xl mb-1">{data.icon}</span>
//                   <span className={`font-semibold capitalize ${rideType === key ? "text-gray-900" : "text-gray-700"}`}>{data.name}</span>
//                   <span className="text-xs text-gray-500 mt-0.5">{data.perKm} ৳/km</span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Enhanced Pricing & Route Summary */}
//           {isRouting ? (
//             <div className="bg-gray-50 p-6 rounded-2xl mt-2 border border-gray-200 flex flex-col items-center justify-center text-center">
//               <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
//               <span className="text-gray-600 font-medium">Calculating optimal route...</span>
//               <span className="text-gray-500 text-sm mt-1">This may take a few seconds</span>
//             </div>
//           ) : routeGeometry && routeGeometry.length > 0 ? (
//             <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl mt-2 shadow-lg relative overflow-hidden">
//               <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>

//               <div className="flex gap-4 mb-4 relative z-10 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
//                 <div className="flex-1 flex flex-col items-center justify-center border-r border-white/20">
//                   <Clock className="w-4 h-4 text-gray-300 mb-1" />
//                   <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Time</span>
//                   <span className="font-bold text-lg">{duration} <span className="text-sm font-normal">min</span></span>
//                 </div>
//                 <div className="flex-1 flex flex-col items-center justify-center">
//                   <Route className="w-4 h-4 text-gray-300 mb-1" />
//                   <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Distance</span>
//                   <span className="font-bold text-lg">{distance} <span className="text-sm font-normal">km</span></span>
//                 </div>
//               </div>

//               <div className="flex justify-between items-end relative z-10 pt-2 border-t border-white/10">
//                 <span className="text-gray-300 font-medium">Estimated Fare</span>
//                 <span className="font-bold text-4xl text-emerald-400">{fare} <span className="text-2xl">৳</span></span>
//               </div>
//             </div>
//           ) : (
//             <div className="bg-gray-50 p-5 rounded-2xl mt-2 border border-gray-100 border-dashed flex items-center justify-center text-center px-8">
//               <div className="text-center">
//                 <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
//                 <span className="text-gray-400 text-sm">Select both locations to calculate distance and fare</span>
//               </div>
//             </div>
//           )}

//           {surge.multiplier > 1.0 && (
//             <div className="mb-4 flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl animate-in fade-in slide-in-from-top-2 duration-500">
//               <div className="bg-orange-500 p-2 rounded-lg text-white">
//                 <span className="text-lg">{surge.icon}</span>
//               </div>
//               <div>
//                 <p className="text-orange-400 text-[10px] font-bold uppercase tracking-wider">Demand is high</p>
//                 <p className="text-white text-sm font-semibold">{surge.label} Applied (x{surge.multiplier})</p>
//               </div>
//             </div>
//           )}

//           {/* Enhanced Confirm Button */}
//           <button
//             onClick={handleConfirmBooking}
//             disabled={!routeGeometry || routeGeometry.length === 0 || isSubmitting}
//             className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:hover:from-blue-600 disabled:hover:to-blue-700 shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] disabled:shadow-none mt-2 active:scale-[0.98] flex items-center justify-center gap-2"
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin" />
//                 Confirming Booking...
//               </>
//             ) : (
//               <>
//                 <MapPin className="w-5 h-5" />
//                 Confirm Booking
//               </>
//             )}
//           </button>
//         </div>

//         {/* RIGHT SIDE: Enhanced Map View */}
//         <div className="w-full flex-1 h-[500px] lg:h-auto min-h-[600px] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-200 relative z-0">
//           <RideMap
//             pickup={pickupLocation}
//             dropoff={dropoffLocation}
//             routeGeometry={routeGeometry}
//             durationMin={duration}
//             onMapClick={handleMapClick}
//             showCurrentLocationButton={true}
//             onCurrentLocationFound={handleCurrentLocationFound}
//           />

//           {/* Map Status Indicator */}
//           {(pickupLocation || dropoffLocation) && (
//             <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-200">
//               <div className="flex items-center gap-2 text-sm">
//                 {pickupLocation && (
//                   <div className="flex items-center gap-1">
//                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                     <span className="text-gray-600">Pickup</span>
//                   </div>
//                 )}
//                 {dropoffLocation && (
//                   <div className="flex items-center gap-1">
//                     <div className="w-2 h-2 bg-red-500 rounded-full"></div>
//                     <span className="text-gray-600">Drop-off</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }