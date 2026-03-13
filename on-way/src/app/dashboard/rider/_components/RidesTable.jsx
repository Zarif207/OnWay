"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";

const RidesTable = ({ rides }) => {
    return (
        <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
            <div className="p-8 border-b border-gray-100 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-[#011421] items-center flex gap-2">
                        Recent Activity
                        <div className="h-2 w-2 rounded-full bg-primary" />
                    </h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Last 5 completed rides</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary/5 border border-primary/20 text-sm font-black text-primary hover:bg-primary/10 transition-all active:scale-95">
                    VIEW HISTORY
                    <ArrowUpRight size={16} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#f5f7fa] text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">
                        <tr>
                            <th className="px-8 py-5">Passenger</th>
                            <th className="px-8 py-5">Route</th>
                            <th className="px-8 py-5">Fare</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {rides.length > 0 ? (
                            rides.map((ride, index) => (
                                <motion.tr
                                    key={ride._id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="hover:bg-gray-50/50 transition-all group cursor-default"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black text-sm shadow-sm">
                                                {(ride.passengerName || "G").charAt(0)}
                                            </div>
                                            <div>
                                                <span className="font-black text-[#011421] block text-sm">
                                                    {ride.passengerName || "Guest Rider"}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    Verified User
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                <MapPin size={12} className="text-primary" />
                                                <span className="max-w-[180px] truncate">{ride.pickupLocation}</span>
                                            </div>
                                            <div className="h-3 w-px bg-gray-200 ml-1.5" />
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                <MapPin size={12} className="text-[#011421]" />
                                                <span className="max-w-[180px] truncate">{ride.dropLocation}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-lg font-black text-[#011421]">
                                            ৳{parseFloat(ride.fare).toFixed(0)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${ride.status === "completed"
                                            ? "bg-green-500/10 text-green-600 border border-green-500/20"
                                            : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                                            }`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${ride.status === "completed" ? "bg-green-600" : "bg-yellow-600"}`} />
                                            {ride.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                            <Clock size={14} className="text-gray-400" />
                                            {new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-8 py-24 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-30">
                                        <div className="h-16 w-16 rounded-full border-4 border-dashed border-gray-400 animate-spin-slow" />
                                        <p className="font-black text-gray-500 uppercase tracking-[0.3em]">No activity yet</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RidesTable;
