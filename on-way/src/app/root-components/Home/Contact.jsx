"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

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
      <div className="relative bg-[#0f172a] py-28 text-white">
        {/* Overlay (remove later when adding bg image) */}
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <p className="mb-4 text-sm font-semibold tracking-widest text-secondary uppercase">
            Ride Tracking
          </p>

          <h1 className="text-3xl font-bold sm:text-5xl">
            Track Your Ride in Real-Time
          </h1>

          <p className="mt-4 text-sm text-zinc-300">
            Enter your ride ID to see your driver’s live location and estimated
            arrival time.
          </p>

          {/* Track Input */}
          <div className="mx-auto mt-8 flex max-w-2xl overflow-hidden rounded-full bg-white">
            <input
              type="text"
              placeholder="Enter your Ride ID"
              className="w-full px-6 py-4 text-sm text-black outline-none"
            />
            <button className="bg-primary px-8 py-4 text-sm font-semibold text-white transition hover:bg-secondary">
              Track Ride →
            </button>
          </div>
        </div>
      </div>

      {/* ================= CARD SECTION ================= */}
      <div className="relative -mt-20 px-6 pb-20">
        <div className="mx-auto max-w-6xl rounded-[40px] bg-white p-8 shadow-2xl sm:p-12">
          {/* Tabs */}
          <div className="mb-10 flex gap-4">
            <button
              onClick={() => setActiveTab("contact")}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                activeTab === "contact"
                  ? "bg-primary text-white"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              Contact
            </button>

            <button
              onClick={() => setActiveTab("track")}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                activeTab === "track"
                  ? "bg-primary text-white"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              Track a Ride
            </button>
          </div>

          {/* ================= CONTACT FORM ================= */}
          {activeTab === "contact" && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <input
                    placeholder="Full Name*"
                    className="w-full rounded-full bg-zinc-100 px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                    {...register("name", { required: true })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-rose-600">
                      Name is required
                    </p>
                  )}
                </div>

                <div>
                  <input
                    placeholder="Email*"
                    className="w-full rounded-full bg-zinc-100 px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                    {...register("email", { required: true })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-600">
                      Email is required
                    </p>
                  )}
                </div>
              </div>

              <input
                placeholder="Subject"
                className="w-full rounded-full bg-zinc-100 px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                {...register("subject")}
              />

              <textarea
                placeholder="Write your message..."
                rows={4}
                className="w-full rounded-3xl bg-zinc-100 px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                {...register("message", { required: true })}
              />
              {errors.message && (
                <p className="text-xs text-rose-600">
                  Message cannot be empty
                </p>
              )}

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  className="rounded-full bg-primary px-8 py-4 text-sm font-semibold text-white transition hover:bg-secondary"
                >
                  Send Message →
                </button>

                <p className="text-xs text-zinc-500">
                  Our support team typically replies within 24 hours.
                </p>
              </div>
            </form>
          )}

          {/* ================= TRACK TAB ================= */}
          {activeTab === "track" && (
            <div className="space-y-6 text-center">
              <p className="text-sm text-zinc-600">
                Enter your Ride ID below to track your driver live.
              </p>

              <div className="mx-auto flex max-w-xl overflow-hidden rounded-full bg-zinc-100">
                <input
                  type="text"
                  placeholder="Enter Ride ID"
                  className="w-full bg-transparent px-6 py-4 text-sm outline-none"
                />
                <button className="bg-primary px-8 py-4 text-sm font-semibold text-white transition hover:bg-secondary">
                  Track Now →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}