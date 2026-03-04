"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Car,
    ChevronRight,
    Check,
    X,
    Phone,
    ArrowRight
} from "lucide-react";
import Image from "next/image";

/**
 * Pricing Page Component
 * Exactly matches the reference design layout with OnWay branding.
 */
export default function PricingPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0 }
    };

    const pricingPlans = [
        {
            name: "Starter",
            price: "$249",
            period: "/Month",
            highlight: false,
            features: [
                { text: "Priority City Rides", included: true },
                { text: "Verified Professional Drivers", included: true },
                { text: "Basic Ride Analytics", included: true },
                { text: "Real-time AI Tracking", included: false },
            ]
        },
        {
            name: "Standard",
            price: "$499",
            period: "/Month",
            highlight: true,
            features: [
                { text: "Unlimited Premium Rides", included: true },
                { text: "Dedicated Private Driver", included: true },
                { text: "Advanced Safety Dashboard", included: true },
                { text: "24/7 VIP Multi-Track", included: true },
            ]
        },
        {
            name: "Premium",
            price: "$899",
            period: "/Month",
            highlight: false,
            features: [
                { text: "Global Inter-City Mobility", included: true },
                { text: "Corporate Fleet Access", included: true },
                { text: "Enterprise Management Tools", included: true },
                { text: "Unlimited Real-time Support", included: true },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
                >

                    {/* ================= LEFT COLUMN: CONTENT ================= */}
                    <motion.div variants={itemVariants} className="space-y-8">
                        <div className="flex items-center gap-2 text-[#22c55e] font-black uppercase tracking-[0.2em] text-xs">
                            <Car size={16} fill="currentColor" />
                            Pricing Plan
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-[#0A1F3D] tracking-tighter leading-[1.1]">
                            Leading premium <br /> mobility and <br /> transport agency
                        </h1>

                        <p className="text-[#A0AEC0] text-lg font-medium leading-relaxed max-w-lg">
                            With years of experience providing solutions to large-scale enterprises throughout the globe, we offer end-to-end mobility tailored for specific markets.
                        </p>

                        <ul className="space-y-5">
                            {[
                                "We will never compromise the safety of our riders",
                                "Advanced solutions for modern urban mobility"
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-3 text-[#0A1F3D] font-black text-lg">
                                    <div className="flex -space-x-1 text-[#22c55e]">
                                        <ChevronRight size={20} strokeWidth={3} />
                                        <ChevronRight size={20} strokeWidth={3} />
                                    </div>
                                    {text}
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-center gap-5 pt-4">
                            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#22c55e] shadow-xl">
                                <Image
                                    src="https://plus.unsplash.com/premium_photo-1683121366620-dc435057967c?auto=format&fit=crop&q=80&w=200&h=200"
                                    alt="Support"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Call Us for any Inquiry</span>
                                <span className="text-2xl font-black text-[#22c55e] tracking-tighter">148 359 505 285</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* ================= RIGHT COLUMN: PRICING CARDS ================= */}
                    <div className="space-y-8 lg:space-y-6">
                        {pricingPlans.map((plan, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, x: 10 }}
                                className={`relative flex flex-col md:flex-row items-center justify-between p-8 md:p-10 rounded-[2.5rem] transition-all duration-500 shadow-2xl ${plan.highlight
                                        ? "bg-[#0A1F3D] text-white shadow-[#0A1F3D]/20 scale-105 z-10"
                                        : "bg-white text-[#0A1F3D] shadow-zinc-200/50"
                                    }`}
                            >
                                {/* Decoration for standard card */}
                                {plan.highlight && (
                                    <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden rounded-[2.5rem]">
                                        <svg viewBox="0 0 400 200" className="w-full h-full object-cover">
                                            <path d="M-50,150 C50,50 150,250 250,150 C350,50 450,250 550,150" fill="none" stroke="#22c55e" strokeWidth="1" />
                                        </svg>
                                    </div>
                                )}

                                <div className="flex flex-col mb-8 md:mb-0">
                                    <span className={`text-sm font-black uppercase tracking-widest mb-2 ${plan.highlight ? "text-[#22c55e]" : "text-zinc-400"}`}>
                                        {plan.name}
                                    </span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl md:text-5xl font-black tracking-tighter">{plan.price}</span>
                                        <span className={`text-sm font-bold ${plan.highlight ? "text-white/40" : "text-zinc-400"}`}>{plan.period}</span>
                                    </div>

                                    {/* Button Inside Card - Aligned to bottom-left relative to content */}
                                    <button className={`mt-8 flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${plan.highlight
                                            ? "bg-white text-[#0A1F3D] hover:bg-[#22c55e] hover:text-white"
                                            : "bg-zinc-100 text-[#0A1F3D] hover:bg-[#22c55e] hover:text-white"
                                        }`}>
                                        Get Started <ArrowRight size={14} />
                                    </button>
                                </div>

                                <div className={`hidden md:block w-px h-24 ${plan.highlight ? "bg-white/10" : "bg-zinc-100"}`} />

                                <ul className="space-y-4 w-full md:w-auto md:min-w-[240px]">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-4 group">
                                            <div className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-sm transition-colors ${feature.included
                                                    ? "text-[#22c55e]"
                                                    : "text-zinc-300"
                                                }`}>
                                                {feature.included ? <Check size={18} strokeWidth={3} /> : <X size={18} strokeWidth={2} />}
                                            </div>
                                            <span className={`text-sm font-bold tracking-tight transition-colors ${feature.included
                                                    ? (plan.highlight ? "text-white" : "text-[#0A1F3D]")
                                                    : "text-zinc-400"
                                                }`}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                </motion.div>

                {/* ================= BOTTOM DECORATION (Drone/Packages) - Placeholder ================= */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 opacity-20 pointer-events-none hidden lg:block"
                >
                    <Car size={160} className="text-[#22c55e]" strokeWidth={0.5} />
                </motion.div>

            </div>
        </div>
    );
}