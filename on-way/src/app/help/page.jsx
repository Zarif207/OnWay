"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Car, CreditCard, Shield, User, ChevronDown, Mail, Phone, MessageCircle, ArrowRight, Search, Bike, MapPin } from "lucide-react";
import PageBanner from "../components/PageBanner";

const CATEGORIES = [
  { icon: Car,        label: "Rides",    color: "bg-[#2FCA71]/10 text-[#2FCA71]",   topics: ["How to book a ride", "Cancel or modify a trip", "Lost item in a ride", "Driver didn't arrive"] },
  { icon: CreditCard, label: "Payments", color: "bg-blue-500/10 text-blue-500",      topics: ["Payment methods accepted", "Fare calculation explained", "Refund policy", "Promo codes & discounts"] },
  { icon: Shield,     label: "Safety",   color: "bg-amber-400/10 text-amber-500",    topics: ["Emergency SOS feature", "Report a safety concern", "Driver verification process", "Insurance coverage"] },
  { icon: User,       label: "Account",  color: "bg-violet-500/10 text-violet-500",  topics: ["Update profile info", "Change password", "Delete account", "Notification settings"] },
];

const FAQS = [
  { q: "How do I contact support?",       a: "You can reach us via email at support@onway.com, call our 24/7 hotline, or use the live chat in the app." },
  { q: "How long does a refund take?",    a: "Refunds are processed within 3–5 business days depending on your payment method." },
  { q: "Can I report a driver?",          a: "Yes. Go to your trip history, select the trip, and tap 'Report an Issue'. Our team reviews all reports within 24 hours." },
  { q: "What if I left something in the car?", a: "Go to your recent trips, select the ride, and tap 'Lost Item'. We'll connect you with the driver directly." },
  { q: "How do I cancel a ride?",         a: "Tap the cancel button in the app before the driver arrives. A small fee may apply if the driver is already on the way." },
];

export default function HelpPage() {
  const [open, setOpen] = useState(null);
  const [query, setQuery] = useState("");

  const filtered = FAQS.filter(f =>
    !query.trim() || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="bg-[#f4f6f9] min-h-screen">
      <PageBanner
        tag="Support Center"
        title="How can we help?"
        subtitle="Find answers, get support, and resolve issues — we're here 24/7."
        pills={["Rides", "Payments", "Safety", "Account", "Refunds", "Live Chat"]}
      />

      {/* Search bar */}
      <section className="max-w-2xl mx-auto px-6 pt-12 relative z-20 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white border border-gray-200 shadow-lg text-[#011421] text-sm font-medium placeholder-gray-400 outline-none focus:border-[#2FCA71] focus:ring-2 focus:ring-[#2FCA71]/20 transition-all"
          />
        </motion.div>
      </section>

      {/* Help Sections */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { href: "/help/user", icon: User, label: "Passenger Help", desc: "Booking, payments, safety & account support for passengers", color: "bg-blue-500/10 text-blue-500" },
            { href: "/help/rider", icon: Bike, label: "Rider Help", desc: "Earnings, rides, documents & account support for riders", color: "bg-[#2FCA71]/10 text-[#2FCA71]" },
            { href: "/help/walk-in-support", icon: MapPin, label: "Walk-In Support", desc: "Find a physical support center near you", color: "bg-amber-400/10 text-amber-500" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Link href={item.href} className="block p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#2FCA71]/30 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-black text-[#011421] mb-2 group-hover:text-[#2FCA71] transition-colors">{item.label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-[#2FCA71] text-xs font-bold">
                  View FAQs <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-2">Browse Topics</p>
          <h2 className="text-4xl font-black text-[#011421] tracking-tight">Support categories</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-11 h-11 rounded-2xl ${cat.color} flex items-center justify-center mb-4`}>
                <cat.icon className="w-5 h-5" />
              </div>
              <h3 className="font-black text-[#011421] mb-3">{cat.label}</h3>
              <ul className="space-y-1.5">
                {cat.topics.map((t) => (
                  <li key={t} className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#2FCA71] cursor-pointer transition-colors">
                    <ArrowRight className="w-3 h-3 shrink-0" /> {t}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* FAQ accordion */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-2">Quick Answers</p>
          <h2 className="text-4xl font-black text-[#011421] tracking-tight">Common questions</h2>
        </motion.div>

        <div className="space-y-3 mb-20">
          {filtered.length === 0 && (
            <p className="text-gray-400 text-sm py-8 text-center">No results for "{query}"</p>
          )}
          {filtered.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-black text-[#011421] text-sm">{faq.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact channels */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2.5rem] bg-[#011421] p-10 md:p-14 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#2FCA71]/8 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 text-center mb-10">
            <h3 className="text-3xl font-black text-white mb-2">Still need help?</h3>
            <p className="text-gray-400">Our support team is available around the clock.</p>
          </div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Mail,          label: "Email Us",    sub: "support@onway.com",   color: "border-blue-500/20 text-blue-400" },
              { icon: Phone,         label: "Call Us",     sub: "+880 1234-567890",    color: "border-[#2FCA71]/20 text-[#2FCA71]" },
              { icon: MessageCircle, label: "Live Chat",   sub: "Avg. 2 min response", color: "border-violet-500/20 text-violet-400" },
            ].map((ch) => (
              <div key={ch.label} className={`p-6 rounded-2xl bg-white/5 border ${ch.color} text-center`}>
                <ch.icon className="w-7 h-7 mx-auto mb-3" />
                <p className="font-black text-white text-sm mb-1">{ch.label}</p>
                <p className="text-xs text-gray-500">{ch.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
