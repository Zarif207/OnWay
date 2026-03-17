"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Navigation,
  Clock,
  CreditCard,
  CheckCircle2,
  Ticket,
  CarFront,
  Bike,
  Car,
  Calendar,
  Wallet,
  Coins,
  ChevronRight,
  Loader2,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import axios from "axios";
import { getPassengerSocket, disconnectPassengerSocket } from "@/lib/socket";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Dynamically import Map to prevent SSR issues with leaflet
const DynamicMap = dynamic(() => import("./_components/DynamicMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] md:h-full min-h-[400px] bg-white/50 backdrop-blur-md animate-pulse rounded-3xl flex items-center justify-center border border-white/40 shadow-lg">
      <div className="flex flex-col items-center gap-3">
        <MapPin className="text-[#2FCA71] h-8 w-8 animate-bounce" />
        <span className="text-gray-500 font-medium tracking-wide">Loading Map...</span>
      </div>
    </div>
  ),
});

const VEHICLE_META = {
  bike: { icon: Bike, multiplier: 1, capacity: 1, label: "Bike" },
  car: { icon: Car, multiplier: 2.5, capacity: 4, label: "Regular Car" },
  premium: { icon: CarFront, multiplier: 4, capacity: 4, label: "Premium Car" }
};

export default function BookRide() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const passengerId = session?.user?.id;

  // State
  const [pickup, setPickup] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoff, setDropoff] = useState("");
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [nearbyRiders, setNearbyRiders] = useState({}); // riderId -> { lat, lng, ... }

  // Initial geocoding if params exist
  useEffect(() => {
    const p = searchParams.get("pickup");
    const d = searchParams.get("dropoff");

    const geocode = async (query, setter, coordsSetter) => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=bd&limit=1`;
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'OnWay-App-v1.0'
          }
        });
        const data = await res.json();
        if (data.length > 0) {
          setter(data[0].display_name);
          coordsSetter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setter(query); // Fallback to raw text
        }
      } catch (err) {
        console.error("Auto-geocoding error:", err);
        setter(query);
      }
    };

    if (p) geocode(p, setPickup, setPickupCoords);
    if (d) geocode(d, setDropoff, setDropoffCoords);
  }, [searchParams]);

  // Socket Integration for live rider tracking
  // Fetch Nearby Riders and listen for socket updates
  useEffect(() => {
    const passengerId = session?.user?.id;
    if (!passengerId) return;

    const fetchNearby = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/riders/nearby?excludeId=${passengerId}`);
        if (res.data.success) {
          const ridersMap = {};
          res.data.data.forEach(r => {
            ridersMap[r.id] = r;
          });
          setNearbyRiders(ridersMap);
        }
      } catch (error) {
        console.error("Failed to fetch nearby riders:", error);
      }
    };

    fetchNearby();

    // Listen for socket updates
    const socket = getPassengerSocket(passengerId);
    if (socket) {
      socket.on("riders:update", (updatedRiders) => {
        setNearbyRiders(prev => {
          const newMap = { ...prev };
          updatedRiders.forEach(r => {
            if (r.id !== passengerId) {
              newMap[r.id] = {
                ...newMap[r.id],
                lat: r.lat,
                lng: r.lng,
                id: r.id
              };
            }
          });
          return newMap;
        });
      });
    }

    return () => {
      if (socket) socket.off("riders:update");
    };
  }, [session]);

  const [activeInput, setActiveInput] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const [estimates, setEstimates] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [scheduleType, setScheduleType] = useState("now"); // "now" | "later"
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState("wallet");

  const [isBooking, setIsBooking] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Handle Location Search (Nominatim API for real addresses)
  const handleLocationSearch = async (query, type) => {
    if (type === 'pickup') setPickup(query);
    else setDropoff(query);

    if (query.length > 2) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=bd&limit=5`;
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'OnWay-App-v1.0'
          }
        });
        const data = await res.json();
        const formatted = data.map(item => ({
          name: item.display_name,
          coords: [parseFloat(item.lat), parseFloat(item.lon)]
        }));
        setSuggestions(formatted);
      } catch (err) {
        console.error("Search error:", err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectLocation = (loc, type) => {
    if (type === 'pickup') {
      setPickup(loc.name.split(',')[0]);
      setPickupCoords(loc.coords);
    } else {
      setDropoff(loc.name.split(',')[0]);
      setDropoffCoords(loc.coords);
    }
    setSuggestions([]);
    setActiveInput(null);
  };

  // Fetch Fare Estimates from Backend
  useEffect(() => {
    const fetchEstimates = async () => {
      if (pickupCoords && dropoffCoords) {
        setIsCalculating(true);
        try {
          // Calculate distance (Euclidean approx for display)
          const latDiff = pickupCoords[0] - dropoffCoords[0];
          const lngDiff = pickupCoords[1] - dropoffCoords[1];
          const distKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111 * 1.2;
          const durMin = Math.round(distKm * 4);

          setDistance(distKm.toFixed(1));
          setDuration(durMin);

          const res = await axios.post(`${API_BASE_URL}/bookings/fare-estimate`, {
            distance: distKm,
            duration: durMin
          });

          if (res.data.success) {
            setEstimates(res.data.estimates);
            setSelectedVehicle(res.data.estimates[0]); // Default to first
          }
        } catch (error) {
          console.error("Fare estimate failed:", error);
        } finally {
          setIsCalculating(false);
        }
      } else {
        setDistance(null);
        setDuration(null);
        setEstimates([]);
      }
    };

    fetchEstimates();
  }, [pickupCoords, dropoffCoords]);

  const applyPromo = () => {
    if (promoCode.toUpperCase() === "ONWAY50") {
      setDiscount(50);
      toast.success("Promo code applied!");
    } else {
      setDiscount(0);
      toast.error("Invalid promo code");
    }
  };

  const getFinalPrice = (veh) => {
    if (!veh) return 0;
    return Math.max(10, veh.estimatedPrice - discount);
  };

  const handleBookRide = async () => {
    if (!passengerId) {
      toast.error("Please login to book a ride");
      return;
    }
    if (!pickupCoords || !dropoffCoords) {
      toast.error("Please select pickup and drop-off locations");
      return;
    }
    if (!selectedVehicle) {
      toast.error("Please select a vehicle type");
      return;
    }

    setIsBooking(true);
    try {
      const payload = {
        passengerId,
        pickupLocation: {
          address: pickup,
          lat: pickupCoords[0],
          lng: pickupCoords[1]
        },
        dropoffLocation: {
          address: dropoff,
          lat: dropoffCoords[0],
          lng: dropoffCoords[1]
        },
        vehicleType: selectedVehicle.type,
        distance: parseFloat(distance),
        duration,
        price: getFinalPrice(selectedVehicle),
        paymentMethod,
        routeGeometry: [pickupCoords, dropoffCoords],
        bookingStatus: "searching"
      };

      const res = await axios.post(`${API_BASE_URL}/bookings`, payload);

      if (res.data.success) {
        toast.success("Ride requested! Searching for drivers...");
        router.push(`/dashboard/passenger/active-ride?bookingId=${res.data.booking._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

  // Map Click Handler
  const onMapClick = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'OnWay-App-v1.0'
        }
      });
      const data = await res.json();
      const address = data.display_name.split(',')[0];
      const coords = [lat, lng];

      if (activeInput === 'pickup' || (!pickupCoords && activeInput !== 'dropoff')) {
        setPickup(address);
        setPickupCoords(coords);
      } else {
        setDropoff(address);
        setDropoffCoords(coords);
      }
      toast.success("Location selected from map");
    } catch (err) {
      console.error("Reverse geocode error:", err);
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 h-full pb-20">

      {/* LEFT: BOOKING PANEL (Scrollable) */}
      <div className="order-2 lg:order-1 flex flex-col gap-6 overflow-y-auto pr-2 no-scrollbar">

        {/* 1. LOCATIONS CARD */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-visible">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-2 w-12 bg-[#2FCA71] rounded-full" />
            <h2 className="text-xl font-black text-secondary uppercase tracking-widest">Plan Your Journey</h2>
          </div>

          <div className="relative flex gap-4">
            <div className="flex flex-col items-center mt-3">
              <div className="w-5 h-5 rounded-full bg-blue-50 border-4 border-blue-500 z-10 shadow-sm" />
              <div className="w-0.5 flex-grow bg-gradient-to-b from-blue-500 to-[#2FCA71] my-1" />
              <div className="w-5 h-5 rounded-full bg-green-50 border-4 border-[#2FCA71] z-10 shadow-sm" />
            </div>

            <div className="flex-1 flex flex-col gap-5">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Enter pickup location"
                  value={pickup}
                  onChange={(e) => handleLocationSearch(e.target.value, 'pickup')}
                  onFocus={() => setActiveInput('pickup')}
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-secondary focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2FCA71] transition-colors">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Where to?"
                  value={dropoff}
                  onChange={(e) => handleLocationSearch(e.target.value, 'dropoff')}
                  onFocus={() => setActiveInput('dropoff')}
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-secondary focus:outline-none focus:ring-4 focus:ring-[#2FCA71]/10 focus:border-[#2FCA71] focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {suggestions.length > 0 && activeInput && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute left-8 right-8 mt-2 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-[100]"
              >
                {suggestions.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectLocation(loc, activeInput)}
                    className="flex items-start gap-4 w-full text-left px-6 py-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <div className="mt-1 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-secondary text-sm line-clamp-1">{loc.name.split(',')[0]}</p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider line-clamp-1">{loc.name}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {distance && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                    <Navigation size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Distance</p>
                    <p className="text-xl font-black text-secondary tracking-tight">{distance} <span className="text-xs">KM</span></p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                    <Clock size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Est. Time</p>
                    <p className="text-xl font-black text-secondary tracking-tight">{duration} <span className="text-xs">MINS</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-secondary uppercase tracking-widest mb-6">Available Rides</h3>
                <div className="space-y-4">
                  {estimates.map(vehicle => {
                    const meta = VEHICLE_META[vehicle.type];
                    const Icon = meta.icon;
                    const isSelected = selectedVehicle?.type === vehicle.type;
                    return (
                      <button
                        key={vehicle.type}
                        onClick={() => setSelectedVehicle(vehicle)}
                        className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all ${isSelected ? "border-[#2FCA71] bg-[#2FCA71]/5 ring-4 ring-[#2FCA71]/5" : "border-gray-100 bg-white hover:bg-gray-50"}`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center ${isSelected ? 'bg-[#2FCA71] text-white' : 'bg-gray-50 text-gray-400'}`}>
                            <Icon size={32} />
                          </div>
                          <div className="text-left">
                            <h4 className="font-black text-secondary text-lg">{meta.label}</h4>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{meta.capacity} Seats</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-secondary tracking-tighter">৳{getFinalPrice(vehicle)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-8">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 block mb-3">Promo Code</label>
                  <div className="flex gap-3">
                    <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="ONWAY50" className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-secondary uppercase" />
                    <button onClick={applyPromo} className="px-8 bg-secondary text-white rounded-2xl text-xs font-black uppercase tracking-widest">Apply</button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 block mb-4">Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['wallet', 'cash', 'card'].map(pm => (
                      <button key={pm} onClick={() => setPaymentMethod(pm)} className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border transition-all ${paymentMethod === pm ? 'bg-secondary text-white' : 'bg-white text-gray-400'}`}>
                        <span className="text-[9px] font-black uppercase tracking-widest">{pm}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleBookRide} disabled={!selectedVehicle || isBooking} className={`w-full h-20 rounded-[2rem] text-white font-black text-lg uppercase tracking-[0.2em] flex items-center justify-center gap-4 ${(!selectedVehicle || isBooking) ? 'bg-gray-200' : 'bg-[#2FCA71]'}`}>
                {isBooking ? <Loader2 className="animate-spin" /> : "Confirm Booking"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="order-1 lg:order-2 h-[400px] lg:h-full min-h-[400px] rounded-[3rem] overflow-hidden sticky top-0 border border-gray-100 shadow-2xl">
        <DynamicMap pickup={pickupCoords} dropoff={dropoffCoords} nearbyRiders={Object.values(nearbyRiders)} onMapClick={onMapClick} />
      </div>
    </div>
  );
}