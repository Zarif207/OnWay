"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Play, Clock, Wallet, Users, Star, ArrowRight, Video } from "lucide-react";
import Container from "./Container";
import { earnFeatures } from "./homeData";

import { StaggerContainer, AnimatedHeading } from "../MotionWrappers";

/**
 * Earn Component (V2)
 * High-end dual-media layout with polygon feature grid.
 * Inspired by Logistics/Fintech world-class design patterns.
 */
export default function Earn() {
  const containerRef = useRef(null);

  return (
    <section id="earn" ref={containerRef} className="bg-white py-24 sm:py-32 overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 lg:items-center">

          {/* LEFT: Media Section */}
          <div className="relative">
            {/* Background Decoration (Cargo Box Style) */}
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute -bottom-16 -left-12 w-56 h-56 bg-[#0A1F3D] rounded-3xl flex items-center justify-center -rotate-12 z-0 shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              <span className="text-white/10 font-black text-5xl tracking-tighter leading-none text-center">
                ONWAY <br /> CARGO
              </span>
            </motion.div>

            {/* Main Video Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="relative z-10 aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.07)] border-[12px] border-white group"
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/onway-vid-2.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-700" />
            </motion.div>

            {/* Overlapping Vertical Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: 30, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute -bottom-12 -right-6 w-[48%] aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-[0_30px_70px_rgba(34,197,94,0.1)] border-8 border-white z-20 group"
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/onway-v.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-[#22c55e]/10 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-500" />

              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 hidden md:block">
                <p className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Video size={12} className="text-[#22c55e]" /> Live Network
                </p>
              </div>
            </motion.div>

            {/* Curved Connector SVG */}
            <svg className="absolute top-1/2 left-[40%] w-full h-full pointer-events-none z-15 overflow-visible hidden lg:block">
              <motion.path
                d="M 0 0 C 120 0, 120 200, 50 200"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.6 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.6 }}
              />
            </svg>
          </div>

          {/* RIGHT: Content Section */}
          <div className="relative">
            <AnimatedHeading className="mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-[#0A1F3D] leading-[1.05] mb-6">
                Logistics service <br />
                outsourcing’s advantages <br />
                <span className="bg-linear-to-r from-[#2FCA71] to-[#259461] bg-clip-text text-transparent">in 2026.</span>
              </h2>
            </AnimatedHeading>

            {/* Polygon Feature Grid */}
            <StaggerContainer className="grid sm:grid-cols-2 gap-4">
              {earnFeatures.map((f, i) => (
                <FeatureCard key={i} feature={f} index={i} />
              ))}
            </StaggerContainer>
          </div>

        </div>
      </Container>
    </section>
  );
}

function FeatureCard({ feature, index }) {
  const Icon = feature.icon || ShieldCheck;
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="group relative p-8 bg-[#F8FAFC] overflow-hidden transition-all duration-300 shadow-sm hover:shadow-[0_25px_50px_rgba(34,197,94,0.08)] border border-transparent hover:border-[#22c55e]/10 cursor-pointer"
      style={{
        clipPath: "polygon(0% 0%, 88% 0%, 100% 50%, 88% 100%, 0% 100%, 5% 50%)",
        borderRadius: "1rem"
      }}
    >
      <div className="relative z-10 px-2 text-center sm:text-left">
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#22c55e] shadow-sm mb-6 group-hover:scale-110 group-hover:bg-[#22c55e] group-hover:text-white transition-all duration-300">
          <Icon size={26} />
        </div>
        <h4 className="text-xl font-black text-[#0A1F3D] mb-2 uppercase tracking-tight">
          {feature.title}
        </h4>
        <p className="text-[#0A1F3D]/60 text-sm font-semibold leading-relaxed">
          {feature.desc}
        </p>
      </div>

      {/* Subtle Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-[#22c55e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
