"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldAlert, MapPin, Activity, HeartHandshake, ArrowRight } from "lucide-react";
import Link from "next/link";

// Mock data content for the SOS zig-zag sections updated with user images
const sosSections = [
    {
        id: 1,
        title: "What is SOS",
        description: "SOS is an emergency safety feature embedded directly inside the OnWay ride experience. With just one tap, you can request immediate help when you feel unsafe or experience a medical emergency during your journey. For this feature you have to Login first.",
        icon: ShieldAlert,
        image: "/sos-4.jpg",
        accent: "text-red-600",
        bgAccent: "bg-red-50"
    },
    {
        id: 2,
        title: "Instant Emergency Alert",
        description: "The moment you trigger an SOS, the app silently pings our top-tier security dispatch. It sends your live GPS location instantly, alerts your predefined emergency contacts, and notifies the local emergency monitoring system without any delay.",
        icon: MapPin,
        image: "/sos-2.jpg",
        accent: "text-red-500",
        bgAccent: "bg-red-50"
    },
    {
        id: 3,
        title: "Smart Support Activation",
        description: "Automatically triggers our rapid-response support protocol. Backend AI monitoring starts instantly analyzing route deviations. A dedicated safety agent immediately accesses your driver and ride tracking data, dialing in to check on your status.",
        icon: Activity,
        image: "/sos-1.jpg",
        accent: "text-red-500",
        bgAccent: "bg-red-50"
    },
    {
        id: 4,
        title: "Ride with Confidence",
        description: "Our mission is to establish the benchmark for modern ride safety. We ensure safer journeys across all partner fleets, building unparalleled trust for passengers and giving you absolute peace of mind while traveling late or alone.",
        icon: HeartHandshake,
        image: "/sos-3.jpg",
        accent: "text-red-500",
        bgAccent: "bg-red-50"
    }
];

export default function SOSPage() {
    return (
        <div className="min-h-screen bg-white pb-24 overflow-x-hidden">

            {/* Hero Header: Clean White Banner */}
            <section className="relative w-full py-24 md:py-32 flex flex-col items-center justify-center text-center px-4 bg-white border-b border-gray-100">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 flex flex-col items-center justify-center text-center gap-8 max-w-4xl mx-auto px-4"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 text-red-500 mb-2 ring-1 ring-red-500/30 relative">
                        {/* Blinking SOS Indicator Pulse */}
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 rounded-full bg-red-500/30"
                        />
                        <ShieldAlert size={48} className="relative z-10" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[#0A1F3D]">
                        Your Safety, <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 relative inline-block">
                            One Tap Away
                            {/* Subtle Red Highlight Line under text */}
                            <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-red-500/50 rounded-full blur-[1px]" />
                        </span>
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-600 font-medium leading-relaxed">
                        Discover how OnWay's state-of-the-art SOS integration provides an invisible shield of protection across every mile you travel.
                    </p>

                </motion.div>
            </section>

            {/* Zig Zag Sections */}
            <section className="relative z-20 -mt-10">
                <div className="flex flex-col">
                    {sosSections.map((section, index) => {
                        const isEven = index % 2 !== 0; // index 1 and 3 are even blocks logically (Section 2 & 4)
                        const sectionBg = isEven ? "bg-white" : "bg-gray-50/50";

                        return (
                            <div key={section.id} className={`${sectionBg} py-20 lg:py-32 relative`}>
                                {/* Thin line connector logic (only show between items, not on last) */}
                                {index !== sosSections.length - 1 && (
                                    <div className="hidden lg:block absolute bottom-0 left-1/2 -ml-[1px] w-[2px] h-32 bg-gradient-to-b from-transparent via-red-200/50 to-transparent translate-y-1/2 z-0" />
                                )}

                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                                    <motion.div
                                        initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                                        className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}
                                    >

                                        {/* Text Content */}
                                        <div className="w-full lg:w-1/2 space-y-8">
                                            <div className="flex items-center gap-4">
                                                <div className={`relative w-16 h-16 rounded-xl ${section.bgAccent} flex items-center justify-center ${section.accent} shadow-inner`}>
                                                    <section.icon size={32} className="relative z-10 drop-shadow-sm" />
                                                    <div className="absolute inset-0 bg-red-400/20 blur-xl rounded-full" />
                                                </div>
                                                {/* Red pulse dot next to title */}
                                                <div className="flex items-center justify-center w-8 h-8 relative">
                                                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                </div>
                                            </div>

                                            <h2 className="text-3xl md:text-5xl font-black text-[#0A1F3D] tracking-tight leading-tight">
                                                {section.title}
                                            </h2>
                                            <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-medium">
                                                {section.description}
                                            </p>
                                        </div>

                                        {/* Image Content */}
                                        <div className="w-full lg:w-1/2">
                                            <motion.div
                                                whileHover={{ scale: 1.05, y: -5 }}
                                                transition={{ duration: 0.4, ease: "easeOut" }}
                                                className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-100 group"
                                            >
                                                <Image
                                                    src={section.image}
                                                    alt={section.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                {/* Subtle Gradient Overlay on Images */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 pointer-events-none" />
                                            </motion.div>
                                        </div>

                                    </motion.div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Bottom CTA Element */}
            <section className="bg-white py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#0A1F3D] rounded-3xl p-12 md:p-20 text-center text-white shadow-[0_20px_60px_-15px_rgba(10,31,61,0.5)] overflow-hidden relative border border-[#112F5A]"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -mt-20 -mr-20 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mb-20 -ml-20 pointer-events-none" />

                        <ShieldAlert size={48} className="mx-auto text-red-500 mb-8 opacity-90" />
                        <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10 tracking-tight">Safe travels start here.</h2>
                        <p className="text-gray-300 mb-12 max-w-2xl mx-auto text-lg md:text-xl relative z-10 font-medium">
                            Activate emergency protocols instantly during your ride. Always monitored, always responsive.
                        </p>
                        <Link href="/" className="group inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-500 text-white px-10 py-5 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-1 transition-all relative z-10 active:scale-95">
                            Secure Your Ride
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>

        </div>
    );
}
