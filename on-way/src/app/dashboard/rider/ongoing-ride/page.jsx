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
import { useSocket } from "@/hooks/useSocket";
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
    const [status, setStatus] = useState("accepted");
    const [elapsedTime, setElapsedTime] = useState(0);
    const [otpValue, setOtpValue] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [driverPos, setDriverPos] = useState(null);

    const { socket, emit, on, off } = useSocket('rider');

    // Fetch initial ride data
    useEffect(() => {
        const fetchRide = async () => {
            if (!bookingId) return;
            try {
                setIsLoading(true);
                // FEATURE FIX: Using the optimized ride fetch endpoint
                const res = await axios.get(`${API_BASE_URL}/rides/${bookingId}`);
                if (res.data.success && res.data.ride) {
                    const rideData = res.data.ride;
                    setRide(rideData);
                    setStatus(rideData.status || rideData.bookingStatus);
                } else {
                    toast.error("Mission data not found.");
                }
            } catch (error) {
                console.error("Fetch ride error:", error);
                // Only show error if it's a real failure, not just initial state
                if (error.response?.status === 404) {
                    toast.error("Mission not found in system.");
                }
            } finally {
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

    // Live Geolocation Tracking
    useEffect(() => {
        if (!riderId || status === 'completed') return;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setDriverPos([latitude, longitude]);
                emit('rider:update-location', { riderId, lat: latitude, lng: longitude });
            },
            (err) => console.error("GPS Watch Error:", err),
            { enableHighAccuracy: true, distanceFilter: 10 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [riderId, status, emit]);

    // Socket listeners for passenger updates
    useEffect(() => {
        if (!bookingId || !socket) return;

        const onCancelled = (data) => {
            if (data.bookingId === bookingId) {
                toast.error("Passenger cancelled the ride.");
                router.push("/dashboard/rider");
            }
        };

        on("ride:cancelled", onCancelled);
        return () => off("ride:cancelled", onCancelled);
    }, [bookingId, router, on, off, socket]);

    const updateStatus = async (newStatus) => {
        try {
            const res = await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
                status: newStatus
            });

            if (res.data.success) {
                setStatus(newStatus);
                if (newStatus === "arrived") {
                    emit("driver:arrived", { bookingId });
                    toast.success("Arrival notified to passenger.");
                } else if (newStatus === "completed") {
                    emit("ride:complete", { bookingId, riderId });
                    toast.success("Mission Accomplished!");
                    setTimeout(() => router.push("/dashboard/rider"), 2000);
                }
            }
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    const handleVerifyOTP = async () => {
        if (otpValue.length !== 4) {
            return toast.error("Please enter a 4-digit OTP");
        }

        try {
            setIsVerifying(true);
            const res = await axios.post(`${API_BASE_URL}/bookings/verify-otp`, {
                bookingId,
                otp: otpValue
            });

            if (res.data.success) {
                setStatus("picked_up");
                toast.success("OTP Verified! Trip Started.");
                emit("ride:start", { bookingId });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP code");
        } finally {
            setIsVerifying(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // UI RENDERING - PREVENT CRASHES
    if (isLoading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-6">
                <Loader2 size={48} className="animate-spin text-blue-500" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Downloading Mission Data...</p>
                <p className="text-xs text-gray-400 animate-pulse">Syncing with Command Center...</p>
            </div>
        );
    }

    if (!ride) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-8 p-10 text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-24 w-24 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 border-2 border-red-100 shadow-xl"
                >
                    <AlertCircle size={48} />
                </motion.div>
                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-[#011421] tracking-tighter">Mission <span className="text-red-600">Lost</span></h2>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] max-w-xs mx-auto leading-relaxed">
                        Data packet not found. The mission may have been cancelled or assigned to another unit.
                    </p>
                </div>
                <button
                    onClick={() => router.push("/dashboard/rider")}
                    className="px-10 h-16 bg-[#011421] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl active:scale-95"
                >
                    Return to Dispatch
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
                                    <p className="text-base font-bold text-[#011421] leading-tight">
                                        {ride.pickupLocation?.address || ride.pickupLocation?.name || (typeof ride.pickupLocation === 'string' ? ride.pickupLocation : "Pickup Point")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-5">
                                <div className="h-6 w-6 rounded-lg bg-[#011421] flex items-center justify-center text-white">
                                    <Navigation size={12} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                                    <p className="text-base font-bold text-[#011421] leading-tight">
                                        {ride.dropoffLocation?.address || ride.dropoffLocation?.name || ride.dropLocation?.address || ride.dropLocation?.name || (typeof ride.dropoffLocation === 'string' ? ride.dropoffLocation : (typeof ride.dropLocation === 'string' ? ride.dropLocation : "Destination"))}
                                    </p>
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
                                <div className="space-y-4">
                                    <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 text-center">Enter 4-Digit OTP from Passenger</p>
                                        <div className="flex justify-center gap-3">
                                            {[0, 1, 2, 3].map((i) => (
                                                <input
                                                    key={i}
                                                    type="text"
                                                    maxLength="1"
                                                    value={otpValue[i] || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, "");
                                                        setOtpValue(prev => {
                                                            const arr = prev.split("");
                                                            arr[i] = val;
                                                            return arr.join("");
                                                        });
                                                        // Auto focus next
                                                        if (val && e.target.nextSibling) e.target.nextSibling.focus();
                                                    }}
                                                    className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-white font-black text-xl focus:border-blue-500 outline-none"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleVerifyOTP}
                                        disabled={isVerifying || otpValue.length !== 4}
                                        className="w-full h-20 bg-green-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-green-900/40 hover:bg-green-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isVerifying ? <Loader2 className="animate-spin" /> : <Navigation size={24} />}
                                        {isVerifying ? "Verifying..." : "Verify & Start Trip"}
                                    </button>
                                </div>
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
                        driverPos={driverPos}
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
