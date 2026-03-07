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
import { getSocket } from "@/utils/socket";

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
      const res = await axios.post(`${API_BASE_URL}/riders/status/${riderId}`, { isOnline });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["driverDashboard", riderId], (old) => ({
        ...old,
        isOnline: data.isOnline
      }));
      toast.success(`Presence updated: ${data.isOnline ? "ONLINE" : "OFFLINE"}`, {
        style: { borderRadius: '15px', background: '#011421', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
      });

      const socket = getSocket();
      socket.emit("driver_status_change", { driverId: riderId, isOnline: data.isOnline });
    },
    onError: () => {
      toast.error("Network sync failed");
    }
  });

  // 3. Socket Integration
  useEffect(() => {
    if (!riderId) return;
    const socket = getSocket();
    socket.emit("join", `driver_${riderId}`);

    socket.on("ride_update", (data) => {
      refetch();
      toast("SYSTEM UPDATE", { icon: "⚡", style: { borderRadius: '15px', background: '#3b82f6', color: '#white' } });
    });

    return () => {
      socket.off("ride_update");
    };
  }, [riderId, refetch]);

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

  const {
    isOnline,
    todayEarnings,
    totalEarnings,
    totalRides,
    avgRating,
    ratingCount,
    recentRides,
    ongoingRide
  } = dashboardData || {};

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
          <p className="text-lg font-bold text-gray-400 flex items-center gap-2">
            Welcome, <span className="text-[#011421]">{session?.user?.name || "Rider"}</span>
            <ChevronRight size={18} className="text-primary" />
          </p>
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
            SYNCED AT {lastSync.toLocaleTimeString().toUpperCase()}
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
    </div>
  );
};

export default RiderDashboard;