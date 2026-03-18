"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  Facebook,
  Instagram,
  Youtube,
  Send,
  Linkedin,
  Phone,
  Clock,
  MapPin
} from "lucide-react";
import logoImage from "../../../public/icon2.png";
import AnimatedButton from "./AnimatedButton";

import { AnimatedHeading, StaggerContainer } from "./MotionWrappers";

// Quick Links Data with Routes
const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Our Services", href: "/onway-book" },
  { label: "Project", href: "/earn-with-onway" },
  { label: "FAQ's", href: "/faq" },
  { label: "Our Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

// Our Services Data with Routes
const serviceLinks = [
  { label: "OnWay Ride Share", href: "/onway-book" },
  { label: "Premium Car Rent", href: "/pricing" },
  { label: "OnWay CNG Rapid", href: "/onway-book" },
  { label: "Executive Travel", href: "/rideSharing-guidlines" },
  { label: "OnWay Pay Secure", href: "/Safety-Coverage" },
  { label: "Air Freight Tracking", href: "/onway-book" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (isSubscribed) {
      setIsSubscribed(false);
      setStatus("idle");
    }
  };

  // Handle Subscribe Logic
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubscribed(true);
        setStatus("success");
        setEmail("");
        toast.success(data.message || "Successfully Subscribed!", {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#0A1F3D",
            color: "#fff",
            border: "1px solid #22c55e",
          },
        });
      } else {

        if (data.message && data.message.toLowerCase().includes("already")) {
          setIsSubscribed(true);
          setStatus("idle");
        } else {
          setStatus("error");
        }
        toast.error(data.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Subscription Error:", error);
      setStatus("error");
      toast.error("Failed to connect to server.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] // Custom ease for premium feel
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
  };

  const XIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  return (
    <footer
      className="relative w-full overflow-hidden bg-cover bg-center border-t border-white/5 pb-10"
      // Added slight contrast/brightness filter to make image pop more
      style={{ backgroundImage: "url('/home-3.webp')", filter: "brightness(1.05) contrast(1.05)" }}
    >
      <Toaster />

      {/* Heavy Dark Overlays */}
      <div className="absolute inset-0 bg-[#0A1F3D]/95 z-0" />
      <div className="absolute inset-0 bg-linear-to-b from-[#0A1F3D]/50 via-transparent to-[#050B1A] z-0" />

      {/* Floating blur blobs (low opacity) background effects for a touch of tech-glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen" />

        {/* Very soft noise texture (optional but adds premium feel) */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-16">

        {/* ================= NEWSLETTER SECTION ================= */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-16 px-2 lg:px-4">
          <div className="max-w-xl text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 drop-shadow-md">
                Stay in the loop
              </h3>
              <p className="text-white/80 text-base lg:text-lg font-medium leading-relaxed drop-shadow-sm">
                Get exclusive updates, early access features, and premium mobility insights.
              </p>
            </motion.div>
          </div>

          <motion.form
            onSubmit={handleSubscribe}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-center w-full lg:w-[480px] h-14 sm:h-16 bg-white/10 backdrop-blur-md rounded-full border border-white/20 p-1.5 pl-5 sm:pl-6 focus-within:ring-2 focus-within:ring-[#22c55e] focus-within:bg-white/15 focus-within:shadow-[0_0_25px_rgba(34,197,94,0.15)] transition-all duration-300 relative group overflow-hidden"
          >
            {/* Subtle inner glow for the input container */}
            <div className="absolute inset-0 shadow-[inset_0_1px_rgba(255,255,255,0.05)] rounded-full pointer-events-none" />

            <input
              type="email"
              required
              disabled={status === "loading"}
              value={email}
              onChange={handleEmailChange}
              placeholder={isSubscribed && !email ? "You're already a subscriber!" : "Your Email"}
              className="group w-full bg-transparent text-white placeholder:text-zinc-400 outline-none text-sm font-medium"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className={`h-full px-8 rounded-full flex items-center gap-2 font-black uppercase text-xs tracking-widest transition-all shadow-xl 
                ${(isSubscribed && !email)
                  ? "bg-zinc-600 cursor-not-allowed text-white"
                  : "bg-[#22c55e] hover:brightness-110 active:scale-95 shadow-[#22c55e]/20 text-white"}`}
            >
              {status === "loading" ? "..." : (isSubscribed && !email) ? "Subscribed" : (
                <>Subscribe <Send size={16} fill="currentColor" /></>
              )}
            </button>
          </motion.form>
        </div>

        {/* ================= MAIN FOOTER CONTAINER ================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 p-8 md:p-12 lg:p-14 rounded-2xl lg:rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.2),inset_0_1px_rgba(255,255,255,0.05)] transition-transform duration-500 hover:-translate-y-1"
        >
          {/* Subtle Radial Gradient Glow inner */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl lg:rounded-3xl pointer-events-none" />

          {/* Column 1: Branding (Spans 4 columns on lg) */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-8 lg:pr-10 text-center md:text-left flex flex-col items-center md:items-start group/brand">
            <Link href="/" className="inline-block outline-none">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {/* Subtle logo glow that activates when hovering over the branding column */}
                  <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover/brand:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none" />
                  <Image
                    src={logoImage}
                    alt="OnWay"
                    width={52}
                    height={52}
                    className="drop-shadow-xl object-contain transition-transform duration-500 group-hover/brand:scale-105 relative z-10"
                  />
                </div>
                <span className="text-3xl font-extrabold text-white tracking-tight">OnWay</span>
              </div>
            </Link>

            <p className="text-[#A0AEC0] text-sm/relaxed lg:text-base/relaxed max-w-[280px] font-medium mx-auto md:mx-0">
              Smart mobility platform engineered for fast, safe, and seamless everyday rides.
            </p>

            <div className="flex items-center justify-center md:justify-start gap-4">
              {[Facebook, XIcon, Instagram, Linkedin].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#A0AEC0] hover:text-white transition-all duration-300 hover:bg-[#22c55e]/20 hover:border-[#22c55e]/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] group relative overflow-hidden"
                >
                  <Icon className="w-[20px] h-[20px] relative z-10 transition-transform duration-300" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-black text-xl mb-4 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-8 h-0.75 bg-[#22c55e] rounded-full" />
            </h4>
            <div className="h-0.5 w-full bg-white/5 mt-1 mb-8" />
            <ul className="space-y-4">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="flex items-center gap-2 group text-[#A0AEC0] text-sm font-bold hover:text-[#22c55e] transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-[#22c55e] transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Our Services */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-black text-xl mb-4 relative inline-block">
              Our Services
              <span className="absolute -bottom-2 left-0 w-8 h-0.75 bg-[#22c55e] rounded-full" />
            </h4>
            <div className="h-0.5 w-full bg-white/5 mt-1 mb-8" />
            <ul className="space-y-4">
              {serviceLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="flex items-center gap-2 group text-[#A0AEC0] text-sm font-bold hover:text-[#22c55e] transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-[#22c55e] transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Opening Hours */}
          <motion.div variants={itemVariants} className="space-y-10">
            <div>
              <h4 className="text-white font-black text-xl mb-4 relative inline-block">
                Opening Hours
                <span className="absolute -bottom-2 left-0 w-8 h-0.75 bg-[#22c55e] rounded-full" />
              </h4>
              <div className="h-0.5 w-full bg-white/5 mt-1 mb-8" />
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[#A0AEC0] text-sm font-bold">
                  <span>Week Days</span>
                  <span className="text-white/80 tracking-tighter">09.00 - 7.00</span>
                </div>
                <div className="flex items-center justify-between text-[#A0AEC0] text-sm font-bold border-t border-white/5 pt-4">
                  <span>Saturday</span>
                  <span className="text-white/80 tracking-tighter">08.00 - 4.00</span>
                </div>
                <div className="flex items-center justify-between text-[#A0AEC0] text-sm font-bold border-t border-white/5 pt-4">
                  <span>Friday</span>
                  <span className="text-white/80">Day Off</span>
                </div>
              </div>
            </div>

          </motion.div>
        </motion.div>

        {/* ================= COPYRIGHT ROW ================= */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4 pt-8 border-t border-white/10 text-[#A0AEC0] text-sm font-medium">
          <p>© {new Date().getFullYear()} OnWay. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</Link>
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <Link href="#" className="hover:text-white transition-colors duration-300">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}