"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import { getPassengerSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import {
  Bell, MapPin, Car, Wallet, TicketPercent,
  CheckCircle2, XCircle, Clock, ArrowRight,
  Route, MoreHorizontal, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const StatusBadge = ({ status }) => {
  const configs = {
    completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    cancelled:  "bg-red-50 text-red-600 border-red-100",
    searching:  "bg-blue-50 text-blue-600 border-blue-100",
    arriving:   "bg-amber-50 text-amber-600 border-amber-100",
  };
  const cls = configs[status] || "bg-slate-50 text-slate-600 border-slate-100";
  return (
    <span className={`px-3 py-1 border rounded-lg text-[10px] font-black uppercase tracking-widest ${cls}`}>
      {status}
    </span>
  );
};

const SCHEDULED_RIDES = [
  {
    id: 1,
    pickup: "Navana Tower, Gulshan Ave",
    dropoff: "Hazrat Shahjalal Int. Airport",
    date: "Tomorrow, 08:30 AM",
  },
];

export default function PassengerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const [pickup,        setPickup]        = useState("");
  const [dropoff,       setDropoff]       = useState("");
  const [stats,         setStats]         = useState([]);
  const [recentRides,   setRecentRides]   = useState([]);
  const [loadingStats,  setLoadingStats]  = useState(true);
  const [isSearching,   setIsSearching]   = useState(false);
  const [matchedDriver, setMatchedDriver] = useState(null);
  const [rideStatus,    setRideStatus]    = useState(null);
  const socketRef = useRef(null);

  const passengerId = session?.user?.id;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 5)  return "Good night";
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleRequestRide = () => {
    if (!pickup || !dropoff) {
      toast.error("Please enter both pickup and destination");
      return;
    }
    router.push(
      `/onway-book?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}`
    );
  };

  // Fetch stats
  useEffect(() => {
    if (!passengerId) return;
    // Only query if it's a valid MongoDB ObjectId
    if (!/^[a-f\d]{24}$/i.test(passengerId)) { setLoadingStats(false); return; }
    (async () => {
      try {
        const res   = await axios.get(`${API_BASE_URL}/bookings?passengerId=${passengerId}`);
        const rides = res.data.data || [];
        const completed = rides.filter((r) => r.bookingStatus === "completed").length;
        const totalDist = rides.reduce((acc, r) => acc + (r.distance || 0), 0);
        setStats([
          { label: "Bookings", value: rides.length,         icon: Car,          color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Done",     value: completed,            icon: CheckCircle2, color: "text-blue-500",    bg: "bg-blue-50"    },
          { label: "Km",       value: totalDist.toFixed(1), icon: Route,        color: "text-slate-900",   bg: "bg-slate-100"  },
          { label: "Rating",   value: "4.9",                icon: Star,         color: "text-amber-500",   bg: "bg-amber-50"   },
        ]);
        setRecentRides(rides.slice(0, 3));
      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setLoadingStats(false);
      }
    })();
  }, [passengerId]);

  // Socket
  useEffect(() => {
    if (!passengerId) return;
    const socket = getPassengerSocket(passengerId);
    socketRef.current = socket;
    socket.emit("registerUser", { userId: passengerId, role: "passenger" });

    const onAccepted = (data) => {
      setIsSearching(false);
      setMatchedDriver(data);
      setRideStatus("accepted");
      toast.success("Driver Found! Your ride is on the way.");
    };
    const onTripStarted = (data) => {
      const bookingId = data?.bookingId || data?.rideId;
      setRideStatus("ongoing");
      if (bookingId) router.push(`/dashboard/passenger/active-ride?bookingId=${bookingId}`);
    };
    const onExpired = () => {
      setIsSearching(false);
      setRideStatus("expired");
      toast.error("No drivers found nearby.");
    };

    socket.on("ride:accepted",  onAccepted);
    socket.on("rideAccepted",   onAccepted);
    socket.on("trip_started",   onTripStarted);
    socket.on("ride:started",   onTripStarted);
    socket.on("ride-expired",   onExpired);

    return () => {
      socket.off("ride:accepted",  onAccepted);
      socket.off("rideAccepted",   onAccepted);
      socket.off("trip_started",   onTripStarted);
      socket.off("ride:started",   onTripStarted);
      socket.off("ride-expired",   onExpired);
    };
  }, [passengerId, router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <img
            src={
              session?.user?.image ||
              `https://ui-avatars.com/api/?name=${session?.user?.name || "P"}&background=259461&color=fff&size=128`
            }
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-white shadow-sm shrink-0"
          />
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">
              {getGreeting()},{" "}
              <span className="text-primary">{session?.user?.name?.split(" ")[0] || "there"}</span> 👋
            </h1>
            <p className="text-gray-400 text-xs font-medium mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local Time</p>
            <p className="text-sm font-black text-slate-900">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg">
            <Bell size={18} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left / Main column ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Quick Book */}
          <div className="bg-slate-900 rounded-3xl p-7 md:p-9 text-white relative overflow-hidden shadow-xl">
            <div className="absolute right-[-5%] top-[-10%] opacity-10 rotate-12 pointer-events-none">
              <MapPin size={300} />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl font-black mb-5 tracking-tighter">Your next destination awaits.</h2>
              <div className="space-y-3 mb-5">
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/30 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Where from?"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white text-sm font-semibold placeholder:text-slate-500 focus:bg-white/10 focus:border-primary/50 outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary">
                    <MapPin size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Where to?"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white text-sm font-semibold placeholder:text-slate-500 focus:bg-white/10 focus:border-primary/50 outline-none transition-all"
                  />
                </div>
              </div>
              <button
                onClick={handleRequestRide}
                className="w-full py-4 bg-primary hover:bg-accent text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg uppercase tracking-widest text-xs"
              >
                Find Drivers <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {loadingStats
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl h-28 animate-pulse" />
                ))
              : stats.map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-primary/20 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <stat.icon size={20} />
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tighter">{stat.value}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {stat.label}
                    </span>
                  </div>
                ))}
          </div>

          {/* Recent Rides */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-slate-900 tracking-tighter">Recent Journeys</h2>
              <Link
                href="/dashboard/passenger/ride-history"
                className="px-4 py-1.5 bg-slate-50 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition"
              >
                Full Log
              </Link>
            </div>
            <div className="space-y-3">
              {recentRides.length > 0 ? (
                recentRides.map((ride) => (
                  <div
                    key={ride._id}
                    className="group flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                        <Car size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            #{String(ride._id).slice(-6)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className="text-[10px] font-black text-slate-400">
                            {new Date(ride.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-sm line-clamp-1">
                          {ride.dropoffLocation?.name ||
                           ride.dropoffLocation?.address?.road ||
                           ride.dropoffLocation?.address?.suburb ||
                           ride.dropoffLocation?.address?.city ||
                           "Destination"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                      <p className="text-lg font-black text-slate-900">৳{ride.price || ride.fare}</p>
                      <StatusBadge status={ride.bookingStatus} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  No travel history yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-4 space-y-5">

          {/* Wallet */}
          <div className="bg-gray-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2 text-gray-300 font-medium text-sm">
                <Wallet size={16} className="text-primary" /> Wallet Balance
              </div>
              <Link
                href="/dashboard/passenger/wallet"
                className="p-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
              >
                <MoreHorizontal size={16} />
              </Link>
            </div>
            <div className="mb-5 relative z-10">
              <span className="text-3xl font-extrabold tracking-tight">৳1,250</span>
              <div className="text-xs text-gray-400 mt-1 bg-gray-800 inline-block px-2 py-0.5 rounded-md">
                Includes ৳350 Ride Credits
              </div>
            </div>
            <div className="flex gap-2 relative z-10">
              <Link
                href="/dashboard/passenger/wallet"
                className="flex-1 bg-primary hover:bg-accent text-white text-center font-bold py-2.5 rounded-xl transition text-sm"
              >
                Add Money
              </Link>
              <Link
                href="/dashboard/passenger/wallet"
                className="flex-1 bg-white hover:bg-gray-100 text-gray-900 text-center font-bold py-2.5 rounded-xl transition text-sm"
              >
                History
              </Link>
            </div>
          </div>

          {/* Planned Rides */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-2 mb-5 text-sm">
              <Clock size={16} className="text-primary" /> Planned Rides
            </h3>
            {SCHEDULED_RIDES.map((ride) => (
              <div key={ride.id} className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                  <p className="text-primary font-black text-xs mb-3">{ride.date}</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                      <p className="text-xs font-bold text-slate-900 truncate">{ride.pickup}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <p className="text-xs font-bold text-slate-900 truncate">{ride.dropoff}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition">
                    Details
                  </button>
                  <button className="flex-1 py-2.5 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition">
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Promo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-primary text-white rounded-3xl p-6 relative overflow-hidden shadow-xl"
          >
            <div className="absolute right-[-20px] top-[-20px] text-white/20 rotate-12 pointer-events-none">
              <TicketPercent size={100} />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-2.5 py-1 bg-white/20 rounded-md text-[10px] font-black uppercase tracking-wider mb-3">
                Limited Offer
              </span>
              <h3 className="text-lg font-bold leading-tight mb-2">Get 20% off your next ride</h3>
              <p className="text-white/80 text-xs mb-4">
                Use code{" "}
                <span className="font-mono bg-white/20 px-1 py-0.5 rounded">ONWAY20</span> at checkout
              </p>
              <Link
                href="/dashboard/passenger/wallet"
                className="w-full inline-block text-center bg-white text-primary font-bold py-2.5 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                Apply Promo
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Searching Overlay */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center"
            >
              <div className="relative w-28 h-28 mx-auto mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-4 border-r-4 border-primary rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center text-primary">
                  <Car size={44} className="animate-bounce" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Finding your ride</h3>
              <p className="text-slate-400 font-bold mb-8 text-sm">Connecting with nearby drivers...</p>
              <button
                onClick={() => setIsSearching(false)}
                className="w-full py-4 bg-slate-100 text-slate-900 font-black rounded-2xl hover:bg-slate-200 transition"
              >
                Cancel Search
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Driver Matched Overlay */}
      <AnimatePresence>
        {matchedDriver && rideStatus === "accepted" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="bg-primary p-8 text-white text-center relative">
                <button
                  className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
                  onClick={() => { setMatchedDriver(null); setRideStatus(null); }}
                >
                  <XCircle size={20} />
                </button>
                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 border-4 border-white/30 overflow-hidden">
                  <img
                    src={
                      matchedDriver.driver?.image ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchedDriver.driver?.name || "Driver"}`
                    }
                    alt="Driver"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Driver Found!</h3>
                <p className="text-white/80 font-bold uppercase tracking-widest text-xs mt-1">
                  Your ride is on the way
                </p>
              </div>
              <div className="p-8 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Driver</p>
                    <p className="text-lg font-bold text-slate-900">{matchedDriver.driver?.name || "Driver"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vehicle</p>
                    <p className="text-lg font-bold text-slate-900">
                      {matchedDriver.driver?.vehicle?.brand || "Car"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition"
                    onClick={() => window.open(`tel:${matchedDriver.driver?.phone}`, "_self")}
                  >
                    Call Driver
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/passenger/active-ride?bookingId=${matchedDriver.bookingId || matchedDriver.rideId}`
                      )
                    }
                    className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-accent transition shadow-lg"
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
