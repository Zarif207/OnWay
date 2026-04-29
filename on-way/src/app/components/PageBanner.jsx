"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

/**
 * PageBanner — identical design to the /developers hero.
 * Grain · animated mesh · grid · parallax scroll · wave.
 * Only title / subtitle / tag / pills change per page.
 *
 * @param {string}   title    — large heading (required)
 * @param {string}   subtitle — paragraph below heading (optional)
 * @param {string}   tag      — eyebrow badge text (optional)
 * @param {string}   waveFill — SVG wave fill color (default #f4f6f9, match page bg)
 */
export default function PageBanner({ title, subtitle, tag, pills, waveFill = "#f4f6f9", titleSize = "text-6xl sm:text-7xl md:text-8xl" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y       = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#060d18]"
    >
      {/* ── Grain texture ── */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay z-10"
        style={{ backgroundImage: GRAIN_SVG, backgroundSize: "200px 200px" }}
      />

      {/* ── Animated gradient mesh ── */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-[#2FCA71]/10 blur-[130px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/6 blur-[100px]"
        />
      </div>

      {/* ── Grid lines ── */}
      <div
        className="absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Top border line ── */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FCA71]/40 to-transparent z-10" />

      {/* ── Parallax content ── */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        {/* Eyebrow badge */}
        {tag && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-10"
          >
            <span className="w-2 h-2 rounded-full bg-[#2FCA71] animate-pulse" />
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">
              {tag}
            </span>
          </motion.div>
        )}

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className={`${titleSize} font-black text-white tracking-tighter leading-[0.9] mb-8`}
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-14"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Pills row */}
        {pills && pills.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {pills.map((pill, i) => (
              <motion.span
                key={pill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-gray-400 hover:text-white hover:border-[#2FCA71]/40 hover:bg-[#2FCA71]/5 transition-all duration-200 cursor-default"
              >
                {pill}
              </motion.span>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* ── Bottom wave ── */}
      <div className="absolute bottom-0 left-0 w-full z-10">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0 80L1440 80L1440 30C1200 75 960 5 720 30C480 55 240 5 0 30L0 80Z" fill={waveFill} />
        </svg>
      </div>
    </section>
  );
}
