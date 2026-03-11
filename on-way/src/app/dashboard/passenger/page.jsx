"use client";

import React, { useRef, useState } from "react";
import { Car, MapPin, Wallet, Shield, Clock, Headphones, ArrowRight, Sparkles, Activity } from "lucide-react";
import Link from "next/link";
import { useRequireRole } from "@/hooks/useAuth";

export default function PassengerLanding() {
  // ✅ Protect this page - only passengers can access
  const { user, isLoading } = useRequireRole("passenger");

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-[#2FCA71]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#2FCA71] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-500 font-medium tracking-tight animate-pulse underline decoration-[#2FCA71] underline-offset-4 decoration-2">
            Preparing your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 py-8 lg:px-8 xl:px-12 bg-[#fafafa] overflow-hidden">

      {/* ================= BACKGROUND ELEMENTS ================= */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#2FCA71]/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="pointer-events-none absolute top-1/4 -right-20 w-[400px] h-[400px] bg-sky-100 rounded-full blur-[100px] animate-float-slow opacity-60"></div>
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-green-50/50 blur-[80px] rounded-full"></div>

      {/* Floating Shapes */}
      <div className="absolute top-20 right-[15%] w-12 h-12 bg-white rounded-2xl shadow-xl shadow-[#2FCA71]/10 rotate-12 animate-float opacity-40 lg:block hidden"></div>
      <div className="absolute bottom-[20%] left-[10%] w-16 h-16 bg-[#2FCA71]/20 rounded-full blur-xl animate-float-reverse lg:block hidden"></div>


      {/* ================= HERO SECTION ================= */}
      <div className="relative mb-20">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 bg-white/40 backdrop-blur-3xl border border-white p-8 lg:p-16 rounded-[48px] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">

          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2FCA71]/10 border border-[#2FCA71]/20 text-[#259461] text-sm font-semibold select-none animate-bounce-slow">
              <Sparkles size={14} className="animate-pulse" />
              <span>Premium Experience</span>
            </div>

            <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              <span className="block text-gray-400 font-medium text-lg lg:text-xl uppercase tracking-widest mb-4">Dashboard Overview</span>
              Hello, <span className="text-[#2FCA71]">{user?.name?.split(' ')[0] || "User"}</span>
            </h1>

            <p className="text-lg lg:text-xl text-gray-500 max-w-xl leading-relaxed lg:mx-0 mx-auto">
              Your gateway to seamless travel. Monitor active rides, manage transactions, and book your next journey with <span className="font-bold text-gray-700">OnWay</span>.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/dashboard/passenger/book-ride"
                className="group relative px-8 py-4 bg-[#2FCA71] hover:bg-[#259461] text-white rounded-2xl font-bold transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(37,148,97,0.3)] hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(37,148,97,0.5)] overflow-hidden"
              >
                <div className="absolute inset-0 transition-transform duration-500 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <span className="relative flex items-center gap-2">
                  Book a New Ride <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>

              <Link
                href="/dashboard/passenger/wallet"
                className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-2xl font-bold transition-all duration-300 hover:shadow-md active:scale-[0.98]"
              >
                View Balance
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-center relative">
            <div className="relative w-80 h-80">
              {/* Abstract Visual Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2FCA71] to-teal-100 rounded-full opacity-10 animate-pulse blur-3xl scale-150"></div>
              <div className="absolute inset-0 bg-white rounded-[60px] shadow-2xl overflow-hidden border border-gray-100 flex items-center justify-center group-hover:rotate-3 transition-transform duration-700">
                <Car size={160} className="text-[#2FCA71]/20 -rotate-12 group-hover:rotate-0 transition-all duration-1000 transform scale-125" />
                <div className="absolute bottom-10 left-10 right-10 p-6 bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-xl translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-[#2FCA71] rounded-full animate-ping"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Services</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">4 Drivers nearby</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ACTION CARDS ================= */}
      <div className="relative">
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Essential Services</h2>
          <Link href="#" className="text-[#2FCA71] hover:text-[#259461] font-bold text-sm flex items-center gap-1 group">
            See All <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Car />}
            title="Book a Ride"
            desc="Request a car instantly or schedule for later with your preferred driver."
            href="/dashboard/passenger/book-ride"
            color="#2FCA71"
          />
          <FeatureCard
            icon={<MapPin />}
            title="Live Tracking"
            desc="Keep an eye on your journey with real-time GPS tracking and ETAs."
            href="/dashboard/passenger/active-ride"
            color="#3b82f6"
          />
          <FeatureCard
            icon={<Wallet />}
            title="Manage Wallet"
            desc="Add funds, view transaction history, and pay for your rides effortlessly."
            href="/dashboard/passenger/wallet"
            color="#8b5cf6"
          />
          <FeatureCard
            icon={<Clock />}
            title="Trip History"
            desc="Detailed history of all your previous journeys and payments recorded."
            href="/dashboard/passenger/ride-history"
            color="#f59e0b"
          />
          <FeatureCard
            icon={<Shield />}
            title="Safety Protocols"
            desc="Configure emergency contacts and ride safety features for peace of mind."
            href="#"
            color="#ef4444"
          />
          <FeatureCard
            icon={<Headphones />}
            title="24/7 Concierge"
            desc="Premium support whenever you need assistance with your journeys."
            href="#"
            color="#0ea5e9"
          />
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT: STAT ITEM ================= */
function StatItem({ label, value, sub, icon }) {
  return (
    <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-sm ring-1 ring-black/[0.02]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#2FCA71]/10 flex items-center justify-center text-[#2FCA71]">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
        <span className="text-green-500 font-bold">+12%</span> {sub}
      </div>
    </div>
  );
}

/* ================= COMPONENT: PREMIUM FEATURE CARD ================= */
function FeatureCard({ icon, title, desc, href, color }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
    cardRef.current.style.setProperty("--x", `${x}px`);
    cardRef.current.style.setProperty("--y", `${y}px`);
  };

  return (
    <Link
      href={href}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="glossy-card spotlight-hover group flex flex-col p-10 rounded-[40px] overflow-hidden 
                 hover:shadow-[0_48px_80px_-24px_rgba(0,0,0,0.1)] hover:-translate-y-2
                 ring-1 ring-black/[0.05] bg-white/80 active:scale-[0.98]"
    >
      <div
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        <div
          className="absolute inset-0 rounded-2xl blur-lg transition-opacity opacity-0 group-hover:opacity-40"
          style={{ backgroundColor: color }}
        ></div>
        {React.cloneElement(icon, { size: 28, strokeWidth: 2, className: "relative z-10" })}
      </div>

      <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-4 flex items-center justify-between">
        {title}
        <ArrowRight size={20} className="text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-[#2FCA71]" />
      </h3>

      <p className="text-gray-500 leading-relaxed font-medium">
        {desc}
      </p>

      {/* Subtle border bottom */}
      <div className="mt-auto pt-8">
        <div className="w-12 h-1 bg-[#2FCA71]/10 rounded-full group-hover:w-full transition-all duration-700"></div>
      </div>
    </Link>
  );
}
