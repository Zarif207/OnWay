"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    Search,
    Filter,
    MapPin,
    Clock,
    Calendar,
    Navigation,
    DollarSign,
    ChevronRight,
    Loader2,
    AlertCircle,
    Download,
    MoreVertical,
    ArrowRight,
    CheckCircle2,
    XCircle,
    CircleDot
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getRiderSocket } from "@/lib/socket";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const statusColors = {
    ongoing: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20"
};

const RideDetailsModal = ({ ride, onClose }) => {
    if (!ride) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl p-8 lg:p-12"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-gray-400 hover:text-[#011421] transition-colors"
                >
                    <XCircle size={32} strokeWidth={1.5} />
                </button>

                <div className="space-y-10">
                    <header>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[ride.status] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                            {ride.status}
                        </span>
                        <h2 className="text-4xl font-black text-[#011421] mt-4 tracking-tighter">Mission <span className="text-primary">Details</span></h2>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Passenger</p>
                                <h4 className="text-2xl font-black text-[#011421]">{ride.passengerName}</h4>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center py-1">
                                        <CircleDot size={14} className="text-primary" />
                                        <div className="w-0.5 h-12 bg-gray-200 my-1" />
                                        <MapPin size={14} className="text-[#011421]" />
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Pick up</p>
                                            <p className="text-sm font-bold text-gray-700 leading-snug">{ride.pickup}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Drop off</p>
                                            <p className="text-sm font-bold text-gray-700 leading-snug">{ride.dropoff}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Fare (Net)</p>
                                    <p className="text-2xl font-black text-primary">৳{ride.fare}</p>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <DollarSign className="text-primary" />
                                </div>
                            </div>
                            <div className="h-px bg-gray-200" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Distance</p>
                                    <p className="text-lg font-black text-[#011421]">{ride.distance} KM</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Date</p>
                                    <p className="text-sm font-bold text-[#011421]">{new Date(ride.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="pt-6 flex justify-center opacity-20">
                        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-500 italic">OnWay Protocol Encrypted Session</p>
                    </footer>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function MyRidesHistory() {
    const { data: session } = useSession();
    const riderId = session?.user?.id;
    const [activeTab, setActiveTab] = useState("completed");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRide, setSelectedRide] = useState(null);
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const loadMoreRef = useRef();

    // 1. Fetch Infinite Rides
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch
    } = useInfiniteQuery({
        queryKey: ["ridesHistory", riderId, activeTab, searchQuery, dateRange],
        queryFn: async ({ pageParam = 1 }) => {
            const endpoint = searchQuery
                ? `${API_BASE_URL}/riders/rides/search?driverId=${riderId}&q=${searchQuery}`
                : `${API_BASE_URL}/riders/rides?driverId=${riderId}&status=${activeTab}&page=${pageParam}&limit=10&startDate=${dateRange.start}&endDate=${dateRange.end}`;

            const res = await axios.get(endpoint);
            return res.data.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.currentPage < lastPage.totalPages) {
                return lastPage.currentPage + 1;
            }
            return undefined;
        },
        enabled: !!riderId,
    });

    // 2. Infinite Scroll Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, fetchNextPage]);

    // 3. Status Badge Helper
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle2 size={12} />;
            case 'cancelled': return <AlertCircle size={12} />;
            case 'ongoing': return <Navigation size={12} className="animate-pulse" />;
            default: return null;
        }
    };

    const exportToCSV = () => {
        const rides = data?.pages.flatMap(p => p.rides) || [];
        if (rides.length === 0) return;

        const headers = ["Passenger", "Pickup", "Dropoff", "Distance", "Fare", "Date", "Status"];
        const csvContent = [
            headers.join(","),
            ...rides.map(r => [
                `"${r.passengerName}"`,
                `"${r.pickup}"`,
                `"${r.dropoff}"`,
                r.distance,
                r.fare,
                new Date(r.createdAt).toLocaleString(),
                r.status
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `onway_rides_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-24 pt-4 px-2">
            {/* Header */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-12 bg-primary rounded-full" />
                        <span className="text-xs font-black text-primary uppercase tracking-[0.4em]">Historical Database</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-[-0.05em] text-[#011421]">
                        Log <span className="text-primary">Archive</span>
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                        Mission History Central Terminal
                    </p>
                </div>

                <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow min-w-[300px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Query Manifest..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-14 pr-6 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#011421] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                        />
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="h-14 px-8 bg-primary hover:bg-primary-dark text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 transition-all active:scale-95"
                    >
                        <Download size={18} /> Export Data
                    </button>
                </div>
            </header>

            {/* Control Bar */}
            <div className="flex flex-col xxl:flex-row gap-8 justify-between items-center bg-white p-3 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex bg-gray-50 p-1.5 rounded-[1.2rem] w-full xxl:w-auto border border-gray-100">
                    {["ongoing", "completed", "cancelled"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-grow xxl:flex-none px-10 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === tab
                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                : "text-gray-500 hover:text-[#011421] hover:bg-white"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 w-full xxl:w-auto px-4">
                    <div className="flex items-center gap-3 text-gray-500">
                        <Calendar size={18} className="text-primary" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="bg-transparent border border-gray-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-[#011421] focus:border-primary focus:outline-none"
                        />
                        <ArrowRight size={14} className="text-gray-400" />
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="bg-transparent border border-gray-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-[#011421] focus:border-primary focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Rides Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <AnimatePresence mode="popLayout">
                    {data?.pages.flatMap(page => page.rides).map((ride, idx) => (
                        <motion.div
                            layout
                            key={ride._id || idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            onClick={() => setSelectedRide(ride)}
                            className="group relative cursor-pointer"
                        >
                            <div className="h-full bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-primary/30 transition-all hover:shadow-lg shadow-sm">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-primary uppercase tracking-widest italic">Mission {idx + 1}</p>
                                        <h3 className="text-2xl font-black text-[#011421] tracking-tight">{ride.passengerName}</h3>
                                    </div>
                                    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[ride.status]}`}>
                                        {getStatusIcon(ride.status)} {ride.status}
                                    </span>
                                </div>

                                <div className="flex gap-4 mb-10">
                                    <div className="flex flex-col items-center py-1">
                                        <div className="h-2 w-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
                                        <div className="w-px h-10 bg-gray-200 my-1" />
                                        <div className="h-2 w-2 rounded-full bg-[#011421] shadow-lg shadow-[#011421]/50" />
                                    </div>
                                    <div className="space-y-4 flex-grow overflow-hidden">
                                        <p className="text-[11px] font-bold text-gray-500 divide-x-2 divide-gray-200 flex items-center gap-2 truncate">
                                            <span className="truncate">{ride.pickup}</span>
                                            <ChevronRight size={10} className="min-w-[10px]" />
                                            <span className="truncate text-gray-700">{ride.dropoff}</span>
                                        </p>
                                        <div className="flex gap-6">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                <Navigation size={12} className="text-primary" /> {ride.distance} KM
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                <Clock size={12} className="text-gray-400" /> {new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[10px] font-black text-gray-500">৳</span>
                                        <span className="text-2xl font-black text-primary tracking-tighter">{ride.fare}</span>
                                    </div>
                                    <button className="h-10 w-10 bg-gray-50 group-hover:bg-primary rounded-xl flex items-center justify-center transition-all">
                                        <ChevronRight size={18} className="text-gray-400 group-hover:text-white" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <div ref={loadMoreRef} className="col-span-1 md:col-span-2 py-10 flex justify-center">
                    {isFetchingNextPage ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            <p className="text-[10px] font-black text-primary/50 uppercase tracking-widest">Hydrating Archives...</p>
                        </div>
                    ) : !hasNextPage && (data?.pages[0].rides.length > 0) ? (
                        <div className="opacity-20 flex flex-col items-center gap-2">
                            <div className="h-px w-20 bg-gray-500" />
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em]">Manifest End Reached</p>
                        </div>
                    ) : null}
                </div>

                {/* Empty State */}
                {!isLoading && data?.pages[0].rides.length === 0 && (
                    <div className="col-span-1 md:col-span-2 h-[400px] flex flex-col items-center justify-center space-y-6">
                        <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 opacity-50 shadow-sm">
                            <AlertCircle size={48} className="text-gray-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Record Vacuum: No Missions Found</p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setDateRange({ start: "", end: "" });
                            }}
                            className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Ride Details Modal */}
            <AnimatePresence>
                {selectedRide && (
                    <RideDetailsModal
                        ride={selectedRide}
                        onClose={() => setSelectedRide(null)}
                    />
                )}
            </AnimatePresence>

            {/* Footer Branding */}
            <footer className="pt-20 pb-10 flex flex-col items-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full" />
                <p className="text-[9px] font-black uppercase tracking-[0.8em] text-gray-400">
                    OnWay Cloud Intelligence • Mission Archive Unit
                </p>
            </footer>
        </div>
    );
}
