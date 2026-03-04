"use client";

import React from "react";
import { stats } from "./homeData";
import { motion } from "framer-motion";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 items-center">
          {stats.map((stat, index) => (
            <div key={index} className="relative group p-8 lg:p-12">
              {/* Vertical Divider */}
              {index !== stats.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-20 bg-white/10" />
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center lg:items-start space-y-4"
              >
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
                    {stat.value}
                  </h3>
                  <p className="mt-2 text-[#A0AEC0] text-sm md:text-base font-bold uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
