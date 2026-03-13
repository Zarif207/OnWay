"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedHeading } from "../MotionWrappers";
import AnimatedButton from "../AnimatedButton";

export default function ContactRideSection() {
  const [activeTab, setActiveTab] = useState("contact");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("OnWay Form:", data);
  };

  return (
    <section className="relative">
      {/* ================= HERO SECTION ================= */}
      <div
        className="relative bg-fixed bg-cover bg-center py-28 text-white overflow-hidden"
        style={{ backgroundImage: "url('/home-3.webp')" }}
      >
        {/* Navy Overlay & Gradient */}
        <div className="absolute inset-0 bg-[#0A1F3D]/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-transparent to-transparent opacity-20"></div>

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <AnimatedHeading>
            <p className="mb-4 text-sm font-black tracking-[0.3em] text-[#22c55e] uppercase">
              Ride Tracking
            </p>

            <h1 className="text-3xl font-black sm:text-5xl tracking-tighter leading-[1.1]">
              Track Your Ride <br className="sm:hidden" /> in Real-Time
            </h1>

            <p className="mt-6 text-base font-medium text-white/70 max-w-xl mx-auto">
              Enter your ride ID to see your driver’s live location and estimated
              arrival time. Instant updates, zero stress.
            </p>
          </AnimatedHeading>

          {/* Track Input - Refined to be more compact (py-3) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="mx-auto mt-10 flex max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/20 group focus-within:ring-2 focus-within:ring-[#22c55e] transition-all"
          >
            <input
              type="text"
              placeholder="Enter your Ride ID"
              className="w-full px-6 py-3 text-sm text-[#0A1F3D] outline-none placeholder:text-gray-400 font-semibold"
            />
            <AnimatedButton>
              Track Ride
            </AnimatedButton>
          </motion.div>
        </div>
      </div>

      {/* ================= CARD SECTION ================= */}
      <div className="relative -mt-20 px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-2xl"
        >
          {/* Tabs */}
          <div className="mb-6 flex gap-4">
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
                className="space-y-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      placeholder="Enter your full name"
                      className="w-full rounded-lg bg-zinc-100 px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                      {...register("name", { required: true })}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-rose-600">
                        Name is required
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <input
                      placeholder="Enter your email address"
                      className="w-full rounded-lg bg-zinc-100 px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                      {...register("email", { required: true })}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-rose-600">
                        Email is required
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Subject *
                  </label>
                  <input
                    placeholder="What is this regarding?"
                    className="w-full rounded-lg bg-zinc-100 px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                    {...register("subject")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Message *
                  </label>
                  <textarea
                    placeholder="Write your message here..."
                    className="w-full h-28 resize-none rounded-lg bg-zinc-100 p-4 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                    {...register("message", { required: true })}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-rose-600">
                      Message cannot be empty
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
                  <AnimatedButton type="submit">
                    Send Message →
                  </AnimatedButton>

                  <p className="text-xs text-zinc-500">
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
                className="space-y-6 text-center py-4"
              >
                <p className="text-sm text-zinc-600">
                  Enter your Ride ID below to track your driver live.
                </p>

                <div className="mx-auto flex max-w-xl overflow-hidden rounded-lg bg-zinc-100 shadow-sm focus-within:ring-2 focus-within:ring-[#22c55e]/40 transition-all">
                  <input
                    type="text"
                    placeholder="Enter Ride ID"
                    className="w-full bg-transparent px-4 h-11 text-sm outline-none font-semibold text-[#0A1F3D]"
                  />
                  <AnimatedButton>
                    Track Now
                  </AnimatedButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}