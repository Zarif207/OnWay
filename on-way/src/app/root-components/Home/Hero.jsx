"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Navigation2 } from "lucide-react";
import Image from "next/image";
import Container from "./Container";
import heroImg from "../../../../public/hero.png";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen bg-white overflow-hidden flex items-center pt-24 pb-16"
    >
      {/* Soft Green Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(47,202,113,0.08),transparent_40%)] pointer-events-none" />

      <Container className="relative z-20 w-full">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.1fr] xl:grid-cols-[1fr_1.2fr] lg:gap-16">
          {/* LEFT SIDE */}
          <div className="relative z-30 flex flex-col justify-start w-full max-w-lg xl:max-w-xl mx-auto lg:mx-0">
            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-6"
            >
              <MapPin className="h-4 w-4 text-[#2FCA71]" />
              <p className="text-sm font-semibold text-[#303841] tracking-wide">
                Bogra, BD{" "}
                <span className="ml-2 text-[#303841]/50 underline cursor-pointer hover:text-[#303841] transition-colors">
                  Change city
                </span>
              </p>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-extrabold tracking-tight text-[#303841] md:text-6xl xl:text-7xl leading-[1.1] mb-8"
            >
              Go anywhere with <br />
              <span className="text-primary">OnWay.</span>
            </motion.h1>

            <p className="text-[#303841]/70 mb-10 text-lg">
              Safe, fast and reliable rides across your city.
            </p>

            {/* Booking Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full bg-white border border-[#eaeaea] rounded-3xl p-6 shadow-xl"
            >
              {/* Pickup Now Button */}
              <div className="flex gap-4 mb-6">
                <button className="flex items-center gap-2 rounded-full bg-[#303841] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2FCA71] transition-colors">
                  <Clock className="h-4 w-4" /> Pickup now
                </button>
              </div>

              {/* Inputs */}
              <div className="relative flex flex-col gap-3">
                <div className="absolute left-[24px] top-[26px] bottom-[26px] w-[2px] bg-gray-200" />

                {/* Pickup */}
                <div className="flex items-center gap-4 rounded-xl px-4 py-3.5 bg-[#f9f9f9] border border-gray-200 focus-within:border-[#2FCA71]/60 transition-colors group">
                  <span className="w-2 h-2 rounded-full bg-gray-400 group-focus-within:bg-[#2FCA71]" />
                  <input
                    type="text"
                    placeholder="Pickup location"
                    className="w-full bg-transparent text-[15px] font-medium text-[#303841] placeholder-gray-400 outline-none"
                  />
                  <Navigation2 className="h-4 w-4 text-gray-400 group-focus-within:text-[#2FCA71]" />
                </div>

                {/* Dropoff */}
                <div className="flex items-center gap-4 rounded-xl px-4 py-3.5 bg-[#f9f9f9] border border-gray-200 focus-within:border-[#2FCA71]/60 transition-colors group">
                  <span className="w-2 h-2 bg-gray-400 group-focus-within:bg-[#2FCA71]" />
                  <input
                    type="text"
                    placeholder="Dropoff location"
                    className="w-full bg-transparent text-[15px] font-medium text-[#303841] placeholder-gray-400 outline-none"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5">
                <button className="group relative flex-1 overflow-hidden rounded-full bg-[#303841] px-10 py-3 text-sm font-bold tracking-widest text-white transition-all duration-300">
                  {/* Expanding Circle */}
                  <span className="absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2FCA71] transition-all duration-700 ease-out group-hover:h-56 group-hover:w-56" />

                  {/* Button Text */}
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-[#303841]">
                    See Prices
                  </span>
                </button>

                <button className="text-[13px] font-semibold text-[#303841]/60 hover:text-[#303841] transition-colors underline-offset-4 hover:underline">
                  Log in to see your recent activity
                </button>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE IMAGE */}
          <div className="relative z-30 hidden lg:flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-2xl"
            >
              <Image
                src={heroImg}
                alt="OnWay Travel Illustration"
                priority
                className="w-full h-auto object-contain"
              />
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
