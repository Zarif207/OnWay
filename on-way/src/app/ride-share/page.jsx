"use client";

import { motion } from "framer-motion";
import { MapPin, Users, Car, Star, CheckCircle, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import PageBanner from "../components/PageBanner";

const STEPS = [
  { num: "01", icon: MapPin,  title: "Set Your Location",    desc: "Enter your pickup point and destination. Our smart system finds the best route instantly." },
  { num: "02", icon: Users,   title: "Match with a Driver",  desc: "We connect you with the nearest verified driver. See their rating, vehicle, and ETA." },
  { num: "03", icon: Car,     title: "Ride & Track Live",    desc: "Track your ride in real-time. Share your trip with family for added safety." },
  { num: "04", icon: Star,    title: "Pay & Rate",           desc: "Pay seamlessly via cash or digital methods. Rate your experience to help the community." },
];

const BENEFITS = [
  "Verified & background-checked drivers",
  "Real-time GPS tracking on every trip",
  "Emergency SOS button in-app",
  "Transparent pricing — no surge surprises",
  "24/7 customer support",
  "Multiple payment options",
];

export default function RideSharePage() {
  return (
    <main className="bg-[#f4f6f9] min-h-screen">
      <PageBanner
        tag="OnWay Ride Share"
        title="Your Ride, Your Way"
        subtitle="Safe, affordable, and reliable rides connecting you to every corner of the city — on demand."
      />

      {/* Timeline — step-by-step */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-2">Simple Process</p>
          <h2 className="text-4xl font-black text-[#011421] tracking-tight">How it works</h2>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#2FCA71]/40 via-[#2FCA71]/20 to-transparent hidden md:block" />

          <div className="space-y-10">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-6 items-start group"
              >
                {/* Node */}
                <div className="relative shrink-0 w-12 h-12 rounded-full bg-white border-2 border-[#2FCA71]/30 group-hover:border-[#2FCA71] flex items-center justify-center shadow-sm transition-colors duration-300 z-10">
                  <step.icon className="w-5 h-5 text-[#2FCA71]" />
                </div>
                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-black text-gray-300 tracking-widest">{step.num}</span>
                    <h3 className="text-lg font-black text-[#011421]">{step.title}</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits + CTA split */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-3">Why OnWay</p>
            <h3 className="text-2xl font-black text-[#011421] mb-6">Every ride, every time</h3>
            <ul className="space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <CheckCircle className="w-4 h-4 text-[#2FCA71] shrink-0" /> {b}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative p-8 rounded-2xl bg-[#011421] overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#2FCA71]/10 blur-[60px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <Zap className="w-8 h-8 text-[#2FCA71] mb-4" />
              <h3 className="text-2xl font-black text-white mb-3">Ready to book?</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">Join thousands of riders who trust OnWay for their daily commute.</p>
            </div>
            <div className="relative z-10 flex flex-col gap-3">
              <Link href="/onway-book" className="inline-flex items-center justify-center gap-2 bg-[#2FCA71] text-[#011421] font-black text-sm uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#26b861] transition-colors shadow-lg shadow-[#2FCA71]/20">
                Book a Ride Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/driver-register" className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-white/10 transition-colors">
                Become a Driver
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
