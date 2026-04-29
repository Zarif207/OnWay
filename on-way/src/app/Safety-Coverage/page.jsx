"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck, HeartPulse, Smartphone, Car,
  Siren, MapPin, Lock, CheckCircle, ArrowRight, Users,
} from "lucide-react";
import Link from "next/link";
import PageBanner from "../components/PageBanner";

// ─── Coverage cards ────────────────────────────────────────────────────────────
const COVERAGE = [
  {
    icon: HeartPulse,
    title: "Accidental Medical Expense",
    desc: "Immediate financial coverage for medical treatment following any accident during an OnWay trip.",
    limit: "Up to ৳50,000",
  },
  {
    icon: ShieldCheck,
    title: "Permanent Disability",
    desc: "Comprehensive benefits for riders and drivers in cases of accident-related permanent disability.",
    limit: "Up to ৳2,00,000",
  },
  {
    icon: Smartphone,
    title: "24/7 Ride Monitoring",
    desc: "Every trip is tracked in real-time from our control room. Our team can intervene within minutes.",
    limit: "Live Tracking",
  },
  {
    icon: Siren,
    title: "Emergency SOS",
    desc: "One-tap SOS button connects you directly to our safety team and local emergency services instantly.",
    limit: "Instant Response",
  },
  {
    icon: MapPin,
    title: "Live Location Sharing",
    desc: "Share your real-time trip location with up to 3 emergency contacts at any point during a ride.",
    limit: "Real-Time",
  },
  {
    icon: Lock,
    title: "Driver Verification",
    desc: "Every driver passes NID checks, BRTA license verification, and AI face recognition before activation.",
    limit: "100% Verified",
  },
];

// ─── Safety pillars ────────────────────────────────────────────────────────────
const PILLARS = [
  "Verified and trained drivers on every trip",
  "In-app SOS emergency button, always accessible",
  "Live location sharing with emergency contacts",
  "Safety gear and hygiene kits are mandatory",
  "Accident insurance coverage on every ride",
  "24/7 control room monitoring all active trips",
];

// ─── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "500K+", label: "Safe Journeys" },
  { value: "2K+",   label: "Verified Drivers" },
  { value: "24/7",  label: "Live Monitoring" },
  { value: "< 2min", label: "SOS Response" },
];

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
});

export default function SafetyCoveragePage() {
  return (
    <main className="bg-[#f4f6f9] min-h-screen overflow-hidden">
      <PageBanner
        tag="Your Protection"
        title="Safety Coverage"
        subtitle="Every OnWay trip is backed by comprehensive safety systems, insurance, and 24/7 monitoring."
        pills={["Medical Coverage", "Disability Benefits", "Live Monitoring", "SOS Button", "Verified Drivers"]}
      />

      {/* ── Stats strip ── */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label} {...fadeUp(i)}
              className="text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm"
            >
              <p className="text-3xl font-black text-[#011421]">{s.value}</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Coverage grid ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <motion.div {...fadeUp()} className="mb-12">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-2">What's Covered</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#011421] tracking-tight">
            Your protection, in detail
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {COVERAGE.map((item, i) => (
            <motion.div key={item.title} {...fadeUp(i)}
              className="group relative p-7 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              {/* top accent line */}
              <div className="absolute top-0 left-0 w-0 group-hover:w-full h-0.5 bg-[#2FCA71] transition-all duration-500 rounded-full" />

              <div className="w-12 h-12 rounded-2xl bg-[#2FCA71]/10 flex items-center justify-center mb-5">
                <item.icon className="w-5 h-5 text-[#2FCA71]" />
              </div>

              <h3 className="text-base font-black text-[#011421] mb-2 leading-snug">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{item.desc}</p>

              <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-100">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#2FCA71]" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coverage</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#2FCA71]/10 text-[#2FCA71] text-[11px] font-black">
                  {item.limit}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Why OnWay safety — split section ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <motion.div {...fadeUp()}
          className="relative rounded-[2.5rem] bg-[#011421] overflow-hidden"
        >
          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#2FCA71]/8 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/6 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 grid md:grid-cols-2 gap-0">
            {/* Left — pillars */}
            <div className="p-10 md:p-14 border-b md:border-b-0 md:border-r border-white/5">
              <p className="text-[11px] font-black text-[#2FCA71] uppercase tracking-[0.25em] mb-3">Our Commitment</p>
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-8">
                Why OnWay safety<br />
                <span className="text-[#2FCA71]">is the best</span>
              </h3>
              <ul className="space-y-4">
                {PILLARS.map((p, i) => (
                  <motion.li
                    key={p}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.45 }}
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#2FCA71]/15 border border-[#2FCA71]/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#2FCA71]/25 transition-colors">
                      <CheckCircle className="w-3 h-3 text-[#2FCA71]" />
                    </div>
                    <span className="text-gray-300 text-sm leading-relaxed">{p}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Right — stat card + CTA */}
            <div className="p-10 md:p-14 flex flex-col justify-between gap-10">
              {/* Big stat */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm text-center group hover:bg-white/8 transition-colors duration-300"
              >
                <div className="absolute inset-0 rounded-[2rem] bg-[#2FCA71]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#2FCA71]/10 flex items-center justify-center mx-auto mb-5">
                    <Car className="w-8 h-8 text-[#2FCA71]" />
                  </div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Confidence of</p>
                  <p className="text-6xl font-black text-white tracking-tighter mb-1">500K+</p>
                  <p className="text-[#2FCA71] text-xs font-black uppercase tracking-widest">Safe Journeys Completed</p>
                </div>
              </motion.div>

              {/* Driver count */}
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#2FCA71]/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-[#2FCA71]" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">2,000+ Verified Drivers</p>
                  <p className="text-gray-500 text-xs">All background-checked & AI-verified</p>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/onway-book"
                className="inline-flex items-center justify-center gap-2 bg-[#2FCA71] text-[#011421] font-black text-sm uppercase tracking-widest px-6 py-4 rounded-2xl hover:bg-[#26b861] transition-colors shadow-lg shadow-[#2FCA71]/20"
              >
                Book a Safe Ride <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Emergency CTA strip ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div {...fadeUp()}
          className="relative rounded-[2rem] bg-white border border-gray-100 shadow-sm overflow-hidden p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2FCA71] rounded-l-[2rem]" />
          <div className="pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Siren className="w-5 h-5 text-[#2FCA71]" />
              <p className="text-[11px] font-black text-[#2FCA71] uppercase tracking-[0.25em]">Emergency</p>
            </div>
            <h3 className="text-2xl font-black text-[#011421] mb-1">Need immediate help?</h3>
            <p className="text-gray-500 text-sm">Our safety team is available 24/7. Use the SOS button in-app or call us directly.</p>
          </div>
          <div className="flex gap-3 shrink-0 flex-wrap">
            <a
              href="tel:+8801234567890"
              className="inline-flex items-center gap-2 bg-[#011421] text-white font-black text-xs uppercase tracking-widest px-5 py-3 rounded-2xl hover:bg-[#2FCA71] transition-colors duration-300"
            >
              Call Safety Line
            </a>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 bg-gray-100 text-[#011421] font-black text-xs uppercase tracking-widest px-5 py-3 rounded-2xl hover:bg-gray-200 transition-colors duration-300"
            >
              Help Center <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
