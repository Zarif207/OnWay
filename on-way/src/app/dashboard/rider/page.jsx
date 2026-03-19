"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  DollarSign,
  Briefcase,
  Star,
  TrendingUp,
  Loader2,
  AlertCircle,
  Clock,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getRiderSocket } from "@/lib/socket";

// Components
import StatsCard from "./_components/StatsCard";
import OnlineToggle from "./_components/OnlineToggle";
import RidesTable from "./_components/RidesTable";
import OngoingRideCard from "./_components/OngoingRideCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const RiderDashboard = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const riderId = session?.user?.id;
  const [lastSync, setLastSync] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch Dashboard Data
  const { data: dashboardData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["driverDashboard", riderId],
    queryFn: async () => {
      if (!riderId) return null;
      const res = await axios.get(`${API_BASE_URL}/riders/dashboard/${riderId}`);
      setLastSync(new Date());
      return res.data.data;
    },
    enabled: !!riderId,
    refetchInterval: 60000,
  });

  // 2. Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (isOnline) => {
      const newStatus = isOnline ? "online" : "offline";
      const res = await axios.patch(`${API_BASE_URL}/riders/${riderId}/status`, { status: newStatus });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["driverDashboard", riderId], (old) => ({
        ...old,
        status: data.status
      }));

      const isOnlineSuccess = data.status === "online";
      toast.success(`Presence updated: ${isOnlineSuccess ? "ONLINE" : "OFFLINE"}`, {
        style: { borderRadius: '15px', background: '#011421', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
      });

      const socket = getRiderSocket(riderId);
      const isOnlineRoom = data.status === "online";
      if (isOnlineRoom) {
        socket.emit("rider:online", riderId);
      } else {
        socket.emit("rider:offline", riderId);
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Network sync failed";
      toast.error(message);
    }
  });

  const [currentRequest, setCurrentRequest] = useState(null);

  // Destructure dashboard data early to avoid TDZ in useEffect
  const {
    status = "offline",
    isApproved = false,
    todayEarnings = 0,
    totalEarnings = 0,
    totalRides = 0,
    avgRating = 0,
    ratingCount = 0,
    recentRides = [],
    ongoingRide = null
  } = dashboardData || {};

  const isOnline = status === "online";

  // 3. Socket Integration & Geolocation Tracking
  useEffect(() => {
    if (!riderId) return;
    const socket = getRiderSocket(riderId);

    // Initial sync if already online from DB state
    if (isOnline) {
      socket.emit("rider:set-online", { riderId, isOnline: true });
    }

    // Listen for ride requests
    socket.on("new-ride-request", (request) => {
      console.log("📥 [SOCKET] New ride request received:", request);
      setCurrentRequest(request);
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-[2rem] pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-6 border-2 border-primary`}>
          <div className="flex-1">
            <p className="text-sm font-black text-primary uppercase tracking-widest mb-1">New Dispatch Request</p>
            <p className="text-lg font-bold text-[#011421]">A ride is available nearby!</p>
          </div>
        </div>
      ), { duration: 10000 });
    });

    // 📍 Simulation Synchronization (PART 3)
    // No longer using navigator.geolocation as per requirements
    socket.on("riderLocationUpdate", (data) => {
      console.log("📡 [SIMULATION] Location update received:", data);
      // Optional: Update some local state if the dashboard needs to show the car moving
    });

    return () => {
      socket.off("new-ride-request");
      socket.off("riderLocationUpdate");
    };
  }, [riderId, isOnline]);

  const handleAcceptRide = () => {
    if (!currentRequest || !riderId) return;
    const socket = getRiderSocket(riderId);
    socket.emit("ride:accept", {
      bookingId: currentRequest.bookingId,
      riderId: riderId
    });
    // Navigate to ongoing ride (PART 5)
    window.location.href = `/dashboard/rider/ongoing-ride?bookingId=${currentRequest.bookingId}`;
  };

  const handleRejectRide = () => {
    setCurrentRequest(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <div className="relative">
          <div className="h-32 w-32 rounded-full border-b-4 border-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[75vh] items-center justify-center p-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-red-50/50 p-12 rounded-[3.5rem] border border-red-100 text-center shadow-sm"
        >
          <div className="h-20 w-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-[#011421] mb-4 tracking-tighter">Connection Interrupted</h2>
          <p className="text-gray-500 font-bold mb-10 leading-relaxed uppercase tracking-widest text-xs">
            {error?.message || "Secure link to OnWay servers timed out."}
          </p>
          <button
            onClick={() => refetch()}
            className="w-full bg-red-500 h-16 rounded-2xl text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all active:scale-95"
          >
            Reconnect Bridge
          </button>
        </motion.div>
      </div>
    );
  }

  // Logic for UI

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-20 pt-4 px-2">
      {/* Dynamic Glass Header */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-2 w-12 bg-primary rounded-full" />
            <span className="text-xs font-black text-primary uppercase tracking-[0.4em]">Operational Center</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-black tracking-[-0.04em] text-[#011421]"
          >
            Dashboard
          </motion.h1>
          <div className="flex items-center gap-3">
            <p className="text-lg font-bold text-gray-400 flex items-center gap-2">
              Welcome, <span className="text-[#011421]">{session?.user?.name || "Rider"}</span>
            </p>
            <div className="flex gap-2">
              {isApproved ? (
                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-green-200">Verified</span>
              ) : (
                <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-amber-200">Pending Approval</span>
              )}
              {isOnline ? (
                <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-blue-200">Active</span>
              ) : (
                <span className="bg-gray-100 text-gray-400 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-gray-200">Offline</span>
              )}
            </div>
            <ChevronRight size={18} className="text-primary" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <OnlineToggle
            isOnline={isOnline}
            onToggle={() => toggleStatusMutation.mutate(!isOnline)}
            isLoading={toggleStatusMutation.isPending}
            riderId={riderId}
          />
        </motion.div>
      </header>

      {/* High-Performance Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xxl:grid-cols-4 gap-8">
        <StatsCard
          icon={DollarSign}
          title="Today's Earnings"
          value={todayEarnings}
          change="+৳1,200 today"
          isCurrency={true}
        />
        <StatsCard
          icon={TrendingUp}
          title="Total Lifetime"
          value={totalEarnings}
          isCurrency={true}
        />
        <StatsCard
          icon={Briefcase}
          title="Rides Completed"
          value={totalRides}
          change="Last 30 Days"
        />
        <StatsCard
          icon={Star}
          title="Quality Score"
          value={`${avgRating} / 5`}
          change={`${ratingCount} reviews`}
        />
      </section>

      {/* Critical Action: Ongoing Ride */}
      <AnimatePresence mode="wait">
        {ongoingRide && (
          <motion.section
            initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-4"
          >
            <OngoingRideCard ride={ongoingRide} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Activity Monitor */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-black text-[#011421] tracking-tighter">Live Monitor</h3>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
            <Clock size={14} />
            SYNCED AT {mounted ? lastSync.toLocaleTimeString().toUpperCase() : "--:--:--"}
          </div>
        </div>
        <RidesTable rides={recentRides || []} />
      </section>

      {/* Footer Branding */}
      <footer className="pt-10 flex flex-col items-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all cursor-default text-center">
        <div className="h-1 w-20 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">
          OnWay Rider Intelligence Unit • v16.1.6
        </p>
      </footer>

      {/* 🚀 RIDE DISPATCH OVERLAY (PART 3) */}
      <AnimatePresence>
        {currentRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#011421]/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl border-4 border-primary relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 text-primary">
                <Briefcase size={120} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-black text-primary uppercase tracking-[0.3em]">Incoming Dispatch</span>
                </div>

                <div className="space-y-8 mb-10">
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center gap-2 pt-1">
                      <div className="h-4 w-4 rounded-full border-4 border-[#011421]" />
                      <div className="w-1 h-12 bg-gray-200 rounded-full" />
                      <div className="h-4 w-4 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1 space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pickup Location</p>
                        <p className="text-xl font-bold text-[#011421] leading-tight text-pretty">{currentRequest.pickupLocation.address || "Current Location"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dropoff Location</p>
                        <p className="text-xl font-bold text-[#011421] leading-tight text-pretty">{currentRequest.dropoffLocation.address || "Destination"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Distance</p>
                      <p className="text-3xl font-black text-[#011421] text-center">{currentRequest.distance} km</p>
                    </div>
                    <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
                      <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1 text-center">Est. Fare</p>
                      <p className="text-3xl font-black text-[#011421] text-center">৳{currentRequest.price}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleRejectRide}
                    className="flex-1 bg-gray-100 h-20 rounded-[1.5rem] text-[#011421] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleAcceptRide}
                    className="flex-[2] bg-primary h-20 rounded-[1.5rem] text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"
                  >
                    Accept Ride
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RiderDashboard;


