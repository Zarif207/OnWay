"use client";

import React, { useState, useEffect } from "react";
import { stats } from "./homeData";
import { motion, useSpring, useTransform, animate } from "framer-motion";
import { StaggerContainer, AnimatedCard } from "../MotionWrappers";

const Counter = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
  const suffix = value.replace(/[0-9]/g, "");

  useEffect(() => {
    const controls = animate(0, numericValue, {
      duration: 2,
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [numericValue]);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
};

const Stats = () => {
  return (
    <section
      className="relative py-24 px-8 overflow-hidden bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/home-4.avif')" }}
    >
      {/* Dark Navy Overlay & Gradient */}
      <div className="absolute inset-0 bg-[#0A1F3D]/90 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#050B1A]/50 to-transparent z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 items-center">
          {stats.map((stat, index) => (
            <AnimatedCard key={index} className="relative group p-8 lg:p-12">
              {/* Vertical Divider */}
              {index !== stats.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-20 bg-white/10" />
              )}

              <div className="flex flex-col items-center lg:items-start space-y-4">
                {/* Icon Container */}
                <div className="p-3 rounded-xl bg-[#22c55e]/5 group-hover:bg-[#22c55e]/10 transition-colors duration-300">
                  <stat.icon
                    className="w-8 h-8 text-[#22c55e]"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Text Content */}
                <div className="text-center lg:text-left">
                  <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">
                    <Counter value={stat.value} />
                  </h3>
                  <p className="mt-2 text-[#A0AEC0] text-sm md:text-base font-bold uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    {stat.label}
                  </p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default Stats;

