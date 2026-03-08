"use client";

import React, { useRef } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import { Plane, ChevronRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

import step1Img from "../../../../public/passenger.jpg";
import step2Img from "../../../../public/car.jpg";
import step3Img from "../../../../public/location-mark.jpg";

const steps = [
  {
    id: "01",
    title: "Request Your Ride",
    description: "Seamlessly book your vehicle using our intuitive mobile app. One tap is all it takes.",
    image: step1Img,
  },
  {
    id: "02",
    title: "Matched with a Vehicle",
    description: "Instant dispatch: We connect you with a premium, nearby driver within seconds.",
    image: step2Img,
  },
  {
    id: "03",
    title: "Enjoy Your Journey",
    description: "Sit back, relax, and track your trip in real-time until you reach your destination.",
    image: step3Img,
  },
];

/**
 * HowItWorks Component (Working Process V5)
 * Ultra-premium SaaS/Fintech styling with animated drawing timeline and glassmorphism.
 */
export default function HowItWorks() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Vertical timeline progress for mobile
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <section ref={sectionRef} className="bg-[#F8FAFC] py-24 sm:py-32 relative overflow-hidden">
      {/* Background Pattern - Subtle SaaS Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(#22c55e 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.05)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#22c55e]/5 text-[#22c55e] text-xs font-black uppercase tracking-[0.2em] mb-6 border border-[#22c55e]/10 shadow-sm"
          >
            <Plane size={14} />
            Working Process
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-[#0A1F3D] leading-tight tracking-tighter"
          >
            Your journey <span className="text-[#22c55e]">redefined</span> <br className="hidden md:block" />
            for modern life.
          </motion.h2>
        </div>

        {/* Timeline Container */}
        <div className="relative">

          {/* DESKTOP TIMELINE (Horizontal) */}
          <div className="hidden lg:block absolute top-[140px] left-[15%] right-[15%] h-[2px] z-0">
            <div className="absolute inset-0 bg-gray-100" />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.5, ease: "circOut", delay: 0.8 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent origin-left"
            />
          </div>

          {/* MOBILE TIMELINE (Vertical Line) */}
          <div className="lg:hidden absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gray-100/50 z-0">
            <motion.div
              style={{ scaleY }}
              className="w-full h-full bg-[#22c55e] origin-top"
            />
          </div>

          {/* Cards Grid */}
          <div className="grid lg:grid-cols-3 gap-20 lg:gap-12 relative z-10">
            {steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} isInView={isInView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index, isInView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.4 + index * 0.2, ease: "easeOut" }}
      className="flex flex-col items-center group relative"
    >
      {/* Image Container with Floating & Hover Animations */}
      <div className="relative mb-12">
        {/* Step Number Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 200, delay: 0.8 + index * 0.2 }}
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-12 h-12 rounded-full bg-[#0A1F3D] border-4 border-white shadow-xl flex items-center justify-center"
        >
          <span className="text-[#22c55e] font-black text-sm">{step.id}</span>
        </motion.div>

        {/* Image Circle */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
          whileHover={{ scale: 1.03 }}
          className="relative w-64 h-64 md:w-72 md:h-72 rounded-full p-4 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.05)] border border-white hover:shadow-[#22c55e]/10 transition-all duration-500 overflow-hidden"
        >
          {/* Glassmorphism Inner Ring */}
          <div className="absolute inset-0 rounded-full border-[10px] border-[#22c55e]/5 z-10" />

          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src={step.image}
              alt={step.title}
              fill
              className="object-cover transform group-hover:scale-110 transition-transform duration-[3s] ease-out grayscale-[0.2] group-hover:grayscale-0"
            />
            {/* Soft Green Tint Overlay */}
            <div className="absolute inset-0 bg-[#22c55e]/5 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-700" />
          </div>
        </motion.div>

        {/* Soft Glow Under Card */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/5 blur-2xl rounded-full opacity-50 transition-opacity group-hover:bg-[#22c55e]/10" />
      </div>

      {/* Content */}
      <div className="text-center px-4">
        <h4 className="text-xl font-black text-[#0A1F3D] mb-4 uppercase tracking-tighter flex items-center justify-center gap-2">
          {step.title}
          {index === 2 && <CheckCircle2 size={18} className="text-[#22c55e]" />}
        </h4>
        <p className="text-[#0A1F3D]/60 text-base font-medium leading-relaxed max-w-[280px] mx-auto">
          {step.description}
        </p>
      </div>

      {/* Decorative Arrow for Desktop */}
      {index !== 2 && (
        <div className="hidden lg:block absolute -right-6 top-[138px] -translate-y-1/2 text-gray-200 group-hover:text-[#22c55e]/30 transition-colors duration-500 z-10">
          <ChevronRight size={32} strokeWidth={1.5} />
        </div>
      )}
    </motion.div>
  );
}
