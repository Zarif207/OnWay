"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  Facebook,
  Instagram,
  Youtube,
  Send,
  Linkedin,
  Phone,
  Clock,
  MapPin,
  ArrowRight,
  Mail,
  ShieldCheck,
  Zap,
  Star,
} from "lucide-react";
import logoImage from "../../../public/onway_logo.png";

// ================= CONSTANTS & DATA =================

const QUICK_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Our Services", href: "/onway-book" },
  { label: "Project", href: "/earn-with-onway" },
  { label: "FAQ's", href: "/faq" },
  { label: "Our Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

const SERVICE_LINKS = [
  { label: "OnWay Ride Share", href: "/onway-book" },
  { label: "Ride Categories", href: "/earn-with-onway" },
  { label: "Fare & Pricing", href: "/pricing" },
  { label: "Safety Center", href: "/Safety-Coverage" },
  { label: "Driver Registration", href: "/earn-with-onway" },
  { label: "Support & Help", href: "/help" },
];

const SOCIAL_LINKS = [
  { icon: Facebook, href: "#", color: "hover:bg-blue-600" },
  { icon: Instagram, href: "#", color: "hover:bg-pink-600" },
  { icon: Linkedin, href: "#", color: "hover:bg-blue-700" },
  { icon: Youtube, href: "#", color: "hover:bg-red-600" },
];

const OPENING_HOURS = [
  { day: "Week Days", time: "09:00 - 19:00", info: "Normal Shift" },
  { day: "Saturday", time: "08:00 - 16:00", info: "Reduced Hours" },
  { day: "Friday", time: "Closed", info: "Emergency Only" },
];

// ================= SUB-COMPONENTS =================

const FooterHeading = ({ children }) => (
  <div className="relative mb-8 group">
    <h4 className="text-white font-bold text-xl tracking-tight">{children}</h4>
    <div className="absolute -bottom-2 left-0 w-12 h-1 bg-linear-to-r from-[#2FCA71] to-blue-500 rounded-full transition-all duration-300 group-hover:w-20" />
  </div>
);

const FooterLink = ({ href, children }) => (
  <li>
    <Link
      href={href}
      className="text-gray-400 hover:text-white flex items-center gap-2 group transition-all duration-300 translate-x-0 hover:translate-x-2"
    >
      <ArrowRight
        size={14}
        className="opacity-0 group-hover:opacity-100 -ml-4 transition-all duration-300 group-hover:ml-0 text-[#2FCA71]"
      />
      <span className="text-sm font-medium">{children}</span>
    </Link>
  </li>
);

// ================= MAIN COMPONENT =================

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Welcome aboard! You're subscribed.", {
          style: {
            background: "#0B1E3C",
            color: "#fff",
            borderRadius: "1rem",
            border: "1px solid #2FCA71",
          },
        });
        setEmail("");
      } else {
        toast.error(data.message || "Something went wrong!");
      }
    } catch (error) {
      toast.error("Bridge link failed. Try again soon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative bg-[#0B1E3C] pt-24 pb-12 overflow-hidden">
      <Toaster position="bottom-right" />

      {/* --- BACKGROUND LAYERS --- */}
      {/* 1. Background Image */}
      <div className="absolute inset-0 z-0 bg-[url('/home-3.webp')] bg-cover bg-center bg-no-repeat opacity-40 grayscale" />

      {/* 2. Dark Navy Overlay (Gradient for depth) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0B1D3A]/90 via-[#0B1D3A]/85 to-[#07142A]/95 backdrop-blur-[2px]" />

      {/* 3. Original Premium Glow Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent shadow-[0_1px_10px_rgba(255,255,255,0.05)]" />
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#2FCA71]/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Newsletter & Header Section */}
        <div className="mb-24 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Zap size={14} className="text-[#2FCA71]" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Premium Mobility
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Ready for your next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2FCA71] to-blue-400">
                Premium Journey?
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              Stay ahead with OnWay. Get exclusive updates on new routes, driver
              benefits, and platform security insights.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#2FCA71]/5 to-blue-500/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <form
              onSubmit={handleSubscribe}
              className="relative z-10 space-y-4"
            >
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#2FCA71] transition-colors"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-[#0A2540] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#2FCA71]/30 focus:border-[#2FCA71] transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#2FCA71] to-[#26a15a] py-4 rounded-2xl text-white font-black uppercase tracking-widest text-sm hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(47,202,113,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
              >
                {isSubmitting ? (
                  "Connecting..."
                ) : (
                  <>
                    Join the Elite
                    <Send
                      size={18}
                      className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform"
                    />
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-gray-500 font-medium">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          </motion.div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/5">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="inline-flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-[#2FCA71]/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
                <Image
                  src={logoImage}
                  alt="OnWay"
                  width={140}
                  height={56}
                  className="relative z-10 brightness-0 invert"
                />
              </div>
            </Link>
            <p className="text-gray-400 leading-relaxed text-sm lg:text-base pr-4">
              OnWay is reshaping city transit through smart, safe, and efficient
              mobility solutions. Join the network that moves you better.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 ${social.color} hover:scale-110 shadow-lg`}
                >
                  <social.icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* Nav Col 1 */}
          <div className="lg:col-span-2">
            <FooterHeading>Platform</FooterHeading>
            <ul className="space-y-4">
              {QUICK_LINKS.map((link) => (
                <FooterLink key={link.label} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div className="lg:col-span-3">
            <FooterHeading>Solutions</FooterHeading>
            <ul className="space-y-4">
              {SERVICE_LINKS.map((link) => (
                <FooterLink key={link.label} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Op Hours Col */}
          <div className="lg:col-span-3">
            <FooterHeading>Operations</FooterHeading>
            <div className="space-y-4">
              {OPENING_HOURS.map((oh) => (
                <div
                  key={oh.day}
                  className="flex justify-between items-center group"
                >
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-[#2FCA71] transition-colors">
                      {oh.day}
                    </p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">
                      {oh.info}
                    </p>
                  </div>
                  <div className="h-px flex-1 mx-4 bg-white/5" />
                  <p className="text-sm font-mono text-gray-400 group-hover:text-white transition-colors">
                    {oh.time}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2FCA71]/10 flex items-center justify-center text-[#2FCA71]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-tighter">
                  Safety First
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  24/7 Live Monitoring
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats / Badges (Uber-style depth) */}
        <div className="py-12 flex flex-wrap items-center justify-center lg:justify-between gap-8 opacity-40 grayscale group-hover:opacity-100 transition-all duration-700">
          <div className="flex items-center gap-2 text-white">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-black tracking-widest uppercase">
              Top Rated App
            </span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck size={16} className="text-blue-400" />
            <span className="text-sm font-black tracking-widest uppercase">
              Verified Drivers
            </span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <MapPin size={16} className="text-[#2FCA71]" />
            <span className="text-sm font-black tracking-widest uppercase">
              Global Network
            </span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Zap size={16} className="text-orange-400 fill-orange-400" />
            <span className="text-sm font-black tracking-widest uppercase">
              Instant Support
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-gray-500 text-xs font-medium">
            © {new Date().getFullYear()} OnWay Technologies Ltd.{" "}
            <span className="mx-2 opacity-30">|</span> Made with passion for
            mobility.
          </div>
          <div className="flex items-center gap-8">
            <Link
              href="/Privacy"
              className="text-xs font-bold text-gray-500 hover:text-[#2FCA71] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/Terms"
              className="text-xs font-bold text-gray-500 hover:text-[#2FCA71] transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/Safety-Coverage"
              className="text-xs font-bold text-gray-500 hover:text-[#2FCA71] transition-colors"
            >
              Safety Coverage
            </Link>
            <Link
              href="#"
              className="text-xs font-bold text-gray-500 hover:text-[#2FCA71] transition-colors"
            >
              The Developers
            </Link>
          </div>
        </div>
      </div>

      {/* Extreme Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#2FCA71] via-blue-500 to-emerald-500 opacity-50" />
    </footer>
  );
}
