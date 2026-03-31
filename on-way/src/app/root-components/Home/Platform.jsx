"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Download } from "lucide-react";
import Container from "./Container";
import { services } from "./homeData";

import { StaggerContainer, AnimatedHeading } from "../MotionWrappers";
import Link from "next/link";

/**
 * Platform Component (V2 - 2026 Fintech Edition)
 * Inspired by Stripe, Linear, and Apple design systems.
 */
export default function Platform() {
  const initial = services[0]?.key ?? "bike";
  const [active, setActive] = useState(initial);

  const current = useMemo(
    () => services.find((s) => s.key === active) ?? services[0],
    [active]
  );

  return (
    <section id="services" className="bg-[#F8FAFC] py-24 sm:py-32 overflow-hidden">
      <Container>
        {/* Header Section */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between mb-16">
          <AnimatedHeading className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A1F3D] leading-[1.1]">
              Everything you need, <br />
              <span className="text-[#0A1F3D]/40 bg-gradient-to-r from-[#2FCA71] to-[#259461] bg-clip-text text-transparent">right in your pocket.</span>
            </h2>
            <p className="mt-6 text-lg text-[#0A1F3D]/60 leading-relaxed max-w-lg">
              Ride, travel, and pay — OnWay brings everyday mobility services
              together with a consistent, premium experience.
            </p>
          </AnimatedHeading>

          {/* Switcher Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex gap-2 p-2 bg-white/50 backdrop-blur-md border border-gray-200/50 rounded-[2rem] shadow-sm overflow-x-auto scrollbar-hide"
          >
            {services.map((s) => {
              const Icon = s.icon;
              const isActive = s.key === active;
              return (
                <motion.button
                  key={s.key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActive(s.key)}
                  className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${isActive ? "text-white" : "text-[#0A1F3D]/60 hover:text-[#0A1F3D]"
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-[#0A1F3D] rounded-2xl z-0 shadow-lg shadow-[#0A1F3D]/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={`relative z-10 w-4 h-4 transition-colors ${isActive ? "text-[#22c55e]" : "text-[#0A1F3D]/30"}`} />
                  <span className="relative z-10">{s.name.replace("OnWay ", "")}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        {/* Feature Grid */}
        <StaggerContainer className="grid gap-8 lg:grid-cols-12">
          {/* Main Display Card */}
          <motion.div
            layout
            key={current.key}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7"
          >
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              className={`group relative h-full overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] transition-all duration-500`}
            >
              {/* Subtle Animated Gradient Background */}
              <div className={`absolute inset-0 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 bg-gradient-to-br ${current.accent}`} />

              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#f8fafc] flex items-center justify-center text-[#0A1F3D] shadow-inner">
                      {current.icon && <current.icon className="w-7 h-7" />}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-[#22c55e] mb-1">
                        {current.name}
                      </p>
                      <h3 className="text-3xl font-black text-[#0A1F3D] tracking-tight leading-none">
                        {current.tagline}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="mt-12 space-y-5">
                  <AnimatePresence mode="popLayout">
                    {current.bullets.map((bullet, idx) => (
                      <motion.div
                        key={bullet}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-4 group/item"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#22c55e]/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-[#22c55e]/20 transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                        </div>
                        <span className="text-[#0A1F3D]/70 font-medium">{bullet}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Dynamic Image Display */}
                <div className="mt-10 relative w-full aspect-video rounded-2xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.key}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full h-full relative scale-[1.05]"
                      >
                        <Image
                          src={
                            {
                              bike: "/bike-img.png",
                              car: "/car-img-1.jpg",
                              ambulance: "/ambulance-img-2.jpg",
                              pay: "/wallet-1.jpg",
                            }[current.key] || "/bike-img.png"
                          }
                          alt={current.name}
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-auto pt-12 flex flex-wrap gap-4">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href="/onway-book"
                      className="flex items-center gap-3 bg-[#0A1F3D] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-[#0A1F3D]/10 hover:shadow-[#0A1F3D]/20 transition-all group/btn"
                    >
                      {current.cta.label}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                  {/* <motion.button
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-3 bg-transparent border border-gray-200 text-[#0A1F3D] px-8 py-4 rounded-2xl font-bold transition-all"
                  >
                    <Download className="w-4 h-4 opacity-50" />
                    Get App
                  </motion.button> */}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Why Choose Card (Fixed Content) */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 25 },
              visible: { opacity: 1, y: 0 }
            }}
            className="lg:col-span-5"
          >
            <div className="h-full rounded-[2.5rem] border border-gray-100 bg-white/60 backdrop-blur-xl p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col">
              <span className="text-[#22c55e] text-xs font-black uppercase tracking-widest mb-4 block">
                Trust & Quality
              </span>
              <h3 className="text-3xl font-black text-[#0A1F3D] tracking-tight leading-[1.1]">
                Consistent quality <br />
                across every service.
              </h3>

              <div className="mt-10 space-y-3">
                {[
                  "Upfront, transparent pricing",
                  "Support that actually helps",
                  "In-app tracking and receipts",
                  "Rewards and wallet benefits",
                ].map((item, idx) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100/50 shadow-sm hover:border-[#22c55e]/20 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#22c55e]/5 flex items-center justify-center text-[#22c55e]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-[#0A1F3D]/80">{item}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto pt-10">
                <p className="text-sm text-[#0A1F3D]/40 leading-relaxed italic">
                  Join over 500,000 users who rely on OnWay for their daily movement.
                </p>
              </div>
            </div>
          </motion.div>
        </StaggerContainer>

      </Container>
    </section>
  );
}
