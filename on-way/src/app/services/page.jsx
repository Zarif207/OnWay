"use client";

import { motion } from "framer-motion";
import { Car, Zap, Shield, Users, Smartphone, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";
import PageBanner from "../components/PageBanner";

const SERVICES = [
  { icon: Car,         title: "OnWay Ride Share",    desc: "Affordable, on-demand rides with verified drivers and real-time GPS tracking across the city.", color: "bg-[#2FCA71]/10 text-[#2FCA71]", href: "/ride-share" },
  { icon: Zap,         title: "Express Rides",        desc: "Priority matching with the nearest driver. Guaranteed pickup in under 5 minutes.", color: "bg-amber-400/10 text-amber-500", href: "/ride-share" },
  { icon: Shield,      title: "Safety Coverage",      desc: "24/7 monitoring, emergency SOS, and accident insurance on every single trip.", color: "bg-blue-500/10 text-blue-500", href: "/Safety-Coverage" },
  { icon: Users,       title: "Ride Categories",      desc: "Economy, Premium, Shared, and Express — a ride type for every need and budget.", color: "bg-violet-500/10 text-violet-500", href: "/ride-categories" },
  { icon: Smartphone,  title: "Live Tracking",        desc: "Track your driver in real-time. Share your trip with loved ones for added peace of mind.", color: "bg-pink-500/10 text-pink-500", href: "/onway-book" },
  { icon: CreditCard,  title: "Flexible Payments",    desc: "Cash, card, bKash, Nagad — pay however you want with full transparency.", color: "bg-teal-500/10 text-teal-500", href: "/pricing" },
];

const STATS = [
  { value: "50K+",  label: "Active Riders" },
  { value: "2K+",   label: "Verified Drivers" },
  { value: "500K+", label: "Safe Trips" },
  { value: "4.9★",  label: "App Rating" },
];

export default function ServicesPage() {
  return (
    <main className="bg-[#f4f6f9] min-h-screen">
      <PageBanner
        tag="OnWay Platform"
        title="Our Services"
        subtitle="Everything you need for a smarter, safer, and more comfortable journey — all in one platform."
        pills={["Ride Share", "Express", "Safety", "Categories", "Live Tracking", "Payments"]}
      />

      {/* Stats strip */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm"
            >
              <p className="text-3xl font-black text-[#011421]">{s.value}</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-2">What We Offer</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#011421] tracking-tight">Built for every journey</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="group relative p-7 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              {/* hover tint */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2FCA71]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mb-5`}>
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-[#011421] mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{s.desc}</p>
              <Link href={s.href} className="inline-flex items-center gap-1.5 text-[#2FCA71] text-xs font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                Learn More <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dark CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2.5rem] bg-[#011421] p-10 md:p-16 overflow-hidden text-center"
        >
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#2FCA71]/8 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-600/8 blur-[60px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[11px] font-black text-[#2FCA71] uppercase tracking-[0.25em] mb-4">Get Started</p>
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to ride with OnWay?</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-8">Book your first ride today and experience the difference.</p>
            <Link href="/onway-book" className="inline-flex items-center gap-2 bg-[#2FCA71] text-[#011421] font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-[#26b861] transition-colors shadow-lg shadow-[#2FCA71]/20">
              Book a Ride <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
