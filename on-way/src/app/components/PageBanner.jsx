"use client";

import { motion } from "framer-motion";

/**
 * PageBanner — shared across ALL footer pages.
 * Design is IDENTICAL everywhere. Only title/subtitle/tag change.
 */
export default function PageBanner({ title, subtitle, tag }) {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-[#060d18]">

      {/* ── Animated glow orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 35, 0], y: [0, -25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#2FCA71]/10 blur-[130px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[110px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-violet-500/5 blur-[90px]"
        />
      </div>

      {/* ── Subtle grid ── */}
      {/* <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      /> */}

      {/* ── Top hairline ── */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FCA71]/50 to-transparent" />

      {/* ── Content ── */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto py-20">
        {tag && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md mb-7"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2FCA71] animate-pulse" />
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.22em]">{tag}</span>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter leading-[0.92] mb-6"
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* ── Wave transition into page body ── */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0 64L1440 64L1440 24C1200 60 960 4 720 24C480 44 240 4 0 24L0 64Z" fill="#f4f6f9" />
        </svg>
      </div>
    </section>
  );
}
