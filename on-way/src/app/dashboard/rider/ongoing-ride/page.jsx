"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    MapPin,
    Navigation,
    User,
    Phone,
    MessageSquare,
    Clock,
    ShieldCheck,
    CheckCircle,
    Loader2,
    AlertCircle,
    ChevronRight,
    Map as MapIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getRiderSocket } from "@/lib/socket";
import axios from "axios";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const OngoingRideMap = dynamic(() => import("./_components/OngoingRideMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center rounded-[3rem]"><Loader2 className="animate-spin text-blue-500" /></div>
});

function OngoingRideContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session } = useSession();
    const bookingId = searchParams.get("bookingId");
    const riderId = session?.user?.id;

    const [ride, setRide] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState("accepted"); // accepted -> arrived -> picked_up -> completed
    const [elapsedTime, setElapsedTime] = useState(0);

    // Fetch initial ride data
    useEffect(() => {
        const fetchRide = async () => {
            if (!bookingId) return;
            try {
                const res = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`);
                setRide(res.data.data);
                setStatus(res.data.data.status);
                setIsLoading(false);
            } catch (error) {
                console.error("Fetch ride error:", error);
                toast.error("Failed to load mission data.");
                setIsLoading(false);
            }
        };
        fetchRide();
    }, [bookingId]);

    // Timer logic
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Socket listeners for passenger updates
    useEffect(() => {
        if (!riderId || !bookingId) return;
        const socket = getRiderSocket(riderId);

        socket.on("ride:cancelled", (data) => {
            if (data.bookingId === bookingId) {
                toast.error("Passenger cancelled the ride.");
                router.push("/dashboard/rider");
            }
        });

        return () => {
            socket.off("ride:cancelled");
        };
    }, [riderId, bookingId, router]);

    const updateStatus = async (newStatus) => {
        try {
            const res = await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
                status: newStatus
            });

            if (res.data.success) {
                setStatus(newStatus);
                const socket = getRiderSocket(riderId);
                socket.emit("ride:status_update", {
                    bookingId,
                    status: newStatus,
                    riderId
                });

                toast.success(`Mission Update: ${newStatus.replace('_', ' ').toUpperCase()}`);

                if (newStatus === "completed") {
                    setTimeout(() => router.push("/dashboard/rider"), 2000);
                }
            }
        } catch (error) {
            toast.error("Failed to update mission status.");
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-6">
                <Loader2 size={48} className="animate-spin text-blue-500" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Downloading Mission Data...</p>
            </div>
        );
    }

    if (!ride) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-8 p-10 text-center">
                <div className="h-20 w-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500">
                    <AlertCircle size={40} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-[#011421]">Mission Lost</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">The requested booking could not be located in our systems.</p>
                </div>
                <button
                    onClick={() => router.push("/dashboard/rider")}
                    className="px-10 h-16 bg-[#011421] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all"
                >
                    Return to Base
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-12 bg-blue-600 rounded-full" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Active Mission</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-[#011421]">Mission <span className="text-blue-600">Control</span></h1>
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <Clock size={16} /> {formatTime(elapsedTime)} ELAPSED
                        <ChevronRight size={14} />
                        ID: ONW-{bookingId.slice(-6).toUpperCase()}
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-blue-50 px-8 py-5 rounded-[2rem] border border-blue-100">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Guaranteed Fare</p>
                        <p className="text-3xl font-black text-blue-600 tracking-tighter">৳{ride.fare || ride.price}</p>
                    </div>
                    <div className="h-12 w-[1px] bg-blue-200 mx-2" />
                    <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                        <Navigation size={24} className="animate-pulse" />
                    </div>
                </div>
            </header>

            {/* Grid */}
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left: Mission Details */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Passenger Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl space-y-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <User size={150} />
                        </div>

                        <div className="flex items-center gap-6 relative z-10">
                            <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 p-1">
                                <div className="h-full w-full rounded-[1.8rem] bg-white overflow-hidden border-4 border-white">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ride.passengerName}`}
                                        className="h-full w-full object-cover"
                                        alt="Passenger"
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-[#011421] tracking-tight">{ride.passengerName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex text-yellow-500 text-sm">★★★★★</div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Premium Passenger</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="h-16 rounded-2xl bg-green-500 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 hover:bg-green-600 transition-all active:scale-95">
                                <Phone size={20} /> Call
                            </button>
                            <button className="h-16 rounded-2xl bg-[#011421] text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-black/20 hover:bg-black transition-all active:scale-95">
                                <MessageSquare size={20} /> Chat
                            </button>
                        </div>
                    </motion.div>

                    {/* Route Info */}
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                        <div className="space-y-6">
                            <div className="flex gap-5">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                                        <MapPin size={12} />
                                    </div>
                                    <div className="h-10 w-0.5 bg-gray-100" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pickup Point</p>
                                    <p className="text-base font-bold text-[#011421] leading-tight">{ride.pickupLocation?.address || ride.pickupLocation}</p>
                                </div>
                            </div>

                            <div className="flex gap-5">
                                <div className="h-6 w-6 rounded-lg bg-[#011421] flex items-center justify-center text-white">
                                    <Navigation size={12} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                                    <p className="text-base font-bold text-[#011421] leading-tight">{ride.dropoffLocation?.address || ride.dropLocation}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Distance</p>
                                <p className="text-xl font-black text-[#011421]">{ride.distance || "4.5"} KM</p>
                            </div>
                            <div className="h-10 w-[1px] bg-gray-100" />
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Travel Estimate</p>
                                <p className="text-xl font-black text-[#011421]">{ride.duration || "15"} MIN</p>
                            </div>
                        </div>
                    </div>

                    {/* Mission Controls */}
                    <div className="bg-[#011421] p-8 rounded-[3.5rem] shadow-2xl space-y-6">
                        <h4 className="text-white text-xs font-black uppercase tracking-[0.3em] text-center mb-2">Update Mission Status</h4>

                        <div className="space-y-4">
                            {status === "accepted" && (
                                <button
                                    onClick={() => updateStatus("arrived")}
                                    className="w-full h-20 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/40 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                                >
                                    <CheckCircle size={24} /> Arrived at Pickup
                                </button>
                            )}

                            {status === "arrived" && (
                                <button
                                    onClick={() => updateStatus("picked_up")}
                                    className="w-full h-20 bg-green-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-green-900/40 hover:bg-green-700 transition-all flex items-center justify-center gap-3"
                                >
                                    <Navigation size={24} /> Start Trip
                                </button>
                            )}

                            {status === "picked_up" && (
                                <button
                                    onClick={() => updateStatus("completed")}
                                    className="w-full h-20 bg-orange-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-900/40 hover:bg-orange-700 transition-all flex items-center justify-center gap-3"
                                >
                                    <ShieldCheck size={24} /> Complete Mission
                                </button>
                            )}

                            {status === "completed" && (
                                <div className="text-center py-6">
                                    <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 animate-bounce">
                                        <CheckCircle size={32} />
                                    </div>
                                    <p className="text-white font-black uppercase tracking-widest">Mission Success!</p>
                                    <p className="text-gray-400 text-[10px] mt-2 tracking-[0.2em] font-bold">DOWNLOADING MISSION SUMMARY...</p>
                                </div>
                            )}
                        </div>

                        <p className="text-[10px] font-bold text-gray-500 text-center uppercase tracking-widest opacity-50">
                            OnWay Secure Mission Protocol v2.4
                        </p>
                    </div>
                </div>

                {/* Right: Map */}
                <div className="lg:col-span-7 h-[600px] lg:h-auto rounded-[4rem] overflow-hidden border-2 border-white shadow-2xl relative group">
                    <OngoingRideMap
                        pickup={ride.pickupLocation?.coords || ride.pickupCoords}
                        drop={ride.dropoffLocation?.coords || ride.dropCoords}
                    />

                    {/* Map Overlays */}
                    <div className="absolute top-8 left-8 z-[500] pointer-events-none">
                        <div className="bg-[#011421]/90 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <MapIcon size={18} className="text-blue-500" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Real-time GPS Link Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-8 right-8 z-[500]">
                        <button className="h-16 px-8 bg-white/95 backdrop-blur-xl text-[#011421] rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-2xl border border-gray-100 hover:bg-white transition-all">
                            <MapIcon size={20} /> Recenter Map
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OngoingRidePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
                    <p className="font-bold text-gray-400 uppercase tracking-widest text-sm">Loading Live Session...</p>
                </div>
            </div>
        }>
            <OngoingRideContent />
        </Suspense>
    );
}
