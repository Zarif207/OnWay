"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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

/**
 * Footer Component (Final V2)
 * Premium image background with glassmorphism layout and modern hover interactions.
 */
export default function Footer() {
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
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  return (
    <footer
      className="relative w-full overflow-hidden bg-cover bg-center border-t border-white/5 pb-10"
      // Added slight contrast/brightness filter to make image pop more
      style={{ backgroundImage: "url('/home-3.webp')", filter: "brightness(1.05) contrast(1.05)" }}
    >
      {/* ================= BACKGROUND OVERLAYS ================= */}
      {/* Smooth linear gradient replacing the heavy solid overlay: Right side is darker to keep text readable, Left side is lighter to show image */}
     <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/95 via-[#0B2A52]/80 to-[#1E3A8A]/55 z-0 pointer-events-none" />

      {/* Subtle bottom fade to seamlessly blend with the end of the page */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#030712] to-transparent z-0 pointer-events-none" />

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

          <motion.div
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
              placeholder="Enter your email address..."
              className="flex-1 min-w-0 bg-transparent text-white placeholder:text-white/60 outline-none text-sm font-medium pr-4 overflow-hidden text-ellipsis whitespace-nowrap"
            />
            <button className="h-full px-6 sm:px-8 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white text-sm font-bold tracking-wide rounded-full transition-all duration-300 shadow-[inset_0_1px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-[1.02] active:scale-95 flex-shrink-0 relative overflow-hidden group-hover:after:absolute group-hover:after:inset-0 group-hover:after:bg-white/10 group-hover:after:rounded-full">
              Subscribe
            </button>
          </motion.div>
        </div>

        {/* ================= MAIN FOOTER CONTAINER (Glassmorphism) ================= */}
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

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
            {/* Column 2: Product */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h4 className="text-white font-bold text-sm tracking-widest uppercase opacity-90">Product</h4>
              <ul className="space-y-4">
                {["Ride Booking", "Real-time Tracking", "Safety Features", "Pricing"].map((link) => (
                  <li key={link} className="flex justify-center sm:justify-start">
                    <Link href="#" className="flex w-fit items-center text-[#A0AEC0] text-sm font-medium hover:text-[#22c55e] transition-all duration-300 group outline-none relative hover:tracking-wide">
                      {link}
                      <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#22c55e] to-emerald-400 transition-all duration-300 group-hover:w-full rounded-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Column 3: Company */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h4 className="text-white font-bold text-sm tracking-widest uppercase opacity-90">Company</h4>
              <ul className="space-y-4">
                {["About Us", "Careers", "Blog", "Contact"].map((link) => (
                  <li key={link} className="flex justify-center sm:justify-start">
                    <Link href="#" className="flex w-fit items-center text-[#A0AEC0] text-sm font-medium hover:text-[#22c55e] transition-all duration-300 group outline-none relative hover:tracking-wide">
                      {link}
                      <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#22c55e] to-emerald-400 transition-all duration-300 group-hover:w-full rounded-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Column 4: Resources */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h4 className="text-white font-bold text-sm tracking-widest uppercase opacity-90">Resources</h4>
              <ul className="space-y-4">
                {["Help Center", "Documentation", "API Access", "Privacy"].map((link) => (
                  <li key={link} className="flex justify-center sm:justify-start">
                    <Link href="#" className="flex w-fit items-center text-[#A0AEC0] text-sm font-medium hover:text-[#22c55e] transition-all duration-300 group outline-none relative hover:tracking-wide">
                      {link}
                      <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#22c55e] to-emerald-400 transition-all duration-300 group-hover:w-full rounded-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Column 5: Platform */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h4 className="text-white font-bold text-sm tracking-widest uppercase opacity-90">Platform</h4>
              <ul className="space-y-4">
                {["Become a Rider", "Driver Dashboard", "Earnings", "Requirements"].map((link) => (
                  <li key={link} className="flex justify-center sm:justify-start">
                    <Link href="#" className="flex w-fit items-center text-[#A0AEC0] text-sm font-medium hover:text-[#22c55e] transition-all duration-300 group outline-none relative hover:tracking-wide">
                      {link}
                      <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#22c55e] to-emerald-400 transition-all duration-300 group-hover:w-full rounded-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

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
