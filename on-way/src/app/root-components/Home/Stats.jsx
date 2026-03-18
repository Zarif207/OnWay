"use client";

import React, { useState, useEffect, useRef } from "react";
import { stats } from "./homeData";
import { useInView, animate } from "framer-motion";
import { StaggerContainer, AnimatedCard } from "../MotionWrappers";

const Counter = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);

  // Only trigger when the counter comes into view
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
  const suffix = value.replace(/[0-9]/g, "");

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, numericValue, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
      });
      return () => controls.stop();
    }
  }, [numericValue, isInView]);

  return (
    <span ref={ref} className="inline-block tabular-nums">
      {displayValue}
      {suffix}
    </span>
  );
};

const Stats = () => {
  return (
    <section className="relative py-28 px-6 lg:px-8 overflow-hidden">
      {/* Premium Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        poster="/home-4.avif" // Fallback image while video loads
      >
        <source src="/body-vid-1.mp4" type="video/mp4" />
      </video>

      {/* Dark Navy Gradient Overlay for readability and premium SaaS feel */}
      <div className="absolute inset-0 bg-[#0A1F3D]/80 mix-blend-multiply z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#0A1F3D]/40 z-0" />

      {/* Subtle radial glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1)_0%,transparent_70%)] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 items-center">
          {stats.map((stat, index) => (
            <AnimatedCard
              key={index}
              className="relative group p-8 lg:p-12 transition-transform duration-500 ease-out hover:scale-[1.03] will-change-transform rounded-2xl lg:rounded-none"
            >
              {/* Vertical Divider (Desktop Only) */}
              {index !== stats.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-24 bg-gradient-to-b from-transparent via-white/15 to-transparent" />
              )}

              <div className="flex flex-col items-center lg:items-start space-y-5 relative z-10">
                {/* Icon Container with glowing background */}
                <div className="relative p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group-hover:bg-[#22c55e]/15 group-hover:border-[#22c55e]/30 transition-all duration-500 overflow-hidden">
                  {/* Subtle inner glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#22c55e]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <stat.icon
                    className="w-8 h-8 text-[#A0AEC0] group-hover:text-[#22c55e] transition-colors duration-500 drop-shadow-[0_0_8px_rgba(34,197,94,0)] group-hover:drop-shadow-[0_0_12px_rgba(34,197,94,0.6)] relative z-10"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Text Content */}
                <div className="text-center lg:text-left w-full">
                  <h3 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tighter drop-shadow-lg">
                    <Counter value={stat.value} />
                  </h3>
                  <p className="mt-3 text-[#A0AEC0] text-xs sm:text-sm font-bold uppercase tracking-[0.25em] opacity-80 group-hover:text-white transition-colors duration-500">
                    {stat.label}
                  </p>
                </div>
              </div>

              {/* Card Hover Glow Effect (Mobile/Tablet specific styling mostly, but adds to overall feel) */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl lg:rounded-none pointer-events-none" />
            </AnimatedCard>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default Stats;

