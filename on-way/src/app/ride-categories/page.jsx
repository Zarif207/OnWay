"use client";

import { motion } from "framer-motion";
import { Car, Zap, Star, Users, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import PageBanner from "../components/PageBanner";

const CATEGORIES = [
  {
    icon: Car,
    name: "Economy",
    tagline: "Affordable everyday rides",
    price: "From ৳50",
    gradient: "from-[#2FCA71] to-teal-400",
    features: ["Compact & fuel-efficient", "Up to 3 passengers", "AC available", "Fastest pickup"],
    popular: false,
  },
  {
    icon: Star,
    name: "Premium",
    tagline: "Comfort for every occasion",
    price: "From ৳120",
    gradient: "from-amber-400 to-orange-500",
    features: ["Sedan or SUV", "Up to 4 passengers", "Full AC", "Professional driver"],
    popular: true,
  },
  {
    icon: Users,
    name: "Shared",
    tagline: "Split the cost, share the ride",
    price: "From ৳30",
    gradient: "from-blue-400 to-violet-500",
    features: ["Up to 3 co-riders", "Eco-friendly option", "Reduced fare", "Fixed routes"],
    popular: false,
  },
  {
    icon: Zap,
    name: "Express",
    tagline: "When every minute counts",
    price: "From ৳80",
    gradient: "from-pink-400 to-rose-500",
    features: ["Priority matching", "Fastest drivers", "No detours", "Guaranteed on-time"],
    popular: false,
  },
];

export default function RideCategoriesPage() {
  return (
    <main className="bg-[#f4f6f9] min-h-screen">
      <PageBanner
        tag="Ride Options"
        title="Ride Categories"
        subtitle="Choose the ride that fits your budget, comfort, and schedule. Every category is covered."
      />

      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-2">All Options</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#011421] tracking-tight">Pick your ride type</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="group relative p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              {cat.popular && (
                <div className="absolute top-5 right-5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-black uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              {/* gradient top bar */}
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${cat.gradient}`} />

              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-5 shadow-md`}>
                <cat.icon className="w-7 h-7 text-white" />
              </div>

              <div className="flex items-end justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-black text-[#011421]">{cat.name}</h3>
                  <p className="text-gray-400 text-sm">{cat.tagline}</p>
                </div>
                <span className={`text-lg font-black bg-gradient-to-r ${cat.gradient} bg-clip-text text-transparent`}>{cat.price}</span>
              </div>

              <div className="h-px bg-gray-100 mb-5" />

              <ul className="space-y-2.5 mb-6">
                {cat.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-[#2FCA71] shrink-0" /> {f}
                  </li>
                ))}
              </ul>

              <Link href="/onway-book" className="inline-flex items-center gap-1.5 text-[#2FCA71] text-xs font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                Book This Ride <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2.5rem] bg-[#011421] p-10 md:p-14 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#2FCA71]/8 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mb-2">Not sure which to pick?</h3>
            <p className="text-gray-400 text-sm max-w-sm">Check our pricing page for a full fare breakdown and comparison.</p>
          </div>
          <Link href="/pricing" className="relative z-10 inline-flex items-center gap-2 bg-[#2FCA71] text-[#011421] font-black text-sm uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-[#26b861] transition-colors shrink-0">
            View Pricing <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
