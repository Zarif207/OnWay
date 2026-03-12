"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { MapPin, Navigation, User, Clock, CheckCircle2, XCircle, Search, Loader2, Bell, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getRiderSocket } from "@/lib/socket";
import axios from "axios";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

// Dynamic Import for Map to avoid SSR issues with Leaflet
const RideRequestMap = dynamic(() => import("./_components/RideRequestMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center rounded-[2rem]"><Loader2 className="animate-spin text-green-500" /></div>
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3";

export default function RideRequestsPage() {
    const { data: session } = useSession();
    const riderId = session?.user?.id;
    const [requests, setRequests] = useState([]);
    const [isLoadingRides, setIsLoadingRides] = useState(false);
    const audioRef = useRef(null);

    // Initialize Audio
    useEffect(() => {
        audioRef.current = new Audio(NOTIFICATION_SOUND);
    }, []);

    // 🔹 Fetch Existing "Searching" Rides
    useEffect(() => {
        const fetchPendingRides = async () => {
            if (!riderId) return;
            try {
                setIsLoadingRides(true);
                const res = await axios.get(`${API_BASE_URL}/bookings?status=searching`);
                if (res.data.success) {
                    // Map existing rides to expected format for the card
                    const pendingRides = res.data.data.map(ride => ({
                        bookingId: ride._id,
                        pickupLocation: ride.pickupLocation.address,
                        dropLocation: ride.dropoffLocation.address,
                        pickupCoords: [ride.pickupLocation.lat, ride.pickupLocation.lng],
                        dropCoords: [ride.dropoffLocation.lat, ride.dropoffLocation.lng],
                        distance: ride.distance,
                        duration: ride.duration,
                        fare: ride.price,
                        passengerName: "Pending Passenger", // Fetch actual names if needed
                        expiresAt: Date.now() + 30000 // Initial 30s for already existing ones
                    }));
                    setRequests(pendingRides);
                }
            } catch (err) {
                console.error("Fetch pending rides error:", err);
            } finally {
                setIsLoadingRides(false);
            }
        };

        fetchPendingRides();
    }, [riderId]);

    // 🔹 Socket Integration & Geolocation Tracking
    useEffect(() => {
        if (!riderId) return;

        const socket = getRiderSocket(riderId);

        // Required: Signal online and request location sync
        socket.emit("rider:online", riderId);

        const handleNewRequest = (ride) => {
            console.log("📥 [SOCKET] New ride request received:", ride);
            // Play sound
            audioRef.current?.play().catch(e => console.log("Sound play error:", e));

            // Add to list with a 30s timer (extended for better UX)
            setRequests(prev => [
                { ...ride, expiresAt: Date.now() + 30000 },
                ...prev
            ]);

            toast.success("New Ride Request Available!", {
                icon: '🚕',
                style: { borderRadius: '15px', background: '#011421', color: '#fff' }
            });
        };

        socket.on("new-ride-request", handleNewRequest);

        // � Response to server's location sync request
        socket.on("request-rider-location", () => {
            console.log("�📍 [SOCKET] Server requested immediate location sync");
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        socket.emit("rider:update-location", {
                            riderId,
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude
                        });
                    },
                    (err) => console.log("Immediate loc sync failed:", err)
                );
            }
        });

        // 📍 Persistent Geolocation Tracking
        let watchId = null;
        if (navigator.geolocation) {
            console.log("📍 [GEO] Starting live tracking on Ride Requests page:", riderId);
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    socket.emit("rider:update-location", {
                        riderId,
                        lat: latitude,
                        lng: longitude
                    });
                    console.log(`📡 [SOCKET] Sent location: ${latitude}, ${longitude}`);
                },
                (error) => console.error("📍 [GEO] error:", error),
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
            );
        }

        return () => {
            socket.off("new-ride-request", handleNewRequest);
            socket.off("request-rider-location");
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [riderId]);

    // 🔹 Timer Management
    useEffect(() => {
        const interval = setInterval(() => {
            setRequests(prev => prev.filter(req => req.expiresAt > Date.now()));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleAccept = async (bookingId) => {
        if (!riderId) return;
        const socket = getRiderSocket(riderId);

        console.log(`📤 Accepting ride ${bookingId}`);
        socket.emit("ride:accept", {
            bookingId: bookingId,
            riderId: riderId
        });

        toast.success("Ride Accepted! Redirecting to mission...");

        // Short delay for socket to process before nav
        setTimeout(() => {
            window.location.href = `/dashboard/rider/ongoing-ride?bookingId=${bookingId}`;
        }, 800);
    };

    const handleReject = (rideId) => {
        setRequests(prev => prev.filter(r => r._id !== rideId));
        toast.error("Request Rejected");
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-8 bg-primary rounded-full" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Dispatch Center</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-[#011421]">
                        Ride <span className="text-primary">Requests</span>
                    </h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                        Real-time incoming trip requests for your proximity
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-[#f5f7fa] px-6 py-4 rounded-2xl border border-gray-100 shadow-inner">
                    <div className="relative h-4 w-4">
                        <div className="h-full w-full rounded-full bg-primary/20 absolute inset-0 animate-ping" />
                        <div className="h-full w-full rounded-full border-2 border-primary flex items-center justify-center relative">
                            <div className="h-1 w-1 rounded-full bg-primary" />
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-[#011421] uppercase tracking-widest">Scanning Active</span>
                </div>
            </div>

            {/* Request Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {requests.length > 0 ? (
                        requests.map((ride) => (
                            <RideRequestCard
                                key={ride.bookingId || ride._id}
                                ride={ride}
                                onAccept={() => handleAccept(ride.bookingId)}
                                onReject={() => handleReject(ride.bookingId || ride._id)}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-2 3xl:col-span-3 h-[500px] flex flex-col items-center justify-center space-y-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm border-dashed"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="h-32 w-32 bg-primary/5 rounded-full absolute -top-4 -left-4 blur-2xl"
                                />
                                <div className="h-24 w-24 bg-[#f5f7fa] rounded-[2rem] flex items-center justify-center border border-gray-100 relative z-10 shadow-sm">
                                    <Search size={32} className="text-primary/40" />
                                </div>
                            </div>
                            <div className="text-center space-y-3">
                                <h3 className="text-xl font-black text-[#011421]/30 tracking-widest uppercase">No Active Missions</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-[250px] mx-auto leading-relaxed">
                                    Stay online to receive instant notifications for new ride requests in your area.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function RideRequestCard({ ride, onAccept, onReject }) {
    const [timeLeft, setTimeLeft] = useState(() => Math.max(0, Math.ceil((ride.expiresAt - Date.now()) / 1000)));

    useEffect(() => {
        const remaining = Math.max(0, Math.ceil((ride.expiresAt - Date.now()) / 1000));
        setTimeLeft(remaining);

        const interval = setInterval(() => {
            const now = Date.now();
            const rem = Math.max(0, Math.ceil((ride.expiresAt - now) / 1000));
            setTimeLeft(rem);
            if (rem <= 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [ride.expiresAt]);

    const progress = (timeLeft / 30) * 100;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -100 }}
            className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-xl hover:shadow-2xl transition-all duration-500"
        >
            {/* Map Preview */}
            <div className="h-56 relative rounded-[2rem] overflow-hidden m-3 border border-gray-50 shadow-inner group-hover:border-primary/20 transition-all">
                <RideRequestMap
                    pickup={ride.pickupCoords || [23.8103, 90.4125]}
                    drop={ride.dropCoords || [23.8213, 90.4195]}
                />

                {/* Floating Info Over Map */}
                <div className="absolute top-3 right-3 z-[400]">
                    <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white shadow-lg">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Est. Fare</p>
                        <h4 className="text-lg font-black text-primary tracking-tighter">৳{ride.fare}</h4>
                    </div>
                </div>

                {/* Countdown Overlay */}
                <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-2.5 bg-[#011421]/95 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-xl">
                    <div className="relative h-7 w-7">
                        <svg className="h-full w-full" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="3" />
                            <path className="stroke-primary" strokeWidth="3" strokeDasharray={`${progress}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">{timeLeft}</span>
                    </div>
                    <span className="text-[8px] font-bold text-white uppercase tracking-widest">Expires In</span>
                </div>
            </div>

            {/* Ride Details */}
            <div className="p-7 pt-4 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm overflow-hidden">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ride.passengerName}`}
                                className="h-10 w-10 object-cover"
                                alt="Passenger"
                            />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-[#011421] tracking-tight">{ride.passengerName}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="flex text-yellow-500 text-[10px]">★★★★★</div>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest italic">Top Rated</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-primary/10 text-primary text-[8px] font-black px-3 py-1.5 rounded-lg border border-primary/20 uppercase tracking-widest">
                        New Order
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1">
                            <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                                <MapPin size={12} />
                            </div>
                            <div className="h-6 w-0.5 bg-gray-100" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Pickup Information</p>
                            <p className="text-[13px] font-bold text-gray-700 truncate tracking-tight">{ride.pickupLocation}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="h-6 w-6 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100">
                            <Navigation size={12} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Final Destination</p>
                            <p className="text-[13px] font-bold text-gray-700 truncate tracking-tight">{ride.dropLocation}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-[#f5f7fa] rounded-2xl p-4 border border-gray-50">
                    <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Distance</p>
                        <p className="text-base font-black text-[#011421] tracking-tighter">{ride.distance || "3.2"} km</p>
                    </div>
                    <div className="space-y-0.5 text-right">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Est. Time</p>
                        <p className="text-base font-black text-[#011421] tracking-tighter">{ride.duration || "12"} min</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={onReject}
                        className="h-14 rounded-xl border border-gray-200 text-gray-400 font-bold uppercase tracking-widest text-[9px] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                    >
                        Decline
                    </button>
                    <button
                        onClick={onAccept}
                        className="h-14 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 hover:bg-primary-dark active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        Accept Ride
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function RadarIcon({ className }) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 12L19.07 4.93" />
            <path d="M12 12V2" />
        </svg>
    );
}
