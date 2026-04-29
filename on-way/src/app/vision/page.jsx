"use client";

import { motion } from "framer-motion";
import PageBanner from "../components/PageBanner";
import { Brain, Users, Leaf, Shield, Zap, Route } from "lucide-react";

const PILLARS = [
  {
    image: "/Ai_brain.png",
    title: "AI-Powered Routes",
    desc: "We plan to use artificial intelligence to calculate smarter, faster routes — reducing travel time and fuel waste for every single trip.",
    gradient: "from-violet-500 to-purple-700",
    glow: "shadow-violet-500/40",
    dot1: "bg-cyan-400 shadow-cyan-400/60",
    dot2: "bg-violet-300",
  },
  {
    image: "/ride_share.jpg",
    title: "Ride Sharing on Same Path",
    desc: "Passengers heading the same direction can share a ride — cutting costs, reducing traffic, and making every journey more efficient.",
    gradient: "from-blue-500 to-cyan-600",
    glow: "shadow-blue-500/40",
    dot1: "bg-sky-300 shadow-sky-300/60",
    dot2: "bg-blue-200",
  },
  {
    image: "/Green.png",
    title: "Eco-Friendly Vehicles",
    desc: "We're bringing in electric and low-emission vehicles to make transport greener, cleaner, and better for Bangladesh's future.",
    gradient: "from-[#2FCA71] to-emerald-600",
    glow: "shadow-emerald-500/40",
    dot1: "bg-lime-300 shadow-lime-300/60",
    dot2: "bg-green-200",
  },
  {
    image: "/safe.jpg",
    title: "Safer Every Ride",
    desc: "From verified drivers to real-time SOS, safety is never an afterthought. Every journey should end exactly where it was meant to.",
    gradient: "from-amber-400 to-orange-500",
    glow: "shadow-amber-500/40",
    dot1: "bg-yellow-300 shadow-yellow-300/60",
    dot2: "bg-amber-200",
  },
  {
    image: "/smrt.png",
    title: "Smarter Mobility for All",
    desc: "Not just for big cities. We're building infrastructure that reaches every corner of Bangladesh — affordable, reliable, and accessible.",
    gradient: "from-rose-500 to-pink-600",
    glow: "shadow-rose-500/40",
    dot1: "bg-pink-300 shadow-pink-300/60",
    dot2: "bg-rose-200",
  },
  {
    image: "/sobuj.avif",
    title: "A Greener Future",
    desc: "We're not just building an app — we're building a smarter, greener future for everyone who moves through this country.",
    gradient: "from-orange-400 to-red-500",
    glow: "shadow-orange-500/40",
    dot1: "bg-yellow-300 shadow-yellow-300/60",
    dot2: "bg-orange-200",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function FuturisticIcon({ p }) {
  if (p.image) {
    return (
      <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg shrink-0">
        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20" />
      <div className="absolute inset-4 rounded-full border border-white/10" />
      <div className={`relative z-10 w-20 h-20 rounded-3xl bg-linear-to-br ${p.gradient} flex items-center justify-center shadow-2xl ${p.glow}`}>
        <p.icon className="w-10 h-10 text-white" />
        <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${p.dot1} shadow-lg`} />
        <div className={`absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full ${p.dot2}`} />
      </div>
    </div>
  );
}

export default function VisionPage() {
  return (
    <div className="bg-white min-h-screen">
      <PageBanner
        tag="Our Vision"
        title="Moving Bangladesh Forward"
        subtitle="We're not just building a ride-sharing app — we're building a smarter, greener future for everyone."
        waveFill="#ffffff"
        titleSize="text-4xl sm:text-5xl md:text-6xl"
      />

      {/* Vision Statement */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-4">What We Believe</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#011421] tracking-tight leading-tight mb-8">
            A Bangladesh where every journey is{" "}
            <span className="text-[#2FCA71]">safe, smart,</span> and{" "}
            <span className="text-[#2FCA71]">accessible.</span>
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
            While our teammates talked about the features, we want to share where we&apos;re headed.
            Our project isn&apos;t just about booking rides &mdash; it&apos;s about smarter, easier mobility for everyone in Bangladesh.
          </p>
        </motion.div>
      </section>

      {/* Zig-Zag Pillars */}
      <section className="bg-[#f4f6f9] py-20">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-4">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-3">Our Pillars</p>
            <h2 className="text-4xl font-black text-[#011421] tracking-tight">What drives us every day</h2>
          </motion.div>

          {PILLARS.map((p, i) => {
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`flex flex-col sm:flex-row items-center gap-8 ${!isEven ? "sm:flex-row-reverse" : ""}`}
              >
                <div className="shrink-0">
                  <FuturisticIcon p={p} />
                </div>
                <div className={`flex-1 ${isEven ? "text-left" : "text-left sm:text-right"}`}>
                  <div className={`flex items-center gap-2 mb-2 ${!isEven ? "sm:flex-row-reverse" : ""}`}>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#2FCA71]">0{i + 1}</span>
                    <div className="w-8 h-px bg-[#2FCA71]" />
                  </div>
                  <h3 className="text-xl font-black text-[#011421] mb-2">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Roadmap */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-3">Our Journey</p>
          <h2 className="text-4xl font-black text-[#011421] tracking-tight">The road ahead</h2>
        </motion.div>
        <div className="relative">
          <div className="absolute left-[28px] top-0 bottom-0 w-0.5 bg-gray-100" />
          <div className="space-y-10">
            {[
              { year: "2024", title: "OnWay Founded", desc: "Five co-founders with one shared frustration — and one big idea." },
              { year: "2025", title: "First 10,000 Rides", desc: "Launched in Dhaka and reached our first major milestone within months." },
              { year: "2025", title: "Safety Shield Launch", desc: "Introduced real-time SOS, OTP verification, and live trip sharing." },
              { year: "2026", title: "AI Route Optimization", desc: "Deploying AI to calculate smarter, faster routes for every trip." },
              { year: "2026", title: "Ride Sharing Launch", desc: "Passengers on the same path can share rides — cheaper and greener." },
              { year: "2027", title: "Green Fleet Initiative", desc: "Partnering with EV manufacturers to build a cleaner ride network across Bangladesh." },
            ].map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex gap-8 items-start"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#011421] text-white flex items-center justify-center shrink-0 text-xs font-black relative z-10">
                  {m.year}
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-black text-[#011421] mb-1">{m.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#011421] py-24 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
            Be part of the <span className="text-[#2FCA71]">movement.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Whether you ride, drive, or build &mdash; there&apos;s a place for you in OnWay&apos;s vision.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/onway-book" className="px-8 py-4 bg-[#2FCA71] text-white font-black rounded-full hover:bg-[#25a85e] transition-all text-sm uppercase tracking-widest">
              Book a Ride
            </a>
            <a href="/earn-with-onway" className="px-8 py-4 bg-white/10 text-white border border-white/20 font-black rounded-full hover:bg-white/20 transition-all text-sm uppercase tracking-widest">
              Become a Driver
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
