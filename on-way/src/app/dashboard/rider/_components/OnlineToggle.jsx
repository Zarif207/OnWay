"use client";
import React from "react";
import { motion } from "framer-motion";

const OnlineToggle = ({ isOnline, onToggle, isLoading }) => {
    return (
        <div className="flex items-center gap-5 bg-white p-2 pr-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col items-end">
                <span className={`text-xs font-black tracking-tighter ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                    {isOnline ? "ONLINE" : "OFFLINE"}
                </span>
                <div className="flex items-center gap-1.5">
                    {isOnline && (
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                        </span>
                    )}
                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">
                        {isOnline ? "Duty" : "Break"}
                    </span>
                </div>
            </div>

            <button
                onClick={onToggle}
                disabled={isLoading}
                className={`relative h-11 w-20 rounded-2xl p-1.5 transition-all duration-500 shadow-inner overflow-hidden ${isOnline ? "bg-green-500/10 border border-green-500/20" : "bg-[#f5f7fa] border border-gray-100"
                    }`}
            >
                {/* Animated Glow */}
                {isOnline && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.1, 0.4, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-green-400 blur-xl"
                    />
                )}

                {/* Thumb */}
                <motion.div
                    animate={{ x: isOnline ? 36 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`relative h-7 w-7 rounded-xl shadow-md flex items-center justify-center transition-colors duration-300 ${isOnline ? "bg-green-500" : "bg-gray-300"
                        }`}
                >
                    {isLoading ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                    ) : (
                        <div className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-white' : 'bg-white'}`} />
                    )}
                </motion.div>
            </button>
        </div>
    );
};

export default OnlineToggle;
