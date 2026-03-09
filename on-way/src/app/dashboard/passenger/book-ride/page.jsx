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
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";

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

// Mock Database for Locations to simulate search
const LOCATION_DB = [
  { name: "Gulshan 1, Dhaka", coords: [23.7806, 90.4161] },
  { name: "Banani, Dhaka", coords: [23.7915, 90.4072] },
  { name: "Dhanmondi, Dhaka", coords: [23.7461, 90.3742] },
  { name: "Mirpur 10, Dhaka", coords: [23.8069, 90.3687] },
  { name: "Uttara, Dhaka", coords: [23.8759, 90.3795] },
  { name: "Motijheel, Dhaka", coords: [23.7250, 90.4187] },
];

const VEHICLE_TYPES = [
  { id: "bike", name: "Bike", icon: Bike, time: "3 mins", multiplier: 1, capacity: 1 },
  { id: "car", name: "Regular Car", icon: Car, time: "5 mins", multiplier: 2.5, capacity: 4 },
  { id: "premium", name: "Premium Car", icon: CarFront, time: "8 mins", multiplier: 4, capacity: 4 },
];

export default function BookRide() {
  // State
  const [pickup, setPickup] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoff, setDropoff] = useState("");
  const [dropoffCoords, setDropoffCoords] = useState(null);

  const [activeInput, setActiveInput] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [scheduleType, setScheduleType] = useState("now"); // "now" | "later"
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState("wallet");

  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Handle Location Search
  const handleLocationSearch = (query, type) => {
    if (type === 'pickup') setPickup(query);
    else setDropoff(query);

    if (query.length > 2) {
      const filtered = LOCATION_DB.filter(loc =>
        loc.name.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectLocation = (loc, type) => {
    if (type === 'pickup') {
      setPickup(loc.name);
      setPickupCoords(loc.coords);
    } else {
      setDropoff(loc.name);
      setDropoffCoords(loc.coords);
    }
    setSuggestions([]);
    setActiveInput(null);
  };

  // Mock Fare Calculation whenever locations change
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      // Very basic mock distance calc (Euclidean just for UI display, actual would be via routing API)
      const latDiff = pickupCoords[0] - dropoffCoords[0];
      const lngDiff = pickupCoords[1] - dropoffCoords[1];
      const mockDist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // rough km conversion

      const distKm = Math.max(1.5, mockDist).toFixed(1);
      const estTime = Math.max(5, Math.floor(mockDist * 4)); // rough 15km/h speed in city

      setDistance(distKm);
      setDuration(estTime);
    } else {
      setDistance(null);
      setDuration(null);
    }
  }, [pickupCoords, dropoffCoords]);

  const applyPromo = () => {
    if (promoCode.toUpperCase() === "ONWAY50") {
      setDiscount(0.5); // 50TK off logic check later
      toast.success("Promo code applied!");
    } else {
      setDiscount(0);
      toast.error("Invalid promo code");
    }
  };

  const calculateFare = (multiplier) => {
    if (!distance) return 0;
    const baseFare = 40;
    const perKm = 15;
    const fare = (baseFare + (parseFloat(distance) * perKm)) * multiplier;
    return Math.floor(fare - (fare * discount));
  };

  const handleBookRide = () => {
    if (!pickupCoords || !dropoffCoords) {
      toast.error("Please select pickup and drop-off locations");
      return;
    }
    if (!selectedVehicle) {
      toast.error("Please select a vehicle type");
      return;
    }
    if (scheduleType === "later" && (!scheduleDate || !scheduleTime)) {
      toast.error("Please select schedule date and time");
      return;
    }

    setIsBooking(true);
    // Simulate API call
    setTimeout(() => {
      setIsBooking(false);
      setBookingSuccess(true);
      toast.success("Ride booked successfully!");
    }, 2000);
  };

  if (bookingSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white/60 backdrop-blur-xl rounded-[40px] p-8 border border-white/40 shadow-xl text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 text-[#2FCA71] rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Ride Confirmed!</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Your driver is on the way. You can track their real-time location in your active rides panel.
        </p>
        <div className="flex gap-4">
          <Link href="/dashboard/passenger/active-ride" className="bg-[#2FCA71] text-white px-6 py-3 rounded-full font-medium hover:bg-[#25a55b] transition">
            Track Ride
          </Link>
          <button onClick={() => {
            setBookingSuccess(false);
            setPickup(""); setDropoff(""); setPickupCoords(null); setDropoffCoords(null);
            setSelectedVehicle(null);
          }} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition">
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">

      {/* LEFT: MAP (Sticky) */}
      <div className="w-full lg:w-1/2 h-full order-1 lg:order-2 rounded-3xl overflow-hidden relative shadow-xl border border-white/50">
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur shadow p-3 rounded-xl">
          <button
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#2FCA71]"
            onClick={() => {
              // Auto detect mock
              toast.success("Location detected!");
              selectLocation(LOCATION_DB[0], 'pickup');
            }}
          >
            <Navigation size={16} />
            Auto-detect
          </button>
        </div>
        <DynamicMap pickup={pickupCoords} dropoff={dropoffCoords} />
      </div>

      {/* RIGHT: BOOKING PANEL (Scrollable) */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto pr-2 no-scrollbar order-2 lg:order-1 flex flex-col gap-6">

        {/* 1. LOCATIONS CARD */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-sm relative">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Plan your journey</h2>

          <div className="relative flex gap-4">
            {/* Timeline connectors */}
            <div className="flex flex-col items-center mt-2.5">
              <div className="w-4 h-4 rounded-full bg-blue-100 border-4 border-blue-500 z-10" />
              <div className="w-0.5 h-12 bg-gray-200" />
              <div className="w-4 h-4 rounded-full bg-green-100 border-4 border-[#2FCA71] z-10" />
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {/* Pickup Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter pickup location"
                  value={pickup}
                  onChange={(e) => handleLocationSearch(e.target.value, 'pickup')}
                  onFocus={() => setActiveInput('pickup')}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
                />
              </div>

              {/* Drop-off Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Where to?"
                  value={dropoff}
                  onChange={(e) => handleLocationSearch(e.target.value, 'dropoff')}
                  onFocus={() => setActiveInput('dropoff')}
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2FCA71]/50 focus:border-[#2FCA71] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {suggestions.length > 0 && activeInput && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[50]"
              >
                {suggestions.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectLocation(loc, activeInput)}
                    className="flex flex-col w-full text-left px-5 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                  >
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" /> {loc.name}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ONLY SHOW REST IF LOCATIONS ARE SET */}
        {distance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* TRIP SUMMARY */}
            <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Navigation size={18} />
                <span className="font-semibold">{distance} km</span>
              </div>
              <div className="w-px h-6 bg-blue-200" />
              <div className="flex items-center gap-2 text-blue-800">
                <Clock size={18} />
                <span className="font-semibold">~{duration} mins</span>
              </div>
            </div>

            {/* 2. SCHEDULING */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">When do you want to leave?</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setScheduleType("now")}
                  className={`flex-1 py-3 rounded-xl font-medium border transition-all ${scheduleType === "now" ? "bg-[#2FCA71]/10 border-[#2FCA71] text-[#2FCA71]" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  Ride Now
                </button>
                <button
                  onClick={() => setScheduleType("later")}
                  className={`flex-1 py-3 items-center justify-center flex gap-2 rounded-xl font-medium border transition-all ${scheduleType === "later" ? "bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Calendar size={18} />
                  Schedule Later
                </button>
              </div>

              {scheduleType === "later" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex gap-4 mt-4">
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </motion.div>
              )}
            </div>

            {/* 3. VEHICLE SELECTION */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Available Rides</h3>
              <div className="space-y-3">
                {VEHICLE_TYPES.map(vehicle => {
                  const Icon = vehicle.icon;
                  const isSelected = selectedVehicle?.id === vehicle.id;
                  const fare = calculateFare(vehicle.multiplier);

                  return (
                    <button
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isSelected
                        ? "border-[#2FCA71] bg-[#2FCA71]/5 ring-2 ring-[#2FCA71]/20 shadow-md transform scale-[1.01]"
                        : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${isSelected ? 'bg-[#2FCA71]/20 text-[#2FCA71]' : 'bg-gray-100 text-gray-600'}`}>
                          <Icon size={24} />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-gray-800">{vehicle.name}</h4>
                          <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                            {vehicle.time} away • {vehicle.capacity} seats
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-800">৳{fare}</span>
                        {discount > 0 && <div className="text-xs text-[#2FCA71] font-medium mt-0.5">Discount applied</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. EXTRAS: PROMO & PAYMENT */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-sm space-y-6">

              {/* Promo */}
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <Ticket size={16} /> Promo Code
                </label>
                <div className="flex gap-2 relative">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="ONWAY50"
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2FCA71uppercase]"
                  />
                  <button onClick={applyPromo} className="px-6 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition">
                    Apply
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                  <CreditCard size={16} /> Payment Method
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setPaymentMethod('wallet')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border ${paymentMethod === 'wallet' ? 'border-[#2FCA71] bg-[#2FCA71]/10 text-[#2FCA71]' : 'bg-white border-gray-100 text-gray-600'}`}
                  >
                    <Wallet size={20} className="mb-1" />
                    <span className="text-xs font-semibold">Wallet</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border ${paymentMethod === 'cash' ? 'border-[#2FCA71] bg-[#2FCA71]/10 text-[#2FCA71]' : 'bg-white border-gray-100 text-gray-600'}`}
                  >
                    <Coins size={20} className="mb-1" />
                    <span className="text-xs font-semibold">Cash</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border ${paymentMethod === 'card' ? 'border-[#2FCA71] bg-[#2FCA71]/10 text-[#2FCA71]' : 'bg-white border-gray-100 text-gray-600'}`}
                  >
                    <CreditCard size={20} className="mb-1" />
                    <span className="text-xs font-semibold">Card</span>
                  </button>
                </div>
              </div>

            </div>

            {/* ACTION BUTTON */}
            <button
              onClick={handleBookRide}
              disabled={!selectedVehicle || isBooking}
              className={`w-full py-5 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-xl transition-all duration-300
                ${(!selectedVehicle || isBooking) ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-[#2FCA71] hover:bg-[#25a55b] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(47,202,113,0.3)]'}
              `}
            >
              {isBooking ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  {scheduleType === 'now' ? 'Confirm Booking' : 'Schedule Ride'}
                  <ChevronRight size={20} />
                </>
              )}
            </button>

          </motion.div>
        )}
      </div>
    </div>
  );
}