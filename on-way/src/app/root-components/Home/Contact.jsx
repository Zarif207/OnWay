"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import { AnimatedHeading } from "../MotionWrappers";
import AnimatedButton from "../AnimatedButton";
import { stats } from "./homeData";

// Reusable Scroll-Triggered Animated Counter Component
const CounterItem = ({ value, label, delayIndex }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const numericValue = parseInt(value.replace(/[^0-9]/g, "")) || 0;
  const suffix = value.replace(/[0-9]/g, "");

  useEffect(() => {
    if (isInView && numericValue > 0) {
      const timeout = setTimeout(() => {
        const controls = animate(0, numericValue, {
          duration: 2,
          ease: "easeOut",
          onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
        });
        return () => controls.stop();
      }, delayIndex * 150); // Stagger effect

      return () => clearTimeout(timeout);
    }
  }, [numericValue, isInView, delayIndex]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: delayIndex * 0.15 + 0.3, ease: "easeOut" }}
      className="flex flex-col items-center justify-center space-y-1 p-2"
    >
      <span className="text-3xl md:text-4xl font-black text-white tabular-nums drop-shadow-lg">
        {numericValue > 0 ? displayValue : value}
        {suffix}
      </span>
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#A0AEC0] drop-shadow-md">
        {label}
      </span>
    </motion.div>
  );
};

export default function ContactRideSection() {
  const [activeTab, setActiveTab] = useState("contact");
  const videoRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("OnWay Form:", data);
  };

  // Performance Enhancement: Pause video when completely out of viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!videoRef.current) return;
          if (entry.isIntersecting) {
            videoRef.current.play().catch(() => { }); // Catch play promise errors
          } else {
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.05 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="relative">
      {/* ================= HERO SECTION w/ VIDEO ================= */}
      <div className="relative pt-28 pb-40 lg:pt-36 lg:pb-48 text-white overflow-hidden flex flex-col items-center justify-center">

        {/* Optimized Video Background */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
          poster="/home-3.webp"
        >
          <source src="/home-vid-3.mp4" type="video/mp4" />
        </video>

        {/* Dynamic Dark Overlays for Text Legibility */}
        <div className="absolute inset-0 bg-[#0A1F3D]/80 mix-blend-multiply z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F3D] via-[#0A1F3D]/40 to-transparent z-10" />

        <div className="relative z-20 mx-auto max-w-5xl px-6 text-center">
          <AnimatedHeading>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-4 text-sm bg-gradient-to-r from-[#2FCA71] to-[#259461] bg-clip-text text-transparent uppercase drop-shadow-md"
            >
              Ride Tracking
            </motion.p>

            <h1 className="text-4xl font-black sm:text-5xl lg:text-6xl tracking-tighter leading-[1.1] drop-shadow-xl">
              Track Your Ride <br className="sm:hidden" /> in <span className="bg-gradient-to-r from-[#2FCA71] to-[#259461] bg-clip-text text-transparent">Real-Time</span>
            </h1>

            <p className="mt-6 text-base lg:text-lg font-medium text-white/80 max-w-xl mx-auto drop-shadow-md">
              Enter your ride ID to see your driver’s live location and estimated
              arrival time. Instant updates, zero stress.
            </p>
          </AnimatedHeading>

          {/* Premium Glassmorphism Track Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: true }}
            className="mx-auto mt-10 flex max-w-lg overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl group focus-within:border-[#22c55e]/50 focus-within:bg-white/15 transition-all p-1.5 pl-4"
          >
            <input
              type="text"
              placeholder="Enter your Ride ID"
              className="w-full px-4 py-3 text-sm text-white outline-none placeholder:text-white/60 font-semibold bg-transparent"
            />
            <div className="shrink-0 flex items-center">
              <AnimatedButton>
                Track Ride
              </AnimatedButton>
            </div>
          </motion.div>

          {/* Scroll-Triggered Animated Stats Overlay */}
          <div className="mt-16 lg:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 max-w-4xl mx-auto border-t border-white/10 pt-10">
            {stats.map((stat, idx) => (
              <CounterItem key={idx} value={stat.value} label={stat.label} delayIndex={idx} />
            ))}
          </div>
        </div>
      </div>

      {/* ================= CARD SECTION ================= */}
      <div className="relative -mt-24 px-6 pb-20 z-30">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl rounded-3xl bg-white p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100/50"
        >
          {/* Tabs */}
          <div className="mb-8 flex gap-4">
            <AnimatedButton onClick={() => setActiveTab("contact")}>
              Contact
            </AnimatedButton>

            <AnimatedButton onClick={() => setActiveTab("track")}>
              Track a Ride
            </AnimatedButton>
          </div>

          <AnimatePresence mode="wait">
            {/* ================= CONTACT FORM ================= */}
            {activeTab === "contact" && (
              <motion.form
                key="contact-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#0A1F3D]">
                      Full Name *
                    </label>
                    <input
                      placeholder="Enter your full name"
                      className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 h-12 text-sm outline-none focus:ring-2 focus:ring-[#22c55e]/30 focus:border-[#22c55e] transition-all"
                      {...register("name", { required: true })}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-rose-500 font-medium">
                        Name is required
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#0A1F3D]">
                      Email *
                    </label>
                    <input
                      placeholder="Enter your email address"
                      className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 h-12 text-sm outline-none focus:ring-2 focus:ring-[#22c55e]/30 focus:border-[#22c55e] transition-all"
                      {...register("email", { required: true })}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-rose-500 font-medium">
                        Email is required
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0A1F3D]">
                    Subject *
                  </label>
                  <input
                    placeholder="What is this regarding?"
                    className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 h-12 text-sm outline-none focus:ring-2 focus:ring-[#22c55e]/30 focus:border-[#22c55e] transition-all"
                    {...register("subject")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0A1F3D]">
                    Message *
                  </label>
                  <textarea
                    placeholder="Write your message here..."
                    className="w-full h-32 resize-none rounded-xl bg-zinc-50 border border-zinc-200 p-4 text-sm outline-none focus:ring-2 focus:ring-[#22c55e]/30 focus:border-[#22c55e] transition-all"
                    {...register("message", { required: true })}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-rose-500 font-medium">
                      Message cannot be empty
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
                  <AnimatedButton type="submit">
                    Send Message →
                  </AnimatedButton>

                  <p className="text-xs text-zinc-500 font-medium">
                    Our support team typically replies within 24 hours.
                  </p>
                </div>
              </motion.form>
            )}

            {/* ================= TRACK TAB ================= */}
            {activeTab === "track" && (
              <motion.div
                key="track-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 text-center py-6"
              >
                <p className="text-sm text-zinc-600 font-medium">
                  Enter your Ride ID below to track your driver live.
                </p>

                <div className="mx-auto flex max-w-xl overflow-hidden rounded-2xl bg-zinc-50 border border-zinc-200 shadow-sm focus-within:ring-2 focus-within:ring-[#22c55e]/30 focus-within:border-[#22c55e] transition-all p-1.5 pl-4">
                  <input
                    type="text"
                    placeholder="Enter Ride ID"
                    className="w-full bg-transparent px-4 py-3 text-sm outline-none font-semibold text-[#0A1F3D]"
                  />
                  <div className="shrink-0 flex items-center">
                    <AnimatedButton>
                      Track Now
                    </AnimatedButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}