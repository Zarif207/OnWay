"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import { getPassengerSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useRide } from "@/context/RideContext";
import {
  MapPin, Car, Wallet, TicketPercent, CheckCircle2,
  XCircle, Clock, ArrowRight, Route, Star, History,
  BookOpen, PlusCircle, Bookmark, Navigation, TrendingUp,
  ChevronRight, Zap, Shield, DollarSign, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const configs = {
    completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
    cancelled:  "bg-red-50 text-red-500 border-red-200",
    searching:  "bg-blue-50 text-blue-600 border-blue-200",
    arriving:   "bg-amber-50 text-amber-600 border-amber-200",
    ongoing:    "bg-violet-50 text-violet-600 border-violet-200",
  };
  const cls = configs[status] || "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
};

// ── Summary card — matches admin dashboard style ──────────────────────────────
const SummaryCard = ({ icon: Icon, value, label, sub, iconBg, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: "easeOut" }}
    whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-default"
  >
    {/* Icon + trend row */}
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}>
        <Icon size={22} className="text-white" />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
          trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
        }`}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      )}
    </div>
    {/* Label */}
    <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
    {/* Value */}
    <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{value}</p>
    {/* Subtext */}
    {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
  </motion.div>
);

// ── Quick action button ───────────────────────────────────────────────────────
const QuickAction = ({ icon: Icon, label, href, primary = false }) => (
  <Link href={href}>
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer transition-all ${
        primary
          ? "bg-primary text-white shadow-lg shadow-primary/25"
          : "bg-white border border-slate-100 text-slate-700 hover:border-primary/30 hover:bg-primary/5"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${primary ? "bg-white/20" : "bg-slate-50"}`}>
        <Icon size={20} className={primary ? "text-white" : "text-primary"} />
      </div>
      <span className="text-xs font-bold text-center leading-tight">{label}</span>
    </motion.div>
  </Link>
);

export default function PassengerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const { rideStatus: activeRideStatus } = useRide();

  const [stats,         setStats]         = useState(null);
  const [recentRides,   setRecentRides]   = useState([]);
  const [loadingStats,  setLoadingStats]  = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isSearching,   setIsSearching]   = useState(false);
  const [matchedDriver, setMatchedDriver] = useState(null);
  const [rideStatus,    setRideStatus]    = useState(null);
  const [time,          setTime]          = useState(new Date());
  const socketRef = useRef(null);

  const passengerId = session?.user?.id;

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const getGreeting = () => {
    const h = time.getHours();
    if (h < 5)  return "Good night";
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  // Wallet balance
  useEffect(() => {
    if (!passengerId) return;
    const saved = localStorage.getItem(`wallet_balance_${passengerId}`);
    if (saved) setWalletBalance(parseInt(saved));
    const onStorage = (e) => {
      if (e.key === `wallet_balance_${passengerId}`) setWalletBalance(parseInt(e.newValue || "0"));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [passengerId]);

  // Stats fetch
  useEffect(() => {
    if (!passengerId) return;
    if (!/^[a-f\d]{24}$/i.test(passengerId)) { setLoadingStats(false); return; }
    (async () => {
      try {
        const res   = await axios.get(`${API_BASE_URL}/bookings?passengerId=${passengerId}`);
        const rides = res.data.data || [];
        const completed = rides.filter((r) => r.bookingStatus === "completed").length;
        const cancelled = rides.filter((r) => r.bookingStatus === "cancelled").length;
        const totalDist = rides.reduce((acc, r) => acc + (r.distance || 0), 0);
        setStats({ total: rides.length, completed, cancelled, km: totalDist.toFixed(1) });
        setRecentRides(rides.slice(0, 5));
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
      setIsSearching(false); setMatchedDriver(data); setRideStatus("accepted");
      toast.success("Driver Found! Your ride is on the way.");
    };
    const onTripStarted = (data) => {
      const bookingId = data?.bookingId || data?.rideId;
      setRideStatus("ongoing");
      if (bookingId) router.push(`/dashboard/passenger/active-ride?bookingId=${bookingId}`);
    };
    const onExpired = () => { setIsSearching(false); setRideStatus("expired"); toast.error("No drivers found nearby."); };

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

  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-7 pb-8">
      <title>OnWay - Passenger </title>

      {/* ── 1. HERO HEADER ─────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-secondary via-secondary to-primary/80 p-7 md:p-9 text-white shadow-xl">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute right-24 bottom-0 w-40 h-40 rounded-full bg-primary/20" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={session?.user?.image || `https://ui-avatars.com/api/?name=${firstName}&background=259461&color=fff&size=128`}
                alt="avatar"
                className="w-14 h-14 rounded-2xl border-2 border-white/30 shadow-lg object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">{getGreeting()}</p>
              <h1 className="text-2xl font-black tracking-tight mt-0.5">{firstName} 👋</h1>
              <p className="text-white/50 text-xs mt-0.5">
                {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Active ride badge */}
            {activeRideStatus && activeRideStatus !== "idle" && activeRideStatus !== "completed" && (
              <Link href="/dashboard/passenger/ride">
                <motion.div
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 px-3 py-2 rounded-xl text-xs font-bold"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Ride
                </motion.div>
              </Link>
            )}
            <div className="text-right">
              <p className="text-2xl font-black tracking-tight">
                {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Local Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. SUMMARY CARDS ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {loadingStats ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />)
        ) : (
          <>
            <SummaryCard icon={Car}        value={stats?.total ?? 0}                     label="Total Rides"  sub={`${stats?.today?.length ?? 0} rides today`}  iconBg="bg-blue-500"    trend={12}  delay={0}    />
            <SummaryCard icon={Route}      value={`${stats?.km ?? 0} km`}                label="Km Travelled" sub="All time distance"                            iconBg="bg-[#2FCA71]"   trend={8}   delay={0.05} />
            <SummaryCard icon={DollarSign} value={`৳${stats?.totalSpent?.toFixed(0) ?? 0}`} label="Total Spent"  sub="Lifetime spending"                        iconBg="bg-emerald-500"             delay={0.1}  />
            <SummaryCard icon={Calendar}   value={stats?.month?.length ?? 0}             label="This Month"   sub="Rides this month"                            iconBg="bg-red-500"     trend={-3}  delay={0.15} />
          </>
        )}
      </div>

      {/* ── 3. MAIN GRID ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-3">
              <QuickAction icon={Navigation} label="Book a Ride"    href="/onway-book"                          primary />
              <QuickAction icon={History}    label="Ride History"   href="/dashboard/passenger/ride-history"           />
              <QuickAction icon={PlusCircle} label="Add Funds"      href="/dashboard/passenger/wallet"                 />
              <QuickAction icon={Bookmark}   label="Saved Places"   href="/dashboard/passenger/profile"                />
            </div>
          </div>

          {/* Active Ride Card — only when a ride is in progress */}
          {activeRideStatus && activeRideStatus !== "idle" && activeRideStatus !== "completed" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border-2 border-primary/30 shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Ride</h2>
                </div>
                <Link href="/dashboard/passenger/ride" className="flex items-center gap-1 text-primary text-xs font-bold hover:underline">
                  Track <ChevronRight size={14} />
                </Link>
              </div>
              <div className="flex items-center gap-4 bg-primary/5 rounded-xl p-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shrink-0">
                  <Car size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm capitalize">{activeRideStatus.replace("_", " ")}</p>
                  <p className="text-slate-400 text-xs mt-0.5">Your ride is currently active</p>
                </div>
                <Link href="/dashboard/passenger/ride">
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-primary text-white text-xs font-black rounded-xl"
                  >
                    View
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Recent Rides */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-50">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recent Journeys</h2>
              <Link href="/dashboard/passenger/ride-history" className="flex items-center gap-1 text-primary text-xs font-bold hover:underline">
                View All <ChevronRight size={14} />
              </Link>
            </div>

            {loadingStats ? (
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-50 animate-pulse" />)}
              </div>
            ) : recentRides.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Car size={24} className="text-slate-300" />
                </div>
                <p className="text-slate-400 text-sm font-bold">No rides yet</p>
                <p className="text-slate-300 text-xs mt-1">Your journey history will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentRides.map((ride) => (
                  <div key={ride._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 bg-slate-100 group-hover:bg-primary group-hover:text-white text-slate-500 rounded-xl flex items-center justify-center shrink-0 transition-all">
                      <Car size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">
                        {ride.dropoffLocation?.name || ride.dropoffLocation?.address?.road || "Destination"}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {new Date(ride.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {" · "}#{String(ride._id).slice(-6).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="font-black text-slate-900 text-sm">৳{ride.price || ride.fare || 0}</p>
                      <StatusBadge status={ride.bookingStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-5">

          {/* Wallet Card */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl">
            <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-primary/15 blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-widest">
                  <Wallet size={14} className="text-primary" /> Wallet
                </div>
                <Link href="/dashboard/passenger/wallet" className="text-slate-500 hover:text-white transition">
                  <TrendingUp size={16} />
                </Link>
              </div>
              <p className="text-3xl font-black tracking-tight mb-1">৳{walletBalance.toLocaleString()}</p>
              <p className="text-slate-500 text-xs mb-5">Available Balance</p>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/dashboard/passenger/wallet" className="py-2.5 bg-primary hover:bg-accent text-white text-center text-xs font-black rounded-xl transition">
                  Add Money
                </Link>
                <Link href="/dashboard/passenger/wallet" className="py-2.5 bg-white/10 hover:bg-white/20 text-white text-center text-xs font-black rounded-xl transition">
                  History
                </Link>
              </div>
            </div>
          </div>

          {/* Safety & Trust */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield size={14} className="text-primary" /> Safety Features
            </h3>
            <div className="space-y-3">
              {[
                { label: "Share Trip",       sub: "Share live location with family", icon: Navigation },
                { label: "Emergency SOS",    sub: "One-tap emergency alert",          icon: Zap        },
                { label: "Verified Drivers", sub: "All drivers background checked",   icon: CheckCircle2 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-primary/5 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white text-primary transition-all shrink-0">
                    <item.icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">{item.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promo Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-emerald-600 p-5 text-white shadow-lg cursor-pointer"
          >
            <div className="absolute -right-6 -top-6 opacity-10 pointer-events-none">
              <TicketPercent size={96} />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-2.5 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
                🎉 Limited Offer
              </span>
              <h3 className="text-lg font-black leading-tight mb-1">20% off your next ride</h3>
              <p className="text-white/70 text-xs mb-4">
                Use code <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded-md">ONWAY20</span>
              </p>
              <Link
                href="/dashboard/passenger/wallet"
                className="inline-flex items-center gap-2 bg-white text-primary text-xs font-black px-4 py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                Apply Promo <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── OVERLAYS ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSearching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-10 shadow-2xl text-center">
              <div className="relative w-28 h-28 mx-auto mb-8">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-4 border-r-4 border-primary rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center text-primary">
                  <Car size={44} className="animate-bounce" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Finding your ride</h3>
              <p className="text-slate-400 font-bold mb-8 text-sm">Connecting with nearby drivers...</p>
              <button onClick={() => setIsSearching(false)}
                className="w-full py-4 bg-slate-100 text-slate-900 font-black rounded-2xl hover:bg-slate-200 transition">
                Cancel Search
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {matchedDriver && rideStatus === "accepted" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-primary p-8 text-white text-center relative">
                <button className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
                  onClick={() => { setMatchedDriver(null); setRideStatus(null); }}>
                  <XCircle size={20} />
                </button>
                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 border-4 border-white/30 overflow-hidden">
                  <img src={matchedDriver.driver?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchedDriver.driver?.name || "Driver"}`}
                    alt="Driver" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Driver Found!</h3>
                <p className="text-white/80 font-bold uppercase tracking-widest text-xs mt-1">Your ride is on the way</p>
              </div>
              <div className="p-8 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Driver</p>
                    <p className="text-lg font-bold text-slate-900">{matchedDriver.driver?.name || "Driver"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vehicle</p>
                    <p className="text-lg font-bold text-slate-900">{matchedDriver.driver?.vehicle?.brand || "Car"}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition"
                    onClick={() => window.open(`tel:${matchedDriver.driver?.phone}`, "_self")}>
                    Call Driver
                  </button>
                  <button onClick={() => router.push(`/dashboard/passenger/active-ride?bookingId=${matchedDriver.bookingId || matchedDriver.rideId}`)}
                    className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-accent transition shadow-lg">
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
