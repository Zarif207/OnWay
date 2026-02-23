"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { getDrivingRoute } from "@/utils/routingService";
import { calculateFare, FARE_RATES } from "@/utils/fareCalculator";

// Dynamically import the Leaflet map (disables SSR)
const RideMap = dynamic(() => import("@/components/Map/RideMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-2xl animate-pulse">
      <span className="text-gray-500 font-medium tracking-wide">Loading Route Map...</span>
    </div>
  ),
});

export default function BookRidePage() {
  const [pickupQuery, setPickupQuery] = useState("");
  const [dropoffQuery, setDropoffQuery] = useState("");
  
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  
  // Real Route Data State
  const [routeGeometry, setRouteGeometry] = useState([]);
  const [distance, setDistance] = useState(0);     // In KM
  const [duration, setDuration] = useState(0);     // In Minutes
  
  const [rideType, setRideType] = useState("standard");
  const [fare, setFare] = useState(0);

  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDropoff, setIsSearchingDropoff] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [error, setError] = useState("");

  // Track which input the user is focusing on to know where to put the map click coordinate
  const [activeInput, setActiveInput] = useState("pickup");

  // 1. Fetch Real Route when locations change
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
          } else {
            setError("Could not find a driving route between these locations.");
            resetRouteState();
          }
        } catch (err) {
          setError(err.message || "Failed to fetch route details.");
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

  // 2. Update Fare dynamically when distance or rideType changes
  useEffect(() => {
    setFare(calculateFare(distance, rideType));
  }, [distance, rideType]);

  const resetRouteState = () => {
    setDistance(0);
    setDuration(0);
    setRouteGeometry([]);
    setFare(0);
  };

  // Geocoding helper
  const geocodeAddress = async (query) => {
    if (!query.trim()) return null;
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: query + ", Bangladesh",
          format: "json",
          limit: 1,
        },
      });
      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
          name: response.data[0].display_name,
        };
      }
      return null;
    } catch (err) {
      console.error("Geocoding failed:", err);
      return null;
    }
  };

  const handleSearchPickup = async () => {
    if (!pickupQuery) return;
    setIsSearchingPickup(true);
    setError("");
    const result = await geocodeAddress(pickupQuery);
    if (result) {
      setPickupLocation(result);
    } else {
      setError("Pickup location not found. Try a more general area.");
    }
    setIsSearchingPickup(false);
  };

  const handleSearchDropoff = async () => {
    if (!dropoffQuery) return;
    setIsSearchingDropoff(true);
    setError("");
    const result = await geocodeAddress(dropoffQuery);
    if (result) {
      setDropoffLocation(result);
    } else {
      setError("Drop-off location not found. Try a more general area.");
    }
    setIsSearchingDropoff(false);
  };

  // Reverse Geocoding helper
  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
        params: {
          lat: lat,
          lon: lon,
          format: "json",
        },
      });
      if (response.data && response.data.display_name) {
        return response.data.display_name;
      }
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`; // fallback to coords
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  };

  // Get Current Location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const addressName = await reverseGeocode(latitude, longitude);
          const name = addressName && addressName !== `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
            ? addressName 
            : "Current Location";
          
          const newLocationObj = {
            lat: latitude,
            lon: longitude,
            name: name,
          };

          if (activeInput === "pickup") {
            setPickupLocation(newLocationObj);
            setPickupQuery(name);
            setActiveInput("dropoff");
          } else {
            setDropoffLocation(newLocationObj);
            setDropoffQuery(name);
          }
        } catch (err) {
          setError("Failed to get address for current location.");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Failed to get current location. Please check your permissions.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Handle click on the map
  const handleMapClick = async (coords) => {
    setError("");
    const addressName = await reverseGeocode(coords.lat, coords.lon);
    
    const newLocationObj = {
      lat: coords.lat,
      lon: coords.lon,
      name: addressName,
    };

    if (activeInput === "pickup") {
      setPickupLocation(newLocationObj);
      setPickupQuery(addressName);
      setActiveInput("dropoff"); // Auto-switch focus to dropoff next
    } else {
      setDropoffLocation(newLocationObj);
      setDropoffQuery(addressName);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* LEFT SIDE: Form Section */}
        <div className="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 flex flex-col gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-fit">
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Book a Ride</h1>
            <p className="text-gray-500 text-sm">Real-time navigation & dynamic pricing.</p>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Locations Input */}
          <div className="flex flex-col gap-5 relative">
            <div className="absolute left-[15px] top-[45px] bottom-[45px] w-[2px] bg-gray-200 z-0"></div>

            {/* Pickup */}
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className={`text-xs font-semibold uppercase tracking-wider transition-colors ${activeInput === 'pickup' ? 'text-blue-600' : 'text-gray-500'}`}>
                  Pickup Location {activeInput === "pickup" && "(Click Map)"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="E.g., Dhanmondi, Dhaka"
                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${activeInput === "pickup" ? "border-blue-400 bg-blue-50/30" : "border-gray-200"}`}
                    value={pickupQuery}
                    onChange={(e) => setPickupQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchPickup()}
                    onFocus={() => setActiveInput("pickup")}
                  />
                  <button
                    onClick={handleSearchPickup}
                    disabled={isSearchingPickup || !pickupQuery}
                    className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 font-medium"
                  >
                    {isSearchingPickup ? "..." : "Find"}
                  </button>
                </div>
              </div>
            </div>

            {/* Drop-off */}
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className={`text-xs font-semibold uppercase tracking-wider transition-colors ${activeInput === 'dropoff' ? 'text-red-600' : 'text-gray-500'}`}>
                  Drop-off Location {activeInput === "dropoff" && "(Click Map)"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="E.g., Gulshan 2, Dhaka"
                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${activeInput === "dropoff" ? "border-red-400 bg-red-50/30" : "border-gray-200"}`}
                    value={dropoffQuery}
                    onChange={(e) => setDropoffQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchDropoff()}
                    onFocus={() => setActiveInput("dropoff")}
                  />
                  <button
                    onClick={handleSearchDropoff}
                    disabled={isSearchingDropoff || !dropoffQuery}
                    className="bg-red-600 text-white px-5 py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:hover:bg-red-600 font-medium"
                  >
                    {isSearchingDropoff ? "..." : "Find"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[1px] w-full bg-gray-100 my-2"></div>

          {/* Ride Types */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-gray-800">Available Rides</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(FARE_RATES).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setRideType(key)}
                  className={`p-4 border-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    rideType === key
                      ? "border-black bg-gray-50 shadow-sm transform scale-[1.02]"
                      : "border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-500"
                  }`}
                >
                  <span className="text-2xl mb-1">{data.icon}</span>
                  <span className={`font-semibold capitalize ${rideType === key ? "text-gray-900" : "text-gray-700"}`}>{data.name}</span>
                  <span className="text-xs text-gray-500 mt-0.5">{data.perKm} ৳/km</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Route Summary */}
          {isRouting ? (
             <div className="bg-gray-50 p-6 rounded-2xl mt-2 border border-gray-200 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <span className="text-gray-600 font-medium">Calculating best route...</span>
             </div>
          ) : routeGeometry && routeGeometry.length > 0 ? (
            <div className="bg-gray-900 text-white p-6 rounded-2xl mt-2 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
              
               <div className="flex gap-4 mb-4 relative z-10 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex-1 flex flex-col items-center justify-center border-r border-white/20">
                     <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Time</span>
                     <span className="font-bold text-lg">{duration} <span className="text-sm font-normal">min</span></span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                     <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Distance</span>
                     <span className="font-bold text-lg">{distance} <span className="text-sm font-normal">km</span></span>
                  </div>
               </div>

              <div className="flex justify-between items-end relative z-10 pt-2 border-t border-white/10">
                <span className="text-gray-300 font-medium">Estimated Fare</span>
                <span className="font-bold text-4xl text-emerald-400">{fare} <span className="text-2xl">৳</span></span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-5 rounded-2xl mt-2 border border-gray-100 border-dashed flex items-center justify-center text-center px-8">
              <span className="text-gray-400 text-sm">Select both locations to calculate distance and fare</span>
            </div>
          )}

          <button
            disabled={!routeGeometry || routeGeometry.length === 0}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] disabled:shadow-none mt-2 active:scale-[0.98]"
          >
            Confirm Booking
          </button>
        </div>

        {/* RIGHT SIDE: Map View */}
        <div className="w-full flex-1 h-[500px] lg:h-auto min-h-[600px] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-200 relative z-0 cursor-crosshair">
          <RideMap 
            pickup={pickupLocation} 
            dropoff={dropoffLocation} 
            routeGeometry={routeGeometry}
            durationMin={duration}
            onMapClick={handleMapClick}
          />

          {/* Current Location Button */}
          <button
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="absolute bottom-6 right-6 z-[1000] bg-white p-3 rounded-xl shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-100 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
            title="Get Current Location"
          >
            {isLocating ? (
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 group-hover:text-blue-600 transition-colors">
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2"></path>
                <circle cx="12" cy="12" r="8"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}