"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { transportationServices } from "./homeData";

const Transportation = () => {
  const leftServices = transportationServices.filter((s) => s.side === "left");
  const rightServices = transportationServices.filter(
    (s) => s.side === "right",
  );

  return (
    <section className="relative py-24 px-4 bg-[#fcfcfc] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern
            id="dotPattern"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="#22c55e" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[#22c55e] text-sm font-bold uppercase tracking-[0.3em]"
          >
            Why Choose Us
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl md:text-5xl font-black text-[#0A1F3D] leading-tight"
          >
            Transportation Services We Are <br className="hidden md:block" />
            Often Considered
          </motion.h2>
        </div>

        {/* Main Content Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-center relative">
          {/* Left Cards */}
          <div className="lg:col-span-3 space-y-12 z-20 order-2 lg:order-1">
            {leftServices.map((service, index) => (
              <ServiceCard
                key={index}
                service={service}
                side="left"
                index={index}
              />
            ))}
          </div>

          {/* Center Image Component */}
          <div className="lg:col-span-6 relative flex justify-center order-1 lg:order-2">
            {/* SVG Lines - Hidden on Mobile */}
            <div className="absolute inset-0 pointer-events-none hidden lg:block">
              <ConnectionLines side="left" />
              <ConnectionLines side="right" />
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full aspect-square md:aspect-video lg:aspect-square max-w-[500px]"
            >
              <Image
                src="/transportation.png"
                alt="Transportation Network"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </div>

          {/* Right Cards */}
          <div className="lg:col-span-3 space-y-12 z-20 order-3">
            {rightServices.map((service, index) => (
              <ServiceCard
                key={index}
                service={service}
                side="right"
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({ service, side, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      viewport={{ once: true }}
      className={`group flex items-center gap-4 bg-white p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-100/50 hover:shadow-[0_15px_40px_rgba(34,197,94,0.1)] transition-all duration-300 ${
        side === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <div className="flex-shrink-0 p-3 rounded-lg bg-[#22c55e] text-white shadow-[0_5px_15px_rgba(34,197,94,0.3)] group-hover:scale-110 transition-transform duration-300">
        <service.icon size={24} />
      </div>
      <div>
        <h4 className="font-bold text-[#0A1F3D] text-lg leading-tight uppercase tracking-wide">
          {service.title.split(" ")[0]} <br />{" "}
          {service.title.split(" ").slice(1).join(" ")}
        </h4>
      </div>
    </motion.div>
  );
};

const ConnectionLines = ({ side }) => {
  const isLeft = side === "left";

  return (
    <svg
      className="absolute inset-0 w-full h-full overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <radialGradient id="dotGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="onway-lines">
        {/* Top Path */}
        <AnimatedLine path={isLeft ? "M -50 15 L 47 33" : "M 150 15 L 53 33"} />

        {/* Mid Path */}
        <AnimatedLine path={isLeft ? "M -50 51 L 35 56" : "M 150 51 L 65 56"} />

        {/* Bottom Path */}
        <AnimatedLine path={isLeft ? "M -50 87 L 45 78" : "M 150 87 L 55 78"} />

        {/* Target Dots */}
        <PulseDot cx={isLeft ? 47 : 53} cy={33} />
        <PulseDot cx={isLeft ? 35 : 65} cy={56} />
        <PulseDot cx={isLeft ? 45 : 55} cy={78} />
      </g>
    </svg>
  );
};

const AnimatedLine = ({ path }) => (
  <motion.path
    d={path}
    fill="none"
    stroke="#22c55e"
    strokeWidth="1.5"
    initial={{ pathLength: 0, opacity: 0 }}
    whileInView={{ pathLength: 1, opacity: 0.4 }}
    transition={{ duration: 1.5, ease: "easeInOut" }}
  />
);

const PulseDot = ({ cx, cy }) => {
  return (
    <>
      {/* Solid Center Dot */}
      <circle cx={cx} cy={cy} r={2.5} fill="#22c55e" />

      {/* Pulse Effect */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={2.5}
        fill="url(#dotGradient)"
        initial={{ r: 2.5, opacity: 0.6 }}
        animate={{ r: 6, opacity: 0 }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    </>
  );
};

export default Transportation;
