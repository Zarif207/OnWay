"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Clock, MapPin, Navigation2 } from "lucide-react";
import Image from "next/image";
import Container from "./Container";
import AnimatedButton from "../AnimatedButton";
import heroImg from "../../../../public/hero-img.jpg";

export default function Hero() {
  // 3D Tilt Effect Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Entrance Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      id="home"
      className="relative min-h-[60vh] flex items-center py-16 bg-white overflow-hidden pt-44"
    >
      <Container className="relative z-20 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* LEFT SIDE */}
          <div className="relative z-30 flex flex-col justify-start w-full max-w-lg xl:max-w-xl mx-auto lg:mx-0">
            {/* Location */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 mb-4"
            >
              <MapPin className="h-4 w-4 text-[#2FCA71]" />
              <p className="text-sm font-semibold text-[#0A1F3D] tracking-wide">
                Bogra, BD{" "}
                <span className="ml-2 text-[#0A1F3D]/50 underline cursor-pointer hover:text-[#2FCA71] transition-colors">
                  Change city
                </span>
              </p>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl font-extrabold tracking-tight text-[#0A1F3D] md:text-6xl xl:text-6xl leading-[1.1] mb-5"
            >
              Go anywhere with <br />
              <span className="bg-gradient-to-r from-[#2FCA71] to-[#259461] bg-clip-text text-transparent">
                OnWay.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-[#0A1F3D]/70 mb-6 text-base max-w-md"
            >
              Safe, fast and reliable rides across your city. Experience premium
              transport at your fingertips.
            </motion.p>

            {/* Booking Form Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="w-full bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2rem] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)] transition-shadow duration-500"
            >
              {/* Pickup Now Button */}
              <div className="flex gap-3 mb-6">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <AnimatedButton>
                    <Clock className="h-4 w-4" /> PICKUP NOW
                  </AnimatedButton>
                </motion.div>
              </div>

              {/* Inputs */}
              <div className="relative flex flex-col gap-3">
                <div className="absolute left-[28px] top-[26px] bottom-[26px] w-[2px] bg-gradient-to-b from-[#2FCA71] to-gray-200" />

                {/* Pickup */}
                <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-white/50 border border-gray-100 focus-within:border-[#2FCA71]/60 focus-within:ring-2 focus-within:ring-[#2FCA71]/5 transition-all group">
                  <div className="w-3 h-3 rounded-full border-2 border-[#2FCA71] bg-white group-focus-within:bg-[#2FCA71]" />
                  <input
                    type="text"
                    placeholder="Pickup location"
                    className="w-full bg-transparent text-[14px] font-semibold text-[#0A1F3D] placeholder-gray-400 outline-none"
                  />
                  <Navigation2 className="h-4 w-4 text-gray-400 group-focus-within:text-[#2FCA71]" />
                </div>

                {/* Dropoff */}
                <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-white/50 border border-gray-100 focus-within:border-[#2FCA71]/60 focus-within:ring-2 focus-within:ring-[#2FCA71]/5 transition-all group">
                  <div className="w-3 h-3 rounded-sm bg-gray-300 group-focus-within:bg-[#0A1F3D]" />
                  <input
                    type="text"
                    placeholder="Dropoff location"
                    className="w-full bg-transparent text-[14px] font-semibold text-[#0A1F3D] placeholder-gray-400 outline-none"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <AnimatedButton className="w-full">SEE PRICES</AnimatedButton>
                </motion.div>

                <AnimatedButton>Recent Activity →</AnimatedButton>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE VIDEO */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center lg:justify-end"
          >
            <div className="max-w-[560px] w-full rounded-2xl overflow-hidden shadow-lg aspect-video lg:aspect-square xl:aspect-[4/3] bg-black">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/porsche-vid.mp4" type="video/mp4" />
              </video>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
