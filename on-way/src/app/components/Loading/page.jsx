"use client";

import { useEffect, useState } from "react";
import { Car } from "lucide-react";

/**
 * OnWayLoading Component
 * A premium loading screen with a moving car animation and progress bar.
 * Used across the dashboard and other high-level components.
 */
export default function OnWayLoading() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Smooth progress animation
        const timer = setInterval(() => {
            setProgress((old) => {
                if (old >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                // Increment progress slightly non-linearly for more "natural" feel
                const diff = Math.random() * 10;
                return Math.min(old + diff, 100);
            });
        }, 150);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50 backdrop-blur-sm fixed inset-0 z-[9999]">
            <div className="text-center w-full max-w-md px-6">
                {/* Car Track */}
                <div className="relative h-20 mb-8 overflow-hidden w-full bg-white/50 rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div
                        className="absolute text-[#2FCA71] transition-all duration-300 ease-out"
                        style={{
                            left: `${progress}%`,
                            transform: `translateX(-50%)`,
                            filter: "drop-shadow(0 4px 6px rgba(47, 202, 113, 0.2))"
                        }}
                    >
                        <Car size={48} fill="currentColor" fillOpacity={0.1} strokeWidth={1.5} />
                        {/* Speed lines effect */}
                        <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 flex gap-1 opacity-50">
                            <div className="w-4 h-0.5 bg-[#2FCA71] rounded-full animate-pulse" />
                            <div className="w-2 h-0.5 bg-[#2FCA71] rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                        </div>
                    </div>
                </div>

                {/* Branding */}
                <div className="mb-8 space-y-2">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight">
                        On<span className="text-[#2FCA71]">Way</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-medium tracking-widest uppercase">
                        Optimization Engine Initializing
                    </p>
                </div>

                {/* Progress Bar Container */}
                <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner mb-4">
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#2FCA71] to-[#26a15a] rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(47,202,113,0.4)]"
                        style={{ width: `${progress}%` }}
                    >
                        {/* Glossy effect */}
                        <div className="absolute inset-0 bg-white/20" style={{ transform: 'skewX(-20deg)' }} />
                    </div>
                </div>

                {/* Percentage and Status */}
                <div className="flex justify-between items-center px-1">
                    <p className="text-[#2FCA71] text-sm font-bold font-mono">
                        {progress.toFixed(0)}%
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="w-1.5 h-1.5 bg-[#2FCA71] rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">
                            Synchronizing Bridge
                        </span>
                    </div>
                </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
        </div>
    );
}
