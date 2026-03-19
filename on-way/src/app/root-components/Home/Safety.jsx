"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, PhoneCall, ArrowRight, ShieldCheck, Download } from "lucide-react";
import Container from "./Container";
import { safetyFeatures } from "./homeData";
import AnimatedButton from "../AnimatedButton";

import { StaggerContainer, AnimatedHeading, AnimatedCard } from "../MotionWrappers";

/**
 * Safety Component (V2)
 * Premium "2026 Tech Product" design with high-end glassmorphism and motion.
 */
export default function Safety() {
  return (
    <section id="safety" className="bg-[#F8FAFC] py-24 sm:py-32 overflow-hidden">
      <Container>
        {/* Top Grid: Content + Feature Cards */}
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center mb-16">
          {/* Left: Content and Actions */}
          <AnimatedHeading className="lg:col-span-6">
            <span className="text-[#22c55e] text-sm font-bold uppercase tracking-[0.2em] block mb-4">
              Every Step of the Way
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A1F3D] leading-[1.1]">
              Safety and support <br />
              <span className="text-[#0A1F3D]/40">built into every trip.</span>
            </h2>
            <p className="mt-6 text-lg text-[#0A1F3D]/60 leading-relaxed max-w-md">
              OnWay pairs smart safety features with responsive support
              so you can ride and travel with absolute confidence.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <AnimatedButton>
                Talk to Support
                <PhoneCall className="w-4 h-4" />
              </AnimatedButton>
              <AnimatedButton>
                Download App
                <ArrowRight className="w-4 h-4" />
              </AnimatedButton>
            </div>
          </AnimatedHeading>

          {/* Right: Feature Cards */}
          <StaggerContainer className="lg:col-span-6 flex flex-col gap-4">
            {safetyFeatures.map((f, idx) => (
              <FeatureCard key={f.title} feature={f} index={idx} />
            ))}
          </StaggerContainer>
        </div>

        {/* Bottom: Full-width SOS Card */}
        <AnimatedHeading>
          <motion.div
            whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(34, 197, 94, 0.1)" }}
            className="relative overflow-hidden rounded-[2.5rem] border border-[#22c55e]/10 bg-white/70 backdrop-blur-xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] group"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#22c55e]/5 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-[#22c55e]/10 transition-colors duration-700" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 md:justify-between">
              <div className="flex items-start md:items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] flex-shrink-0 animate-pulse">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#0A1F3D] tracking-tight mb-2 uppercase">
                    Emergency-Ready Tools
                  </h3>
                  <p className="text-[#0A1F3D]/60 max-w-xl leading-relaxed">
                    Use in-app SOS tools to quickly reach help and share your location
                    with trusted contacts. One tap for total peace of mind.
                  </p>
                </div>
              </div>
              <AnimatedButton>
                Configure SOS
              </AnimatedButton>
            </div>
          </motion.div>
        </AnimatedHeading>
      </Container>
    </section>
  );
}

function FeatureCard({ feature, index }) {
  const Icon = feature.icon || ShieldCheck;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 }
      }}
      whileHover={{ x: 10, scale: 1.01 }}
      className="group flex items-center gap-6 p-6 md:p-8 rounded-[2rem] bg-white border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all cursor-pointer"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#f8fafc] group-hover:bg-[#22c55e]/5 flex items-center justify-center text-[#0A1F3D]/30 group-hover:text-[#22c55e] transition-all duration-300">
        <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </div>
      <div>
        <h4 className="text-lg font-black text-[#0A1F3D] tracking-tight leading-tight uppercase mb-1">
          {feature.title}
        </h4>
        <p className="text-sm text-[#0A1F3D]/60 leading-relaxed font-medium">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}
