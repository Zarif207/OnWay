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
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const XIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  return (
    <footer
      className="relative w-full overflow-hidden bg-fixed bg-cover bg-center border-t border-white/5"
      style={{ backgroundImage: "url('/footer-1.jpg')" }}
    >
      <Toaster />

      {/* Heavy Dark Overlays */}
      <div className="absolute inset-0 bg-[#0A1F3D]/95 z-0" />
      <div className="absolute inset-0 bg-linear-to-b from-[#0A1F3D]/50 via-transparent to-[#050B1A] z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 pb-10">

        {/* ================= NEWSLETTER SECTION ================= */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-20 px-4">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-white text-4xl sm:text-5xl font-black tracking-tighter"
          >
            Subscribe Our <br /> Newsletter
          </motion.h2>

          <motion.form
            onSubmit={handleSubscribe}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className={`flex w-full lg:w-125 h-16 bg-white/5 backdrop-blur-md rounded-full border border-white/10 p-1 pl-8 transition-all ${isSubscribed && !email ? 'opacity-60 grayscale' : ''}`}
          >
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
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 p-12 md:p-20 rounded-[4rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.3)]"
        >
          {/* Column 1: Branding */}
          <motion.div variants={itemVariants} className="space-y-10">
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <div className="flex items-center gap-1">
                  <Image src={logoImage} alt="OnWay" width={110} height={80} className="drop-shadow-lg" />
                  <div className="flex flex-col -ml-3 mt-4">
                    <span className="text-2xl font-black text-white leading-none tracking-tighter">OnWay</span>
                    <span className="text-[8px] font-black text-[#22c55e] uppercase tracking-[0.2em]">One Track Express</span>
                  </div>
                </div>
              </Link>
            </div>
            <p className="text-[#A0AEC0] text-sm font-medium leading-[1.8] max-w-70">
              Our dedication lies in embracing challenges and pioneering innovation within the mobility sector, delivering premium experiences.
            </p>
            <div className="flex items-center gap-3">
              {[Facebook, XIcon, Instagram, Linkedin].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -5, backgroundColor: '#22c55e', borderColor: '#22c55e' }}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
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
              {["About Us", "Our Services", "Project", "FAQ's", "Our Blog", "Contact Us"].map((link) => (
                <li key={link}>
                  <Link href="#" className="flex items-center gap-2 group text-[#A0AEC0] text-sm font-bold hover:text-[#22c55e] transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-[#22c55e] transition-colors" />
                    {link}
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
              {["OnWay Ride Share", "Premium Car Rent", "OnWay CNG Rapid", "Executive Travel", "OnWay Pay Secure", "Air Freight Tracking"].map((service) => (
                <li key={service}>
                  <Link href="#" className="flex items-center gap-2 group text-[#A0AEC0] text-sm font-bold hover:text-[#22c55e] transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-[#22c55e] transition-colors" />
                    {service}
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
                  <span className="text-white/80 tracking-tighter">08.00 - 2.00</span>
                </div>
                <div className="flex items-center justify-between text-[#A0AEC0] text-sm font-bold border-t border-white/5 pt-4">
                  <span>Sunday</span>
                  <span className="text-white/80">Day Off</span>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white text-[#0A1F3D] py-4 rounded-full font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-[#22c55e] hover:text-white transition-all duration-300"
            >
              Contact Us
            </motion.button>
          </motion.div>
        </motion.div>

        {/* ================= COPYRIGHT ROW ================= */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4 text-[#A0AEC0]/60 text-xs font-bold uppercase tracking-widest">
          <p>Copyright © {new Date().getFullYear()} <span className="text-[#22c55e]">OnWay</span> All Rights Reserved.</p>
          <div className="flex items-center gap-8">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-white/10">|</span>
            <Link href="#" className="hover:text-white transition-colors">Terms & Condition</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}