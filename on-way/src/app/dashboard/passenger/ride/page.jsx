"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRide } from "@/context/RideContext";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
    Phone, MessageCircle, Shield, Star,
    ChevronUp, MapPin, Navigation, CheckCircle2,
    AlertCircle, XCircle, MoreVertical, Car,
    ArrowRight, ShieldCheck, Heart
} from "lucide-react";

// Dynamically import the Map component to avoid SSR issues
const RideMap = dynamic(() => import("@/components/Map/RideMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-secondary font-bold animate-pulse text-sm">Initializing Live Map...</p>
            </div>
        </div>
    ),
});

export default function PassengerRidePage() {
    const router = useRouter();
    const {
        rideStatus, pickup, dropoff, assignedDriver, routeGeometry,
        otp, fare, duration, distance, rideType,
        setArriving, setOtpPending, verifyOtp, completeRide, cancelRide
    } = useRide();

    const [isExpanded, setIsExpanded] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Transition simulations
    useEffect(() => {
        if (rideStatus === "accepted") {
            const timer = setTimeout(() => setArriving(), 4000);
            return () => clearTimeout(timer);
        }

        if (rideStatus === "arriving") {
            const timer = setTimeout(() => setOtpPending(), 12000);
            return () => clearTimeout(timer);
        }

        if (rideStatus === "ongoing") {
            const timer = setTimeout(() => completeRide(), 20000);
            return () => clearTimeout(timer);
        }
    }, [rideStatus, setArriving, setOtpPending, completeRide]);

    // EMPTY STATE
    if (rideStatus === "idle") {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm"
                >
                    <div className="w-48 h-48 bg-gray-50 rounded-[3rem] mx-auto mb-10 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                        <Car size={80} className="text-primary/20 absolute -right-4 -bottom-4 rotate-12" />
                        <Navigation size={64} className="text-primary relative z-10" />
                    </div>
                    <h2 className="text-3xl font-black text-secondary tracking-tighter mb-4">No Active Rides</h2>
                    <p className="text-gray-500 font-medium mb-10 px-4 leading-relaxed">
                        Your journey's haven’t started yet. Book a ride now to explore the city with OnWay.
                    </p>
                    <button
                        onClick={() => router.push("/onway-book")}
                        className="w-full py-6 bg-primary text-white font-black rounded-3xl hover:bg-primary/90 transition shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95"
                    >
                        BOOK A RIDE <ArrowRight size={20} />
                    </button>
                </motion.div>
            </div>
        );
    }

    const getStatusText = () => {
        switch (rideStatus) {
            case "accepted": return "Driver Assigned";
            case "arriving": return "Heading to Pickup";
            case "otp_pending": return "Driver Arrived";
            case "ongoing": return "In Transit";
            case "completed": return "Trip Finished";
            default: return "OnWay Ride";
        }
    };

    const getStatusColor = () => {
        switch (rideStatus) {
            case "otp_pending": return "text-amber-600 bg-amber-50 border-amber-100";
            case "ongoing": return "text-primary bg-primary/5 border-primary/10";
            case "completed": return "text-secondary bg-secondary/5 border-secondary/10";
            default: return "text-primary bg-primary/5 border-primary/10";
        }
    };

    return (
        <div className="relative h-[100dvh] w-full bg-white flex flex-col lg:flex-row overflow-hidden">
            {/* --- MAP SECTION --- */}
            <div className="flex-1 relative z-0">
                <RideMap
                    pickup={pickup}
                    dropoff={dropoff}
                    routeGeometry={routeGeometry}
                    durationMin={duration}
                    rideStatus={rideStatus}
                    showCarAnimation={true}
                    showCurrentLocationButton={false}
                />

                {/* Top Floating Status (Desktop & Mobile) */}
                <div className="absolute top-6 left-6 right-6 lg:left-8 lg:right-auto lg:w-80 z-10">
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`p-4 rounded-[2rem] shadow-2xl backdrop-blur-xl border-2 ${getStatusColor()} flex items-center justify-between`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full animate-pulse bg-current`} />
                            <span className="font-black uppercase tracking-widest text-[10px]">{getStatusText()}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                            <ShieldCheck size={16} className="text-primary" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- RIDE INFO PANEL (Bottom Sheet Style) --- */}
            <motion.div
                initial={{ y: 300, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`
          fixed inset-x-0 bottom-0 lg:relative lg:inset-auto lg:w-[420px] 
          bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.12)] lg:shadow-none
          transition-all duration-500 ease-in-out z-20 rounded-t-[3rem] lg:rounded-none
          ${isExpanded ? 'h-[85vh]' : 'h-[360px]'} lg:h-full lg:border-l border-gray-100 flex flex-col
        `}
            >
                {/* Handle for mobile */}
                <div
                    className="lg:hidden w-full h-10 flex items-center justify-center cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                </div>

                <div className="flex-1 flex flex-col p-8 lg:p-10 pt-2 lg:pt-10 overflow-y-auto scrollbar-hide">
                    {/* Driver & Brand Header */}
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border-2 border-primary/10 shadow-sm">
                                    <img
                                        src={`https://api.dicebear.com/7.x/${assignedDriver?.avatar || "avataaars/svg"}`}
                                        alt="Driver"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-lg border-2 border-white">
                                    <Heart size={10} fill="currentColor" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-secondary tracking-tight">{assignedDriver?.name}</h2>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Star size={12} fill="#F59E0B" stroke="#F59E0B" />
                                    <span className="text-sm font-bold text-secondary">{assignedDriver?.rating}</span>
                                    <span className="text-gray-300 mx-1">•</span>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Gold Partner</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-secondary leading-tight">{assignedDriver?.car}</p>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">{assignedDriver?.plate}</p>
                        </div>
                    </div>

                    {/* Quick Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight mb-1">Price</p>
                            <p className="text-lg font-black text-secondary tracking-tighter">৳{fare}</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight mb-1">Time</p>
                            <p className="text-lg font-black text-secondary tracking-tighter">{duration}m</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight mb-1">Dist.</p>
                            <p className="text-lg font-black text-secondary tracking-tighter">{distance}k</p>
                        </div>
                    </div>

                    {/* DYNAMIC ACTION SECTION */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {/* OTP BOX (Arriving Phase) */}
                            {(rideStatus === "arriving" || rideStatus === "otp_pending") && (
                                <motion.div
                                    key="otp"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="bg-secondary rounded-[2.5rem] p-8 text-white text-center shadow-2xl relative overflow-hidden"
                                >
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-4 text-primary">Ride Security Code</p>
                                    <div className="flex justify-center gap-3 mb-6">
                                        {otp?.split("").map((digit, i) => (
                                            <div key={i} className="w-12 h-16 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center text-3xl font-black border border-white/10">
                                                {digit}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs font-medium text-gray-400 leading-relaxed px-4">
                                        Give this code to {assignedDriver?.name} to start your ride securelee.
                                    </p>

                                    {rideStatus === "otp_pending" && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={verifyOtp}
                                            className="mt-8 w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 uppercase tracking-tighter"
                                        >
                                            <CheckCircle2 size={24} /> Confirm Ride Start
                                        </motion.button>
                                    )}
                                </motion.div>
                            )}

                            {/* TRIP IN PROGRESS */}
                            {rideStatus === "ongoing" && (
                                <motion.div
                                    key="ongoing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-primary/10 rounded-[2.5rem] p-8 border-2 border-primary/10 text-center py-12"
                                >
                                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                        <Navigation className="text-primary w-10 h-10 animate-pulse" />
                                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-25" />
                                    </div>
                                    <h3 className="text-2xl font-black text-secondary mb-2 tracking-tighter">Your Trip is Live</h3>
                                    <p className="text-gray-500 font-medium text-sm">OnWay is tracking your journey for safety.</p>
                                </motion.div>
                            )}

                            {/* RIDE COMPLETED */}
                            {rideStatus === "completed" && (
                                <motion.div
                                    key="completed"
                                    initial={{ opacity: 0, y: 100 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="fixed inset-0 z-[100] bg-white flex flex-col p-8 text-center"
                                >
                                    <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
                                        <div className="w-32 h-32 bg-primary/10 rounded-[3rem] flex items-center justify-center mb-8">
                                            <CheckCircle2 className="text-primary w-16 h-16" />
                                        </div>
                                        <h2 className="text-4xl font-black text-secondary tracking-tighter mb-4">You've Arrived!</h2>
                                        <p className="text-gray-500 font-medium mb-12">Trip completed safely. Thank you for riding with OnWay.</p>

                                        <div className="w-full bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 flex flex-col gap-6 mb-12">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Total Fare</span>
                                                <span className="text-4xl font-black text-secondary tracking-tighter">৳{fare}</span>
                                            </div>
                                            <div className="w-full h-px bg-gray-200" />
                                            <div className="flex justify-between items-center text-sm font-bold">
                                                <span className="text-gray-400">Distance Travelled</span>
                                                <span className="text-secondary">{distance} km</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => { cancelRide(); router.push("/onway-book"); }}
                                            className="w-full py-6 bg-secondary text-white font-black rounded-[2rem] hover:opacity-90 transition active:scale-95 shadow-2xl uppercase tracking-tighter"
                                        >
                                            RETURN TO HOME
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Controls */}
                    {rideStatus !== "completed" && (
                        <div className="mt-8 flex gap-4 pt-6 border-t border-gray-100">
                            <button className="flex-1 py-5 bg-secondary text-white font-black rounded-3xl hover:opacity-95 transition flex items-center justify-center gap-3 shadow-xl">
                                <Phone size={20} /> CALL
                            </button>
                            <div className="flex gap-3">
                                <button className="p-5 bg-gray-100 text-secondary rounded-3xl hover:bg-gray-200 transition">
                                    <MessageCircle size={24} />
                                </button>
                                <button
                                    onClick={() => setShowCancelConfirm(true)}
                                    className="p-5 bg-red-50 text-red-500 rounded-3xl hover:bg-red-100 transition"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* --- CANCELLATION DIALOG --- */}
            <AnimatePresence>
                {showCancelConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-secondary/40 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.8, y: 50, opacity: 0 }}
                            className="bg-white w-full max-w-sm rounded-[3.5rem] p-10 text-center shadow-2xl"
                        >
                            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                                <AlertCircle size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-secondary mb-4 tracking-tighter leading-tight">Cancel your journey?</h3>
                            <p className="text-gray-400 font-medium text-sm mb-10 px-4">Drivers work hard to reach you. Cancellation fees might apply.</p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => {
                                        cancelRide();
                                        router.push("/onway-book");
                                    }}
                                    className="w-full py-5 bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 transition"
                                >
                                    YES, CANCEL RIDE
                                </button>
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="w-full py-4 bg-gray-50 text-gray-400 font-bold rounded-2xl hover:bg-gray-100 active:scale-95 transition"
                                >
                                    NO, KEEP GOING
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
