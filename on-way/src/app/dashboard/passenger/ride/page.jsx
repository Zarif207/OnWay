"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useRide } from "@/context/RideContext";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
    Phone, MessageCircle, Shield, Star,
    ChevronUp, MapPin, Navigation, CheckCircle2,
    AlertCircle, XCircle, MoreVertical, Car,
    ArrowRight, ShieldCheck, Heart, CreditCard,
    DollarSign, Clock, Map as MapIcon, RotateCw
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
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <PassengerRideContent />
        </Suspense>
    );
}

function PassengerRideContent() {
    const router = useRouter();
    const {
        rideStatus, pickup, dropoff, assignedDriver, routeGeometry,
        otp, fare, duration, distance, rideType, isPaid, bookingId,
        setArriving, setOtpPending, verifyOtp, completeRide, cancelRide, markAsPaid,
        checkPaymentStatus, setIsPaid
    } = useRide();

    const searchParams = useSearchParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Transition simulations for the demo
    useEffect(() => {
        if (rideStatus === "accepted") {
            const timer = setTimeout(() => setArriving(), 4000);
            return () => clearTimeout(timer);
        }

        if (rideStatus === "arriving") {
            const timer = setTimeout(() => setOtpPending(), 10000);
            return () => clearTimeout(timer);
        }

        if (rideStatus === "ongoing") {
            const timer = setTimeout(() => completeRide(), 15000);
            return () => clearTimeout(timer);
        }
    }, [rideStatus, setArriving, setOtpPending, completeRide]);

    // --- 2. CRITICAL: Fetch Fresh Booking Data (Source of Truth) ---
    useEffect(() => {
        const fetchLatestBooking = async () => {
            // Priority: URL Param > Context State
            const targetId = searchParams.get("bookingId") || bookingId;
            
            if (!targetId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
                const res = await axios.get(`${API_BASE_URL}/bookings/${targetId}`);
                
                if (res.data.success && res.data.booking) {
                    const freshBooking = res.data.booking;
                    setBooking(freshBooking);
                    
                    // --- SYNC CONTEXT: Update global state if backend confirms payment ---
                    if (freshBooking.paymentStatus === "paid") {
                        setIsPaid(true);
                    }
                }
            } catch (err) {
                console.error("❌ Failed to fetch fresh booking data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestBooking();
    }, [searchParams, bookingId, setIsPaid]);

    // --- 3. BLOCK RENDER BEFORE DATA LOAD ---
    if (loading && (searchParams.get("bookingId") || bookingId)) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
                <h2 className="text-2xl font-black text-secondary tracking-tight">Verifying Payment...</h2>
                <p className="text-gray-400 font-medium mt-2">Connecting to secure gateway...</p>
            </div>
        );
    }

    // NO ACTIVE RIDE — covers both idle and completed states
    if (rideStatus === "idle" || rideStatus === "completed") {
        const showPaymentButton = rideStatus === "completed" && booking?.paymentStatus !== "paid" && !isPaid;

        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm"
                >
                    <div className="w-28 h-28 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                        <Car size={52} className="text-primary" />
                    </div>

                    <h2 className="text-3xl font-black text-secondary tracking-tighter mb-3">
                        No active ride right now.
                    </h2>
                    <p className="text-gray-400 font-medium mb-10 leading-relaxed">
                        You don&apos;t have any ongoing ride. Book a new ride to get started.
                    </p>

                    {showPaymentButton && (
                        <button
                            onClick={markAsPaid}
                            className="w-full mb-4 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-lg shadow-amber-500/20"
                        >
                            <CreditCard size={18} /> Complete Pending Payment
                        </button>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => router.push("/onway-book")}
                            className="flex-1 py-4 bg-primary hover:bg-accent text-white font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                        >
                            <MapPin size={16} /> Go OnWay-Book
                        </button>
                        <button
                            onClick={() => router.push("/dashboard/passenger")}
                            className="flex-1 py-4 bg-secondary hover:bg-secondary/90 text-white font-black rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs"
                        >
                            Dashboard Home
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }
    const getStatusText = () => {
        switch (rideStatus) {
            case "accepted": return "Driver Assigned";
            case "arriving": return "Heading to Pickup";
            case "otp_pending": return "Driver Arrived";
            case "ongoing": return "Trip in Progress";
            case "completed": return "Destination Reached";
            default: return "OnWay Ride";
        }
    };

    const getStatusColorClass = () => {
        switch (rideStatus) {
            case "otp_pending": return "text-amber-600 bg-amber-50 border-amber-200/50";
            case "ongoing": return "text-primary bg-primary/5 border-primary/20";
            case "completed": return "text-secondary bg-secondary/5 border-secondary/20";
            default: return "text-primary bg-primary/5 border-primary/20";
        }
    };

    return (
        <div className="relative h-[calc(100vh-100px)] w-full bg-white flex flex-col lg:flex-row overflow-hidden rounded-[2.5rem] mt-4 border border-gray-100">
            {/* --- MAP SECTION --- */}
            <div className="flex-1 relative z-0">
                <RideMap
                    pickup={pickup}
                    dropoff={dropoff}
                    routeGeometry={routeGeometry}
                    durationMin={duration}
                    rideStatus={rideStatus}
                    assignedDriver={assignedDriver}
                    showCarAnimation={true}
                    showCurrentLocationButton={false}
                />

                {/* Top Floating Status & Payment Banner */}
                <div className="absolute top-6 left-6 right-6 lg:left-8 lg:right-auto lg:w-80 z-10 space-y-3">
                    {(booking?.paymentStatus === "pending" || (!isPaid && !booking)) && (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-amber-500 text-white p-3 rounded-2xl shadow-lg border border-amber-400 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="animate-pulse" />
                                <span className="font-bold text-[10px] uppercase tracking-wider">Payment Pending</span>
                            </div>
                            <button onClick={markAsPaid} className="bg-white text-amber-600 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-amber-50 transition shadow-sm">
                                Pay Now
                            </button>
                        </motion.div>
                    )}
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`p-4 rounded-3xl shadow-2xl backdrop-blur-xl border ${getStatusColorClass()} flex items-center justify-between`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full animate-ping bg-current" />
                            <span className="font-black uppercase tracking-widest text-[10px]">{getStatusText()}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                            <ShieldCheck size={16} className="text-primary" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- RIDE INFO PANEL --- */}
            <motion.div
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                className={`
                    fixed inset-x-0 bottom-0 lg:relative lg:inset-auto lg:w-[450px] 
                    bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.12)] lg:shadow-none
                    transition-all duration-500 ease-in-out z-20 rounded-t-[3.5rem] lg:rounded-none
                    ${isExpanded ? 'h-[85vh]' : 'h-[380px]'} lg:h-full lg:border-l border-gray-100 flex flex-col
                `}
            >
                {/* Drag Handle for Mobile */}
                <div
                    className="lg:hidden w-full h-12 flex items-center justify-center cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full" />
                </div>

                <div className="flex-1 flex flex-col p-8 lg:p-10 pt-2 lg:pt-10 overflow-y-auto custom-scrollbar">
                    {/* Driver Card */}
                    <div className="flex items-start justify-between mb-8 group">
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="w-18 h-18 bg-gray-50 rounded-[1.75rem] overflow-hidden border-2 border-primary/20 shadow-lg group-hover:scale-105 transition-transform">
                                    <img
                                        src={`https://api.dicebear.com/7.x/${assignedDriver?.avatar || "avataaars/svg?seed=Felix"}`}
                                        alt="Driver"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-xl border-2 border-white shadow-sm">
                                    <ShieldCheck size={12} fill="currentColor" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-secondary tracking-tighter">{assignedDriver?.name}</h2>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Star size={14} fill="#F59E0B" stroke="#F59E0B" />
                                    <span className="text-sm font-black text-secondary">{assignedDriver?.rating}</span>
                                    <span className="text-gray-300 mx-1">•</span>
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full">Pro Driver</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-secondary leading-tight uppercase tracking-tighter">{assignedDriver?.car}</p>
                            <div className="inline-flex items-center px-2 py-1 bg-gray-900 text-white rounded-lg mt-1.5">
                                <span className="text-[10px] font-black uppercase tracking-widest">{assignedDriver?.plate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-gray-50/80 rounded-3xl p-5 border border-gray-100/50 hover:bg-white hover:shadow-xl transition-all group">
                            <DollarSign size={16} className="text-primary mb-2 opacity-50 group-hover:opacity-100" />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Fare</p>
                            <p className="text-lg font-black text-secondary tracking-tighter">৳{fare}</p>
                        </div>
                        <div className="bg-gray-50/80 rounded-3xl p-5 border border-gray-100/50 hover:bg-white hover:shadow-xl transition-all group">
                            <Clock size={16} className="text-blue-500 mb-2 opacity-50 group-hover:opacity-100" />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">ETA</p>
                            <p className="text-lg font-black text-secondary tracking-tighter">{duration}m</p>
                        </div>
                        <div className="bg-gray-50/80 rounded-3xl p-5 border border-gray-100/50 hover:bg-white hover:shadow-xl transition-all group">
                            <MapIcon size={16} className="text-amber-500 mb-2 opacity-50 group-hover:opacity-100" />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Dist.</p>
                            <p className="text-lg font-black text-secondary tracking-tighter">{distance}km</p>
                        </div>
                    </div>

                    {/* DYNAMIC CONTENT AREA */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {(rideStatus === "arriving" || rideStatus === "otp_pending" || rideStatus === "accepted") && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-secondary rounded-[3rem] p-8 text-white text-center shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                        <Shield size={120} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-primary drop-shadow-sm">Ride Security PIN</p>
                                    <div className="flex justify-center gap-4 mb-8">
                                        {otp?.split("").map((digit, i) => (
                                            <div key={i} className="w-14 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-4xl font-black border border-white/20 shadow-inner">
                                                {digit}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm font-medium text-gray-300 leading-relaxed px-4">
                                        Share this code with your driver to start the trip safely.
                                    </p>

                                    {rideStatus === "otp_pending" && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={verifyOtp}
                                            className="mt-8 w-full py-6 bg-primary text-white font-black rounded-[1.75rem] shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                                        >
                                            <CheckCircle2 size={22} /> VERIFY & START TRIP
                                        </motion.button>
                                    )}
                                </motion.div>
                            )}

                            {rideStatus === "ongoing" && (
                                <motion.div
                                    key="tracking"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-primary/5 rounded-[3rem] p-10 border-2 border-primary/20 text-center relative overflow-hidden group"
                                >
                                    <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                        <Navigation className="text-primary w-12 h-12 group-hover:rotate-45 transition-transform" />
                                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-25" />
                                    </div>
                                    <h3 className="text-3xl font-black text-secondary mb-3 tracking-tighter">On Your Way</h3>
                                    <p className="text-gray-500 font-medium text-lg leading-snug px-6">
                                        Enjoy the premium ride. We're tracking for your safety.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-10 flex gap-4 pt-8 border-t border-gray-100">
                        <button className="flex-1 py-6 bg-secondary text-white font-black rounded-3xl hover:bg-secondary/95 transition flex items-center justify-center gap-4 shadow-xl active:scale-95 group">
                            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Phone size={20} />
                            </div>
                            <span className="uppercase tracking-widest text-xs">Call Driver</span>
                        </button>
                        <div className="flex gap-4">
                            <button className="w-20 h-20 bg-gray-50 text-secondary rounded-3xl hover:bg-gray-100 transition flex items-center justify-center shadow-sm border border-gray-100 active:scale-95">
                                <MessageCircle size={28} />
                            </button>
                            <button
                                onClick={() => setShowCancelConfirm(true)}
                                className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl hover:bg-red-100 transition flex items-center justify-center shadow-sm border border-red-100 active:scale-95"
                            >
                                <XCircle size={28} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- COMPLETION OVERLAY --- */}
            <AnimatePresence>
                {rideStatus === "completed" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[100] bg-white flex flex-col p-8 overflow-y-auto"
                    >
                        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full py-12">
                            <motion.div
                                initial={{ scale: 0.5, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                className="w-40 h-40 bg-primary/10 rounded-[4rem] flex items-center justify-center mb-10 relative"
                            >
                                <div className="absolute inset-0 bg-primary/20 rounded-full scale-150 blur-3xl opacity-30" />
                                <CheckCircle2 className="text-primary w-20 h-20 relative z-10" />
                            </motion.div>

                            <h2 className="text-5xl font-black text-secondary tracking-tighter mb-4 text-center">Trip Well Done!</h2>
                            <p className="text-gray-400 font-medium text-xl mb-12 text-center px-10">We hope you enjoyed your ride with {assignedDriver?.name}.</p>

                            <div className="w-full grid lg:grid-cols-2 gap-8 mb-12">
                                {/* Bill Summary */}
                                <div className="bg-gray-50 rounded-[3rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <DollarSign size={100} />
                                    </div>
                                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-8">Payment Details</p>
                                    <div className="flex justify-between items-end mb-8">
                                        <span className="text-lg font-bold text-gray-500">Total Fare Paid</span>
                                        <span className="text-5xl font-black text-secondary tracking-tighter">৳{fare}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {booking?.paymentStatus === "paid" ? (
                                            <div className="px-5 py-2.5 bg-green-500 text-white rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-green-500/30">
                                                <CreditCard size={16} /> Paid Successfully
                                            </div>
                                        ) : (
                                            <div className="px-5 py-2.5 bg-amber-500 text-white rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/30">
                                                <AlertCircle size={16} /> Payment Pending
                                            </div>
                                        )}
                                        {booking?.paymentStatus !== "paid" && (
                                            <button
                                                onClick={markAsPaid}
                                                className="px-5 py-2.5 bg-secondary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition"
                                            >
                                                Pay Now
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Stats Summary */}
                                <div className="bg-secondary text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/5 opacity-20" />
                                    <p className="text-primary font-black uppercase tracking-widest text-[10px] mb-8">Journey Stats</p>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center group">
                                            <span className="text-gray-400 font-bold group-hover:text-white transition-colors">Distance</span>
                                            <span className="text-2xl font-black tracking-tighter">{distance} km</span>
                                        </div>
                                        <div className="w-full h-px bg-white/10" />
                                        <div className="flex justify-between items-center group">
                                            <span className="text-gray-400 font-bold group-hover:text-white transition-colors">Time Spent</span>
                                            <span className="text-2xl font-black tracking-tighter">{duration} mins</span>
                                        </div>
                                        <div className="w-full h-px bg-white/10" />
                                        <div className="flex justify-between items-center group">
                                            <span className="text-gray-400 font-bold group-hover:text-white transition-colors">Vehicle ID</span>
                                            <span className="text-lg font-black uppercase tracking-widest text-primary">{assignedDriver?.plate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                {isPaid || booking?.paymentStatus === "paid" ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                cancelRide();
                                                window.location.href = "/onway-book";
                                            }}
                                            className="flex-1 py-7 bg-[#2FCA71] text-white font-black rounded-[2.5rem] hover:opacity-95 transition shadow-2xl shadow-green-500/20 active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-4 group"
                                        >
                                            BOOK AGAIN <RotateCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                cancelRide();
                                                window.location.href = "/dashboard/passenger";
                                            }}
                                            className="flex-1 py-7 bg-secondary text-white font-black rounded-[2.5rem] hover:opacity-90 transition shadow-2xl active:scale-95 uppercase tracking-widest text-sm"
                                        >
                                            BACK TO DASHBOARD
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={markAsPaid}
                                            className="flex-1 py-7 bg-[#2FCA71] text-white font-black rounded-[2.5rem] hover:opacity-95 transition shadow-2xl shadow-green-500/20 active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-4 group"
                                        >
                                            COMPLETE PAYMENT <CreditCard size={20} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                cancelRide();
                                                window.location.href = "/dashboard/passenger";
                                            }}
                                            className="flex-1 py-7 bg-secondary text-white font-black rounded-[2.5rem] hover:opacity-90 transition shadow-2xl active:scale-95 uppercase tracking-widest text-sm"
                                        >
                                            PAY & RETURN
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- CANCELLATION DIALOG --- */}
            <AnimatePresence>
                {showCancelConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-secondary/60 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                            className="bg-white w-full max-w-sm rounded-[3.5rem] p-12 text-center shadow-3xl border border-gray-100"
                        >
                            <div className="w-28 h-28 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10 rotate-12">
                                <AlertCircle size={56} />
                            </div>
                            <h3 className="text-4xl font-black text-secondary mb-4 tracking-tighter leading-[0.9]">Cancel Journey?</h3>
                            <p className="text-gray-400 font-medium text-sm mb-12 px-2">Your driver is already en route. Frequent cancellations may affect your rating.</p>

                            <div className="flex flex-col gap-5">
                                <button
                                    onClick={() => {
                                        cancelRide();
                                        router.push("/onway-book");
                                    }}
                                    className="w-full py-6 bg-red-500 text-white font-black rounded-[2rem] shadow-2xl shadow-red-500/30 active:scale-95 transition uppercase tracking-widest text-xs"
                                >
                                    CONFIRM CANCELLATION
                                </button>
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="w-full py-5 text-gray-400 font-black rounded-2xl hover:bg-gray-50 active:scale-95 transition uppercase tracking-widest text-[10px]"
                                >
                                    CONTINUE TRIP
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
