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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const StatusBadge = ({ status }) => {
  const configs = {
    completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    cancelled: "bg-red-50 text-red-600 border-red-100",
    searching: "bg-blue-50 text-blue-600 border-blue-100",
    arriving: "bg-amber-50 text-amber-600 border-amber-100",
  };
  const config = configs[status] || "bg-slate-50 text-slate-600 border-slate-100";
  return (
    <span className={`px-3 py-1 border rounded-lg text-[10px] font-black uppercase tracking-widest ${config}`}>
      {status}
    </span>
  );
};

const SCHEDULED_RIDES = [
  { id: 1, pickup: "Navana Tower, Gulshan Ave", dropoff: "Hazrat Shahjalal Int. Airport", date: "Tomorrow, 08:30 AM" },
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
    router.push(`/onway-book?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Good night";
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Fetch stats
  useEffect(() => {
    if (!passengerId) return;
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/bookings?passengerId=${passengerId}`);
        const rides = res.data.data || [];
        const completed = rides.filter(r => r.bookingStatus === "completed").length;
        const totalDist = rides.reduce((acc, r) => acc + (r.distance || 0), 0);

        setStats([
          { label: "Bookings", value: rides.length, icon: Car, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Done", value: completed, icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Miles", value: `${totalDist.toFixed(1)}k`, icon: Route, color: "text-slate-900", bg: "bg-slate-100" },
          { label: "Rating", value: "4.9", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
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

    socket.emit("registerUser", { userId: passengerId, role: "user" });
    socket.emit("joinNotifications", passengerId);

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("searching") === "true") {
      setIsSearching(true);
      window.history.replaceState({}, "", "/dashboard/passenger");
    }

    const handleRideAccepted = (data) => {
      setIsSearching(false);
      setMatchedDriver(data);
      setRideStatus("accepted");
      toast.success("Driver Found! Your ride is on the way.");
    };

    const handleTripStarted = (data) => {
      const bookingId = data?.bookingId || data?.rideId;
      setRideStatus("ongoing");
      if (bookingId) {
        router.push(`/dashboard/passenger/active-ride?bookingId=${bookingId}`);
      }
    };

    const handleRideExpired = () => {
      setIsSearching(false);
      setRideStatus("expired");
      toast.error("No drivers found nearby.");
    };

    socket.on("ride:accepted", handleRideAccepted);
    socket.on("rideAccepted", handleRideAccepted);
    socket.on("trip_started", handleTripStarted);
    socket.on("ride:started", handleTripStarted);
    socket.on("ride-expired", handleRideExpired);

    return () => {
      socket.off("ride:accepted", handleRideAccepted);
      socket.off("rideAccepted", handleRideAccepted);
      socket.off("trip_started", handleTripStarted);
      socket.off("ride:started", handleTripStarted);
      socket.off("ride-expired", handleRideExpired);
    };
  }, [passengerId, router]);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12 pb-24">
      {/* Immersive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-slate-100">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identity Verified</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
            {getGreeting()}, <span className="text-emerald-500">{session?.user?.name?.split(" ")[0]}</span>.
          </h1>
          <p className="text-slate-400 font-bold text-lg tracking-tight">Ready for a premium journey today?</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Local Time</p>
              <p className="text-sm font-black text-slate-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
           </div>
           <button className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:scale-105 transition-all shadow-xl shadow-slate-900/10">
              <Bell size={24} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Hero Search Section */}
          <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute right-[-10%] top-[-10%] opacity-10 rotate-12">
               <MapPin size={400} />
            </div>
            
            <div className="relative z-10 max-w-lg">
              <h2 className="text-3xl font-black mb-10 tracking-tighter">Your next destination awaits.</h2>
              
              <div className="space-y-4 mb-10">
                <div className="group relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 group-focus-within:scale-110 transition-transform">
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Where from?" 
                    value={pickup} 
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-white font-black placeholder:text-slate-500 focus:bg-white/10 focus:border-emerald-500/50 outline-none transition-all"
                  />
                </div>

                <div className="group relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 group-focus-within:scale-110 transition-transform">
                    <MapPin size={20} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Where to?" 
                    value={dropoff} 
                    onChange={(e) => setDropoff(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-white font-black placeholder:text-slate-500 focus:bg-white/10 focus:border-emerald-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleRequestRide}
                className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-[0.2em] text-xs"
              >
                Find Drivers <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loadingStats ? (
              [...Array(4)].map((_, i) => <div key={i} className="bg-slate-50 rounded-3xl h-32 animate-pulse" />)
            ) : (
              stats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-emerald-100 transition-colors">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={22} />
                  </div>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</span>
                </div>
              ))
            )}
          </div>

          {/* Recent History */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Recent Journeys</h2>
              <button className="px-5 py-2 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition">
                Full Log
              </button>
            </div>
            
            <div className="space-y-4">
              {recentRides.length > 0 ? recentRides.map((ride) => (
                <div key={ride._id} className="group flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-transparent hover:border-slate-100 hover:bg-white transition-all cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                       <Car size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{String(ride._id).slice(-6)}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-200" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(ride.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="font-black text-slate-900 tracking-tight line-clamp-1">{ride.dropoffLocation?.address || "Destination set"}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                     <p className="text-xl font-black text-slate-900 tracking-tighter">৳{ride.price || ride.fare}</p>
                     <StatusBadge status={ride.bookingStatus} />
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No travel history discovered</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Wallet Card */}
          <div className="bg-emerald-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-600/20 relative overflow-hidden">
             <div className="absolute -right-10 -top-10 opacity-10">
                <Wallet size={150} />
             </div>
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Secure Credit</p>
                   <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                      <Wallet size={20} />
                   </div>
                </div>
                <div className="space-y-1 mb-10">
                   <p className="text-5xl font-black tracking-tighter">৳1,420</p>
                   <p className="text-xs font-bold text-emerald-100/60 uppercase tracking-widest italic">Instant Payouts Enabled</p>
                </div>
                <div className="flex gap-3">
                   <button className="flex-1 py-4 bg-white text-emerald-600 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-emerald-50 transition active:scale-95">Top Up</button>
                   <button className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-400 transition">
                      <MoreHorizontal size={24} />
                   </button>
                </div>
             </div>
          </div>

          {/* Scheduled Rips */}
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                   <Clock size={20} className="text-emerald-500" /> Planned
                </h3>
             </div>
             {SCHEDULED_RIDES.map(ride => (
                <div key={ride.id} className="space-y-6">
                   <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/50">
                      <p className="text-emerald-600 font-black text-sm mb-4 tracking-tighter">{ride.date}</p>
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                            <p className="text-xs font-black text-slate-900 leading-none truncate">{ride.pickup}</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-xs font-black text-slate-900 leading-none truncate">{ride.dropoff}</p>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition">Details</button>
                      <button className="flex-1 py-3 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition">Abort</button>
                   </div>
                </div>
             ))}
          </div>

          {/* Promo Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl"
          >
             <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12">
                <TicketPercent size={180} />
             </div>
             <div className="relative z-10">
                <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest mb-6 inline-block">Flash Offer</span>
                <h3 className="text-3xl font-black tracking-tighter leading-none mb-4">Elite discount unlocked.</h3>
                <p className="text-slate-400 text-sm font-bold mb-8 tracking-tight">Enjoy 25% off every premium booking for 48 hours.</p>
                <button className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-emerald-50 transition active:scale-95 shadow-xl">Activate Now</button>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Searching Overlay */}
      <AnimatePresence>
        {isSearching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-4 border-r-4 border-emerald-500 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                  <Car size={48} className="animate-bounce" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Finding your ride</h3>
              <p className="text-slate-400 font-bold mb-8">Connecting with nearby drivers...</p>
              <button onClick={() => setIsSearching(false)}
                className="w-full py-4 bg-slate-100 text-slate-900 font-black rounded-2xl hover:bg-slate-200 transition">
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
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="bg-emerald-500 p-8 text-white text-center relative">
                <button className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
                  onClick={() => { setMatchedDriver(null); setRideStatus(null); }}>
                  <XCircle size={20} />
                </button>
                <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 border-4 border-white/30 overflow-hidden">
                  <img
                    src={matchedDriver.driver?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchedDriver.driver?.name || "Driver"}`}
                    alt="Driver" className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Driver Found!</h3>
                <p className="text-white/80 font-bold uppercase tracking-widest text-xs mt-1">Your ride is on the way</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Driver</p>
                    <p className="text-xl font-bold text-slate-900">{matchedDriver.driver?.name || "Driver"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vehicle</p>
                    <p className="text-xl font-bold text-slate-900">
                      {matchedDriver.driver?.vehicle?.brand || "Car"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition"
                    onClick={() => window.open(`tel:${matchedDriver.driver?.phone}`, "_self")}
                  >
                    Call Driver
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/passenger/active-ride?bookingId=${matchedDriver.bookingId || matchedDriver.rideId}`)}
                    className="flex-1 py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition shadow-lg"
                  >
                    Track Ride
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
