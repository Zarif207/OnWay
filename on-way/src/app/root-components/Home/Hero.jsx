"use client";

import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  Navigation2,
} from "lucide-react";
import Image from "next/image";
import Container from "./Container";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen bg-[#001820] overflow-hidden flex items-center pt-24 pb-16">
      <Container className="relative z-20 w-full">
        {/* Uber-Inspired Grid Layout: Content/Form left, Illustration Card right */}
        <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.1fr] xl:grid-cols-[1fr_1.2fr] lg:gap-12 xl:gap-24">

          {/* Left Column - Typography & Booking Form Widget */}
          <div data-aos="fade-right" className="relative z-30 flex flex-col justify-start w-full max-w-lg xL:max-w-xl mx-auto lg:mx-0">

            {/* Header / Location Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-6"
            >
              <MapPin className="h-4 w-4 text-[#2FCA71]" />
              <p className="text-sm font-bold text-white tracking-wide">
                Bogra, BD <span className="ml-2 font-medium text-white/50 underline cursor-pointer hover:text-white transition-colors">Change city</span>
              </p>
            </motion.div>

            {/* Massive Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="text-5xl font-extrabold tracking-tight text-white md:text-6xl xl:text-7xl leading-[1.1] mb-10"
            >
              Go anywhere with <br />
              <span className="text-[#2FCA71]">OnWay.</span>
            </motion.h1>

            {/* Integrated Booking Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full bg-[#001820]/50 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-sm"
            >
              {/* Top Controls */}
              <div className="flex gap-4 mb-6">
                <button className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#001820] hover:bg-zinc-200 transition-colors">
                  <Clock className="h-4 w-4" /> Pickup now
                </button>
              </div>

              {/* Input Group */}
              <div className="relative flex flex-col gap-3">
                {/* Vertical Connector Line */}
                <div className="absolute left-[24px] top-[26px] bottom-[26px] w-[2px] bg-white/20" />

                {/* Pickup Input */}
                <div className="flex items-center gap-4 rounded-xl px-4 py-3.5 bg-black/40 border border-white/5 focus-within:border-[#2FCA71]/50 transition-colors group">
                  <div className="relative flex items-center justify-center shrink-0 w-3 h-3 z-10 bg-black box-content border-[3px] border-transparent group-focus-within:border-black/50 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-white opacity-40 group-focus-within:opacity-100 group-focus-within:bg-[#2FCA71]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Pickup location"
                    className="w-full bg-transparent text-[15px] font-medium text-white placeholder-white/40 outline-none"
                  />
                  <Navigation2 className="h-4 w-4 text-white/40 group-focus-within:text-[#2FCA71] shrink-0 transition-colors" fill="currentColor" />
                </div>

                {/* Dropoff Input */}
                <div className="flex items-center gap-4 rounded-xl px-4 py-3.5 bg-black/40 border border-white/5 focus-within:border-[#2FCA71]/50 transition-colors group">
                  <div className="relative flex items-center justify-center shrink-0 w-3 h-3 z-10 bg-black box-content border-[3px] border-transparent group-focus-within:border-black/50 transition-colors">
                    <span className="w-2 h-2 bg-white" />
                  </div>
                  <input
                    type="text"
                    placeholder="Dropoff location"
                    className="w-full bg-transparent text-[15px] font-medium text-white placeholder-white/40 outline-none"
                  />
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5">
                <button className="flex-1 sm:flex-none flex items-center justify-center rounded-xl bg-[#2FCA71] px-8 py-3.5 text-[15px] font-bold text-[#001820] hover:bg-white transition-colors shadow-lg shadow-[#2FCA71]/20">
                  See prices
                </button>
                <button className="text-[13px] font-semibold text-white/50 hover:text-white transition-colors underline-offset-4 hover:underline">
                  Log in to see your recent activity
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Illustration Card (Matches Uber Structure) */}
          <div data-aos="fade-left" data-aos-delay="200" className="relative z-30 h-full hidden lg:flex flex-col justify-center">

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full aspect-[4/3] max-h-[600px] rounded-[32px] overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 bg-[#000E13]"
            >
              {/* Inner ambient glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#2FCA71] rounded-full blur-[100px] opacity-[0.15] mix-blend-screen pointer-events-none transition-opacity group-hover:opacity-[0.25] duration-700" />

              {/* The 3D generated car asset */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <Image
                  src="/hero_car_illustration.png"
                  alt="OnWay Premium Vehicle"
                  width={900}
                  height={700}
                  priority
                  className="w-full h-auto object-contain drop-shadow-2xl scale-105 group-hover:scale-[1.08] transition-transform duration-700 ease-out"
                />
              </div>

              {/* Uber-style embedded "Ready to travel?" banner inside the card */}
              <div className="absolute bottom-6 left-6 right-6 lg:bottom-8 lg:left-8 lg:right-8">
                <div className="flex items-center justify-between bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-5 shadow-2xl translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="pr-4">
                    <h3 className="text-white font-bold text-[15px] lg:text-base">Ready to travel?</h3>
                    <p className="text-white/60 text-xs lg:text-sm font-medium mt-0.5">Schedule a ride up to 30 days ahead.</p>
                  </div>
                  <button className="shrink-0 flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#001820] hover:bg-[#2FCA71] transition-colors">
                    Schedule ahead
                  </button>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </Container>
    </section>
  );
}
