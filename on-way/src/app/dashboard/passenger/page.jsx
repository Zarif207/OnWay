"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import { getPassengerSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import {
  Bell, MapPin, ChevronRight, Car,
  Wallet, TicketPercent, CheckCircle2,
  XCircle, Clock, ArrowRight, Route,
  MoreHorizontal, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const StatusBadge = ({ status }) => {
  if (status === "completed")
    return <span className="px-2.5 py-1 bg-[#2FCA71]/10 text-[#2FCA71] text-xs font-bold uppercase tracking-wider rounded-md">Completed</span>;
  if (status === "cancelled")
    return <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider rounded-md">Cancelled</span>;
  if (status === "searching")
    return <span className="px-2.5 py-1 bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-md">Searching</span>;
  return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-md">{status}</span>;
};

const SCHEDULED_RIDES = [
  { id: 1, pickup: "Navana Tower, Gulshan Ave", dropoff: "Hazrat Shahjalal Int. Airport", date: "Tomorrow, 8:00 AM" },
];

export default function UserDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [stats, setStats] = useState([]);
  const [recentRides, setRecentRides] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const [isSearching, setIsSearching] = useState(false);
  const [matchedDriver, setMatchedDriver] = useState(null);
  const [rideStatus, setRideStatus] = useState(null);
  const socketRef = useRef(null);

  const passengerId = session?.user?.id;

  const handleRequestRide = () => {
    if (!pickup || !dropoff) {
      toast.error("Please enter both pickup and destination");
      return;
    }
    router.push(`/dashboard/passenger/book-ride?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Good Night";
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Fetch stats
  useEffect(() => {
    if (!passengerId) return;
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/bookings?passengerId=${passengerId}`);
        const rides = res.data.data || [];
        const completed = rides.filter(r => r.bookingStatus === "completed").length;
        const cancelled = rides.filter(r => r.bookingStatus === "cancelled").length;
        const totalDist = rides.reduce((acc, r) => acc + (r.distance || 0), 0);

        setStats([
          { label: "Total Rides", value: rides.length, icon: Car, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Completed", value: completed, icon: CheckCircle2, color: "text-[#2FCA71]", bg: "bg-[#2FCA71]/10" },
          { label: "Cancelled", value: cancelled, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
          { label: "Distance", value: `${totalDist.toFixed(1)} km`, icon: Route, color: "text-purple-500", bg: "bg-purple-50" },
        ]);
        setRecentRides(rides.slice(0, 3));
      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [passengerId]);

  // Socket integration
  useEffect(() => {
    if (!passengerId) return;

    const socket = getPassengerSocket(passengerId);
    socketRef.current = socket;

    // Passenger room এ join করো
    socket.emit("registerUser", { userId: passengerId, role: "passenger" });
    socket.emit("joinNotifications", passengerId);

    console.log("🔌 Passenger socket connected, id:", passengerId);

    // URL থেকে searching state নাও
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("searching") === "true") {
      setIsSearching(true);
      // URL clean করো
      window.history.replaceState({}, "", "/dashboard/passenger");
    }

    const handleRideAccepted = (data) => {
      console.log("✅ ride:accepted received:", JSON.stringify(data));
      setIsSearching(false);
      setMatchedDriver(data);
      setRideStatus("accepted");
      toast.success("Driver Found! Your ride is on the way.", {
        icon: "🚗",
        style: { borderRadius: "15px", background: "#011421", color: "#fff" },
        duration: 5000,
      });
    };

    const handleTripStarted = (data) => {
      const bookingId = data?.bookingId || data?.rideId;
      console.log("🚀 Trip started:", bookingId);
      setRideStatus("ongoing");
      toast.success("Trip Started!", {
        icon: "🛣️",
        style: { borderRadius: "15px", background: "#011421", color: "#fff" },
      });
      if (bookingId) {
        router.push(`/dashboard/passenger/active-ride?bookingId=${bookingId}`);
      }
    };

    const handleRideExpired = () => {
      console.log("⏰ Ride expired");
      setIsSearching(false);
      setRideStatus("expired");
      toast.error("No drivers found nearby. Please try again.", {
        style: { borderRadius: "15px" },
        duration: 5000,
      });
    };

    const handleDriverArrived = (data) => {
      console.log("📍 Driver arrived:", data);
      toast.success("Driver has arrived at your pickup point!", {
        icon: "📍",
        style: { borderRadius: "15px", background: "#011421", color: "#fff" },
        duration: 6000,
      });
    };

    const handlePriceOffer = (data) => {
      console.log("💸 Price offer received:", data);
      toast((t) => (
        <div className="flex flex-col gap-2">
          <p className="font-bold">Driver offered ৳{data.offeredPrice}</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                socket.emit("confirm_booking", {
                  rideId: data.rideId || data.bookingId,
                  driverId: data.driverId,
                });
                toast.dismiss(t.id);
              }}
              className="flex-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold"
            >
              Accept
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold"
            >
              Decline
            </button>
          </div>
        </div>
      ), { duration: 15000, style: { borderRadius: "15px" } });
    };

    socket.on("ride:accepted", handleRideAccepted);
    socket.on("rideAccepted", handleRideAccepted);
    socket.on("trip_started", handleTripStarted);
    socket.on("ride:started", handleTripStarted);
    socket.on("ride-expired", handleRideExpired);
    socket.on("driver:arrived", handleDriverArrived);
    socket.on("price_offer_received", handlePriceOffer);

    return () => {
      socket.off("ride:accepted", handleRideAccepted);
      socket.off("rideAccepted", handleRideAccepted);
      socket.off("trip_started", handleTripStarted);
      socket.off("ride:started", handleTripStarted);
      socket.off("ride-expired", handleRideExpired);
      socket.off("driver:arrived", handleDriverArrived);
      socket.off("price_offer_received", handlePriceOffer);
    };
  }, [passengerId, router]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 space-y-6 md:space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <img
            src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name || "passenger"}&background=2FCA71&color=fff&size=128`}
            alt="Profile"
            className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              {getGreeting()}, {session?.user?.name?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="text-gray-500 text-sm md:text-base font-medium">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <button className="p-3 bg-gray-50 text-gray-600 hover:text-[#2FCA71] hover:bg-[#2FCA71]/10 rounded-full transition relative">
          <Bell size={24} />
          <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6 text-gray-900">

          {/* Quick Ride */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#2FCA71]/10 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Where do you want to go today?</h2>
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:border-[#2FCA71] focus-within:ring-1 focus-within:ring-[#2FCA71] transition">
                <div className="p-2 bg-white text-gray-500 rounded-xl shadow-sm"><MapPin size={20} /></div>
                <input type="text" placeholder="Enter pickup location" value={pickup} onChange={(e) => setPickup(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none px-2 font-medium placeholder:font-normal" />
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:border-[#2FCA71] focus-within:ring-1 focus-within:ring-[#2FCA71] transition">
                <div className="p-2 bg-white text-gray-500 rounded-xl shadow-sm"><MapPin size={20} className="text-[#2FCA71]" /></div>
                <input type="text" placeholder="Enter destination" value={dropoff} onChange={(e) => setDropoff(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none px-2 font-medium placeholder:font-normal" />
              </div>
              <button onClick={handleRequestRide}
                className="mt-2 w-full bg-[#2FCA71] hover:bg-[#25A65B] text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#2FCA71]/20 hover:-translate-y-0.5">
                Book Ride <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loadingStats ? (
              [...Array(4)].map((_, i) => <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 animate-pulse h-32" />)
            ) : (
              stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group flex flex-col items-center text-center">
                  <div className={`p-3 rounded-xl mb-3 ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                  </div>
                  <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</span>
                  <span className="text-sm font-semibold text-gray-500 mt-1">{stat.label}</span>
                </div>
              ))
            )}
          </div>

          {/* Recent Rides */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Rides</h2>
              <button className="text-sm font-bold text-[#2FCA71] hover:text-[#25A65B] flex items-center gap-1">
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {recentRides.length > 0 ? recentRides.map((ride) => (
                <div key={ride._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-gray-400">#{String(ride._id).slice(-6).toUpperCase()}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <Clock size={12} /> {new Date(ride.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-800" />
                        <div className="w-0.5 h-6 bg-gray-300" />
                        <div className="w-2 h-2 rounded-sm bg-[#2FCA71]" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="font-bold text-gray-900 text-sm leading-none line-clamp-1">
                          {ride.pickupLocation?.address || ride.pickupLocation?.name || "Pickup"}
                        </span>
                        <span className="font-bold text-gray-900 text-sm leading-none line-clamp-1">
                          {ride.dropoffLocation?.address || ride.dropoffLocation?.name || "Destination"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 shrink-0">
                    <span className="font-extrabold text-gray-900 text-lg mb-0 md:mb-2">৳{ride.price || ride.fare || 0}</span>
                    <StatusBadge status={ride.bookingStatus} />
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-gray-400 font-medium">No recent rides found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#2FCA71]/20 rounded-full blur-3xl" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2 text-gray-300 font-medium">
                <Wallet size={18} className="text-[#2FCA71]" /> Wallet Balance
              </div>
              <Link href="/dashboard/passenger/wallet" className="p-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                <MoreHorizontal size={18} />
              </Link>
            </div>
            <div className="mb-6 relative z-10">
              <span className="text-4xl font-extrabold tracking-tight">৳1,250</span>
              <div className="text-sm text-gray-400 mt-1 bg-gray-800 inline-block px-2.5 py-1 rounded-md">Includes ৳350 Ride Credits</div>
            </div>
            <div className="flex gap-2 relative z-10">
              <Link href="/dashboard/passenger/wallet" className="flex-1 bg-[#2FCA71] hover:bg-[#25A65B] text-white text-center font-bold py-2.5 rounded-xl transition">Add Money</Link>
              <Link href="/dashboard/passenger/wallet" className="flex-1 bg-white hover:bg-gray-100 text-gray-900 text-center font-bold py-2.5 rounded-xl transition">History</Link>
            </div>
            <Link href="/dashboard/passenger/wallet" className="p-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition"><MoreHorizontal size={18} /></Link>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-[#2FCA71]" /> Scheduled
            </h2>
            {SCHEDULED_RIDES.length > 0 ? (
              <div className="space-y-4">
                {SCHEDULED_RIDES.map((ride) => (
                  <div key={ride.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="font-bold text-[#2FCA71] mb-2">{ride.date}</div>
                    <div className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {ride.pickup}
                    </div>
                    <div className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2FCA71]" /> {ride.dropoff}
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-white border border-gray-200 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition">View Details</button>
                      <button className="flex-1 bg-red-50 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-100 transition">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                <span className="text-gray-400 font-medium">No upcoming rides scheduled.</span>
              </div>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.02 }}
            className="bg-blue-600 text-white rounded-3xl p-6 border border-blue-500 shadow-xl relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] text-blue-500 opacity-50 rotate-12">
              <TicketPercent size={120} />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-2.5 py-1 bg-white/20 rounded-md text-xs font-bold uppercase tracking-wider mb-3">Limited Offer</span>
              <h3 className="text-xl font-bold leading-tight mb-2">Get 20% off your next ride</h3>
              <p className="text-blue-100 text-sm mb-4">Use code <span className="font-mono bg-white/20 px-1 py-0.5 rounded">ONWAY20</span> at checkout</p>
              <Link href="/dashboard/passenger/wallet" className="w-full inline-block text-center bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition">
                Apply Promo
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Searching Overlay */}
      <AnimatePresence>
        {isSearching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2FCA71]/10 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border-4 border-[#2FCA71] text-center">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-4 border-r-4 border-[#2FCA71] rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center text-[#2FCA71]">
                  <Car size={48} className="animate-bounce" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Finding your ride</h3>
              <p className="text-gray-500 font-medium mb-8">Connecting with nearby drivers...</p>
              <button onClick={() => setIsSearching(false)}
                className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition">
                Cancel Search
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Driver Matched Overlay */}
      <AnimatePresence>
        {matchedDriver && rideStatus === "accepted" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-xl">
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl border-4 border-[#2FCA71]">
              <div className="bg-[#2FCA71] p-8 text-white text-center relative">
                <button className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
                  onClick={() => { setMatchedDriver(null); setRideStatus(null); }}>
                  <XCircle size={20} />
                </button>
                <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 border-4 border-white/30 overflow-hidden">
                  <img
                    src={matchedDriver.driver?.image || matchedDriver.driver?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchedDriver.driver?.name || "Driver"}`}
                    alt="Driver" className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Driver Found!</h3>
                <p className="text-white/80 font-bold uppercase tracking-widest text-xs mt-1">Your ride is on the way</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Driver</p>
                    <p className="text-xl font-bold text-gray-900">{matchedDriver.driver?.name || "Driver"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vehicle</p>
                    <p className="text-xl font-bold text-gray-900">
                      {matchedDriver.driver?.vehicle?.color || ""} {matchedDriver.driver?.vehicle?.brand || matchedDriver.driver?.vehicle?.type || "Car"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-100 text-amber-600 p-2 rounded-xl">
                      <Star size={20} fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-gray-900 leading-none">{matchedDriver.driver?.rating || "5.0"}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rating</p>
                    </div>
                  </div>

                  {/* OTP Display */}
                  <div className="bg-gray-50 px-6 py-4 rounded-2xl border-2 border-[#2FCA71]/30 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your OTP</p>
                    <p className="text-3xl font-black text-[#2FCA71] tracking-[0.3em]">
                      {matchedDriver.otp || "----"}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-1">Share with driver</p>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition"
                    onClick={() => window.open(`tel:${matchedDriver.driver?.phone}`, "_self")}
                  >
                    Call Driver
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/passenger/active-ride?bookingId=${matchedDriver.bookingId || matchedDriver.rideId}`)}
                    className="flex-1 py-4 bg-[#2FCA71] text-white font-bold rounded-2xl hover:bg-[#25A65B] transition shadow-lg"
                  >
                    Track Ride
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expired Banner */}
      <AnimatePresence>
        {rideStatus === "expired" && (
          <motion.div
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[120] bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <XCircle size={20} />
            <span className="font-bold">No drivers found nearby. Please try again.</span>
            <button onClick={() => setRideStatus(null)}
              className="ml-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-bold text-sm transition">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
