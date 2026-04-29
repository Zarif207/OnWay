"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import PageBanner from "../components/PageBanner";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const CarIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
    <path d="M10 36h44M16 44h6m20 0h6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <path d="M8 36l6-13h36l6 13v8a2 2 0 01-2 2H10a2 2 0 01-2-2v-8z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M18 23l3-8h22l3 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="18" cy="44" r="4" stroke="currentColor" strokeWidth="3"/>
    <circle cx="46" cy="44" r="4" stroke="currentColor" strokeWidth="3"/>
  </svg>
);

const SUVIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
    <path d="M6 38h52M12 46h7m26 0h7" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <path d="M6 38l7-15h38l7 15v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M14 23l4-10h28l4 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="16" y="15" width="32" height="8" rx="2" stroke="currentColor" strokeWidth="2.5"/>
    <circle cx="19" cy="46" r="4.5" stroke="currentColor" strokeWidth="3"/>
    <circle cx="45" cy="46" r="4.5" stroke="currentColor" strokeWidth="3"/>
  </svg>
);

const BikeIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
    <circle cx="16" cy="42" r="10" stroke="currentColor" strokeWidth="3"/>
    <circle cx="48" cy="42" r="10" stroke="currentColor" strokeWidth="3"/>
    <path d="M16 42l10-18h12l6 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M38 24l10 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <path d="M28 24h10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="38" cy="18" r="4" stroke="currentColor" strokeWidth="2.5"/>
  </svg>
);

const AmbulanceIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
    <path d="M6 40h52M12 48h7m26 0h7" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <path d="M6 40V28a2 2 0 012-2h36l12 14v8" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M8 26v-6a2 2 0 012-2h28" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <path d="M24 30v10M19 35h10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="16" cy="48" r="4" stroke="currentColor" strokeWidth="3"/>
    <circle cx="44" cy="48" r="4" stroke="currentColor" strokeWidth="3"/>
    <path d="M48 18l3-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const EconomyIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
    <path d="M10 36h44M16 44h6m20 0h6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <path d="M8 36l6-12h36l6 12v7a2 2 0 01-2 2H10a2 2 0 01-2-2v-7z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M20 24l2-6h20l2 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="18" cy="44" r="4" stroke="currentColor" strokeWidth="3"/>
    <circle cx="46" cy="44" r="4" stroke="currentColor" strokeWidth="3"/>
    <path d="M30 18h4M32 16v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const PremiumIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
    <path d="M8 38h48M14 47h7m22 0h7" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <path d="M6 38l7-14h38l7 14v9a2 2 0 01-2 2H8a2 2 0 01-2-2v-9z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M16 24l4-9h24l4 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="17" cy="47" r="4.5" stroke="currentColor" strokeWidth="3"/>
    <circle cx="47" cy="47" r="4.5" stroke="currentColor" strokeWidth="3"/>
    <path d="M32 10l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5l2-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
const RIDES = [
  {
    key: "economy",
    title: "Economy Ride",
    tag: "Most Affordable",
    desc: "The smartest way to get around the city without breaking the bank. Perfect for solo daily commutes with speed and simplicity.",
    icon: EconomyIcon,
    price: "From ৳50",
    badge: null,
    features: ["Compact & fuel-efficient", "Up to 3 passengers", "AC available", "Fastest pickup time"],
  },
  {
    key: "car",
    title: "Standard Car",
    tag: "Everyday Comfort",
    desc: "A reliable sedan for your everyday rides. Clean, comfortable, and always on time — the go-to choice for most passengers.",
    icon: CarIcon,
    price: "From ৳80",
    badge: null,
    features: ["Sedan or hatchback", "Up to 4 passengers", "Full AC", "Verified driver"],
  },
  {
    key: "suv",
    title: "SUV Ride",
    tag: "Most Popular",
    desc: "Spacious, powerful, and built for groups. Whether it's a family trip or airport run with luggage, the SUV handles it all.",
    icon: SUVIcon,
    price: "From ৳150",
    badge: "Most Popular",
    features: ["Large SUV or MPV", "Up to 6 passengers", "Extra luggage space", "Premium comfort"],
  },
  {
    key: "premium",
    title: "Premium Ride",
    tag: "Luxury Experience",
    desc: "Arrive in style. Our premium fleet offers luxury vehicles with professional chauffeurs for business meetings and special occasions.",
    icon: PremiumIcon,
    price: "From ৳200",
    badge: "Luxury",
    features: ["Luxury sedan or SUV", "Professional chauffeur", "Complimentary water", "Priority support"],
  },
  {
    key: "bike",
    title: "Bike Ride",
    tag: "Beat the Traffic",
    desc: "Zip through traffic in minutes. The fastest and most affordable option for solo riders who value time over everything.",
    icon: BikeIcon,
    price: "From ৳25",
    badge: "Fastest",
    features: ["Solo passenger", "Helmet provided", "Fastest in traffic", "Lowest fare"],
  },
  {
    key: "ambulance",
    title: "Ambulance",
    tag: "Emergency Medical",
    desc: "Immediate medical transport with trained paramedics and full equipment. Available around the clock for any emergency.",
    icon: AmbulanceIcon,
    price: "On request",
    badge: "Emergency",
    features: ["Trained paramedic staff", "Medical equipment onboard", "Priority dispatch", "Available 24/7"],
  },
];

// ─── Zig-Zag Row ──────────────────────────────────────────────────────────────
function RideRow({ ride, index }) {
  const isEven = index % 2 === 0;
  const isEmergency = ride.badge === "Emergency";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="grid md:grid-cols-2 gap-0 items-stretch rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-500 group"
    >
      {/* Visual panel — alternates left/right */}
      <div className={`relative flex items-center justify-center p-12 bg-[#f8f9fb] border-gray-100 ${isEven ? "md:order-1 border-r" : "md:order-2 border-l"}`}>
        {/* Subtle background circle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 rounded-full bg-[#2FCA71]/5 group-hover:bg-[#2FCA71]/8 transition-colors duration-500" />
        </div>

        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.06, y: -4 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative z-10 w-28 h-28 text-[#011421]"
        >
          <ride.icon />
        </motion.div>

        {/* Badge */}
        {ride.badge && (
          <div className={`absolute top-5 ${isEven ? "right-5" : "left-5"}`}>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              isEmergency
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-[#011421] border-[#011421] text-white"
            }`}>
              {isEmergency && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
              {ride.badge}
            </span>
          </div>
        )}

        {/* Price tag */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
          <div className="px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-center">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Starting</p>
            <p className="text-sm font-black text-[#2FCA71]">{ride.price}</p>
          </div>
        </div>
      </div>

      {/* Content panel */}
      <div className={`flex flex-col justify-center p-10 md:p-12 ${isEven ? "md:order-2" : "md:order-1"}`}>
        {/* Tag */}
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-5 h-px bg-[#2FCA71]" />
          <span className="text-[11px] font-black text-[#2FCA71] uppercase tracking-[0.2em]">{ride.tag}</span>
        </div>

        {/* Title */}
        <h3 className="text-3xl font-black text-[#011421] tracking-tight leading-tight mb-3">
          {ride.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-7 max-w-sm">
          {ride.desc}
        </p>

        {/* Features */}
        <ul className="space-y-2.5 mb-8">
          {ride.features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-[#2FCA71] shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div>
          <Link
            href="/onway-book"
            className="inline-flex items-center gap-2 bg-[#011421] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#2FCA71] transition-colors duration-300 group/btn shadow-sm"
          >
            Book {ride.title}
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function RideCategoriesPage() {
  return (
    <main className="bg-[#f4f6f9] min-h-screen">
      <PageBanner
        tag="Ride Options"
        title="Ride Categories"
        subtitle="Six ride types built for every need — from daily commutes to emergencies."
        pills={["Economy", "Standard Car", "SUV", "Premium", "Bike", "Ambulance"]}
      />

      <section className="max-w-5xl mx-auto px-6 py-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-2">All Options</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#011421] tracking-tight">
            Pick your ride type
          </h2>
        </motion.div>

        {/* Zig-zag rows */}
        <div className="space-y-6">
          {RIDES.map((ride, i) => (
            <RideRow key={ride.key} ride={ride} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 relative rounded-[2.5rem] bg-[#011421] p-10 md:p-14 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#2FCA71]/8 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mb-2">Not sure which to pick?</h3>
            <p className="text-gray-400 text-sm max-w-sm">Check our pricing page for a full fare breakdown and comparison across all ride types.</p>
          </div>
          <Link
            href="/pricing"
            className="relative z-10 inline-flex items-center gap-2 bg-[#2FCA71] text-[#011421] font-black text-sm uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-[#26b861] transition-colors shrink-0 shadow-lg shadow-[#2FCA71]/20"
          >
            View Pricing <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
