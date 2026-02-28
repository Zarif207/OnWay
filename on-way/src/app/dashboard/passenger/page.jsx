"use client";

import { Car, MapPin, Wallet, Shield, Clock, Headphones } from "lucide-react";
import Link from "next/link";

export default function PassengerLanding() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#F4F6F9] via-[#EEF1F6] to-[#E9EDF3] px-6 py-14">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* ================= HERO SECTION ================= */}
        <div className="relative bg-white/60 backdrop-blur-xl rounded-[40px] p-14 border border-white/40
                        shadow-[0_25px_60px_rgba(0,0,0,0.08)] overflow-hidden">

          <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#FFF200]/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-semibold text-[#111827] leading-tight">
              Welcome Back 👋
            </h1>

            <p className="text-gray-600 mt-6 text-lg leading-relaxed">
              Manage your rides, track journeys in real-time, handle payments,
              and enjoy a seamless passenger experience — all in one place.
            </p>

            <Link
              href="/dashboard/passenger/book-ride"
              className="inline-block mt-8 px-8 py-4 bg-[#111827] text-white rounded-2xl
                         shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              Book a Ride
            </Link>
          </div>
        </div>

        {/* ================= FEATURES GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">

          <FeatureCard
            icon={<Car />}
            title="Book Rides Instantly"
            desc="Request rides anytime with quick pickup and transparent pricing."
            href="/dashboard/passenger/book-ride"
          />

          <FeatureCard
            icon={<MapPin />}
            title="Live Ride Tracking"
            desc="Track your driver and route in real-time for peace of mind."
            href="/dashboard/passenger/active-ride"
          />

          <FeatureCard
            icon={<Wallet />}
            title="Smart Wallet"
            desc="Add funds, review payments, and manage transactions easily."
            href="/dashboard/passenger/wallet"
          />

          <FeatureCard
            icon={<Clock />}
            title="Ride History"
            desc="Access detailed records of all your previous trips."
            href="/dashboard/passenger/ride-history"
          />

          <FeatureCard
            icon={<Shield />}
            title="Safety First"
            desc="Emergency contact, trip sharing, and ride verification tools."
            href="#"
          />

          <FeatureCard
            icon={<Headphones />}
            title="24/7 Support"
            desc="Reach out anytime for assistance or issue resolution."
            href="#"
          />

        </div>

      </div>
    </div>
  );
}

/* ================= 3D SOFT CARD ================= */

function FeatureCard({ icon, title, desc, href }) {
  return (
    <Link
      href={href}
      className="group relative bg-white/70 backdrop-blur-xl rounded-[32px] p-10
                 border border-white/40
                 shadow-[0_20px_50px_rgba(0,0,0,0.06)]
                 hover:shadow-[0_30px_70px_rgba(0,0,0,0.12)]
                 hover:-translate-y-2
                 transition-all duration-300"
    >
      <div className="w-14 h-14 bg-[#FFF200] rounded-2xl flex items-center justify-center
                      text-[#111827] shadow-md mb-8">
        {icon}
      </div>

      <h3 className="text-xl font-semibold text-[#111827]">
        {title}
      </h3>

      <p className="text-gray-600 mt-4 leading-relaxed">
        {desc}
      </p>
    </Link>
  );
}