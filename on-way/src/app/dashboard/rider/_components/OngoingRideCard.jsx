"use client";
import React from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, User, Phone, MessageSquare, Clock, ShieldCheck } from "lucide-react";

const OngoingRideCard = ({ ride }) => {
    if (!ride) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-blue-500/20 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 shadow-4xl backdrop-blur-3xl"
        >
            {/* Premium Glow Effect */}
            <div className="absolute -top-20 -right-20 h-64 w-64 bg-blue-500/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 bg-indigo-500/10 rounded-full blur-[80px]" />

            <div className="p-8 md:p-10 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/40">
                            <Navigation size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h2 className="text-3xl font-black text-[#011421] dark:text-white uppercase tracking-tighter">Ongoing Trip</h2>
                                <div className="bg-blue-500/10 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-blue-500/20">LIVE</div>
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Tracking ID: ONW-{ride._id?.toString().slice(-6).toUpperCase() || "PENDING"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/10 border border-white/20 px-6 py-4 rounded-3xl backdrop-blur-xl shadow-xl">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Start Time</p>
                            <p className="text-lg font-black text-[#011421] dark:text-white">
                                {ride.acceptedAt ? new Date(ride.acceptedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-10 items-stretch">
                    {/* Passenger Section */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-500/5 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-white/20 dark:bg-black/20 p-6 rounded-[2rem] border border-white/30 backdrop-blur-xl shadow-2xl flex items-center gap-5">
                                <div className="relative h-20 w-20">
                                    <div className="h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-black overflow-hidden border-2 border-white/50 shadow-inner">
                                        <img
                                            src={ride.passengerImage || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200"}
                                            alt="Passenger"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-green-500 rounded-xl border-4 border-white dark:border-gray-900 flex items-center justify-center text-white">
                                        <ShieldCheck size={14} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-[#011421] dark:text-white leading-tight">{ride.passengerName || "Shafique Rahman"}</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="flex text-yellow-500 text-xs text-pretty">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i}>{i < (ride.passengerRating || 5) ? "★" : "☆"}</span>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-pretty">
                                            {ride.passengerRating || "5.0"} • Verified User
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 px-4">
                            <div className="flex gap-5">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="h-6 w-6 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-xl">
                                        <MapPin size={12} />
                                    </div>
                                    <div className="h-10 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Pickup Point</p>
                                    <p className="text-base font-bold text-gray-700 dark:text-gray-300 leading-tight text-pretty">{ride.pickupLocation?.address || ride.pickupLocation}</p>
                                </div>
                            </div>

                            <div className="flex gap-5">
                                <div className="h-6 w-6 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-xl">
                                    <Navigation size={12} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Destination</p>
                                    <p className="text-base font-bold text-gray-700 dark:text-gray-300 leading-tight text-pretty">{ride.dropLocation?.address || ride.dropLocation}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 h-16 rounded-2xl bg-green-500 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-green-500/30 hover:bg-green-600 transition-all active:scale-95">
                                <Phone size={20} />
                                Call Passenger
                            </button>
                            <button className="h-16 w-16 rounded-2xl bg-white/10 dark:bg-black/20 border border-white/20 flex items-center justify-center text-blue-500 shadow-xl hover:bg-white/20 transition-all active:scale-95">
                                <MessageSquare size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Map/Visualization Section Overlay */}
                    <div className="lg:col-span-7 relative">
                        <div className="h-full min-h-[400px] rounded-[3rem] overflow-hidden border-2 border-white/20 shadow-inner bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                            {/* Simple placeholder for map as we don't have dynamic map logic here yet */}
                            <div className="text-center p-10 space-y-4">
                                <div className="h-20 w-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <MapPin size={40} className="text-blue-500 animate-bounce" />
                                </div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Map Navigation View Active</p>
                            </div>

                            <div className="absolute top-6 right-6">
                                <div className="bg-white/95 dark:bg-[#011421]/95 backdrop-blur-xl px-8 py-5 rounded-[2rem] shadow-3xl border border-white/20">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Estimated Fare</p>
                                    <h4 className="text-3xl font-black text-green-500">৳{ride.fare || 0}</h4>
                                </div>
                            </div>

                            <div className="absolute bottom-8 left-8 right-8">
                                <button className="w-full bg-blue-600 h-16 rounded-3xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-[0.2em] shadow-4xl shadow-blue-600/40 hover:bg-blue-700 transition-all active:scale-[0.98]">
                                    <Navigation size={22} className="animate-pulse" />
                                    Open Real-time Navigation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default OngoingRideCard;
