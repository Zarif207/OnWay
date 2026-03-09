"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Box, MoveRight } from "lucide-react";
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

import { StaggerContainer, AnimatedHeading } from "../../root-components/MotionWrappers";

export default function HowItWorks() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} className="bg-white py-24 sm:py-32 relative overflow-hidden">
      {/* Background Pattern - Subtle Logistics Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(var(--color-primary) 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--color-primary)_5%,transparent)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <AnimatedHeading>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
              <Box size={14} />
              WORKING PROCESS
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-secondary leading-tight tracking-tighter">
              Your journey <span className="text-primary">redefined</span> <br className="hidden md:block" />
              for modern life.
            </h2>
          </AnimatedHeading>
        </div>

        {/* Timeline Container */}
        <div className="relative w-full max-w-5xl mx-auto">

          {/* DESKTOP TIMELINE (Horizontal dotted) */}
          <div className="hidden lg:block absolute top-[35px] left-[16.66%] right-[16.66%] border-t-[3px] border-dotted border-gray-200 z-0"></div>

          <div className="hidden lg:block absolute top-[23px] left-[33.33%] text-gray-400 -translate-x-1/2 bg-white px-3 z-0">
            <MoveRight size={24} strokeWidth={1.5} />
          </div>
          <div className="hidden lg:block absolute top-[23px] left-[66.66%] text-gray-400 -translate-x-1/2 bg-white px-3 z-0">
            <MoveRight size={24} strokeWidth={1.5} />
          </div>

          {/* Cards Grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-8 relative z-10">
            {steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center group relative text-center"
    >
      {/* Step Number on the timeline (top center) */}
      <div className="relative mb-10 w-[70px] h-[70px] bg-white rounded-full flex items-center justify-center border-[3px] border-dotted border-gray-200 group-hover:border-primary transition-colors duration-300 z-10">
        <span className="text-2xl font-bold text-secondary group-hover:text-primary transition-colors duration-300">{step.id}</span>
      </div>

      {/* Image Container with Hover interactions */}
      <div className="relative mb-8 transition-transform duration-300 ease-out group-hover:-translate-y-2">
        {/* Soft Glow Under Card */}
        <div className="absolute inset-x-8 -bottom-4 h-6 bg-black/5 blur-xl rounded-full opacity-60 transition-opacity group-hover:bg-primary/20" />

        {/* Image Circle (Clean Shadow without double borders) */}
        <div className="relative w-[280px] h-[280px] rounded-full bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 ease-in-out flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-primary/20">
          <div className="relative w-[85%] h-[85%] flex items-center justify-center">
            <Image
              src={step.image}
              alt={step.title}
              fill
              className="object-contain transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        <h4 className="text-2xl font-bold text-secondary mb-3 transition-colors duration-300 group-hover:text-primary tracking-tight">
          {step.title}
        </h4>
        <p className="text-gray-500 text-base font-medium leading-relaxed max-w-[280px] mx-auto">
          {step.description}
        </p>
      </div>

    </motion.div>
  );
}
