"use client";
import React from "react";
import { motion } from "framer-motion";

const StatsCard = ({ icon: Icon, title, value, change, isCurrency = false }) => {
    const isPositive = change && change.startsWith("+");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm shadow-primary/10">
                    <Icon size={24} />
                </div>
                {change && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {change}
                    </span>
                )}
            </div>

            <div>
                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">{title}</p>
                <h3 className="text-3xl font-black tracking-tight text-[#011421]">
                    {isCurrency ? `৳${value}` : value}
                </h3>
            </div>

            {/* Dynamic pulse for today's stats */}
            {title.toLowerCase().includes("today") && (
                <div className="absolute top-4 right-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </div>
            )}
        </motion.div>
    );
};

export default StatsCard;
