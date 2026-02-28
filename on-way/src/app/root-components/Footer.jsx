"use client";

import Image from "next/image";
import logoImage from "../../../public/icon2.png";
import Link from "next/link";
import { Twitter, Instagram, Facebook, Youtube, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  // Staggered container animation for the links grid
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <footer className="bg-[#001820] text-zinc-300 overflow-hidden relative border-t-3 border-[#2FCA71] shadow-[inset_0_40px_80px_rgba(0,0,0,0.5)]">
      {/* Background subtle glowing orb for 3D depth */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2FCA71]/10 rounded-full blur-[120px] pointer-events-none transform -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none transform translate-y-1/3 -translate-x-1/4" />

      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://i.ibb.co/fzFZnkkH/7263163c0bf80eb3fade3c80e145d6d1.jpg')] bg-cover bg-center opacity-5 mix-blend-overlay" />

      <div className="mx-auto max-w-7xl px-8 py-16 sm:px-6 lg:px-8 relative z-10">

        {/* Animated Grid Container */}
        <motion.div
          className="grid gap-12 lg:grid-cols-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >

          {/* Brand & App Downloads */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              {/* 3D Hover Scale on Logo */}
              <motion.div whileHover={{ scale: 1.05, rotateZ: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                <Image src={logoImage} alt="OnWay" width={140} height={110} className="drop-shadow-[0_10px_15px_rgba(47,202,113,0.3)]" />
              </motion.div>
            </Link>

            <p className="text-sm leading-relaxed text-zinc-400 max-w-sm">
              OnWay is your everyday mobility super app — ride, car, CNG, and
              secure payments in one seamless, rapid experience.
            </p>

            <div className="flex flex-wrap gap-2 text-xs font-bold tracking-wider text-zinc-200 uppercase">
              <span className="rounded-full bg-[#2FCA71]/10 text-[#2FCA71] border border-[#2FCA71]/30 px-3 py-1 shadow-sm backdrop-blur-md">
                Rides
              </span>
              <span className="rounded-full bg-[#2FCA71]/10 text-[#2FCA71] border border-[#2FCA71]/30 px-3 py-1 shadow-sm backdrop-blur-md">
                CNG
              </span>
              <span className="rounded-full bg-[#2FCA71]/10 text-[#2FCA71] border border-[#2FCA71]/30 px-3 py-1 shadow-sm backdrop-blur-md">
                Pay
              </span>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <p className="text-sm font-semibold text-white">Get the app</p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-[#2FCA71] hover:text-[#001820] transition-colors border border-white/10 hover:border-[#2FCA71] px-4 py-2 text-sm text-white font-medium shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(47,202,113,0.23)] backdrop-blur-sm"
                >
                  <Smartphone className="w-5 h-5" />
                  App Store
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-[#2FCA71] hover:text-[#001820] transition-colors border border-white/10 hover:border-[#2FCA71] px-4 py-2 text-sm text-white font-medium shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(47,202,113,0.23)] backdrop-blur-sm"
                >
                  <Smartphone className="w-5 h-5" />
                  Google Play
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Links: Platform */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="text-white font-bold mb-6 text-lg tracking-wide relative inline-block">
              Platform
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-[#2FCA71] rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              {[
                { name: "OnWay Ride", href: "#services" },
                { name: "OnWay Car", href: "#services" },
                { name: "OnWay CNG", href: "#services" },
                { name: "OnWay Pay", href: "#services" },
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="group inline-flex items-center text-zinc-400 hover:text-[#2FCA71] transition-all">
                    <span className="w-0 h-0.5 bg-[#2FCA71] mr-0 transition-all duration-300 group-hover:w-2 group-hover:mr-2"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Links: Earn */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="text-white font-bold mb-6 text-lg tracking-wide relative inline-block">
              Earn
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-[#2FCA71] rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              {[
                { name: "Become a Rider", href: "#earn" },
                { name: "Become a Driver", href: "#earn" },
                { name: "Become a CNG Driver", href: "#earn" },
                { name: "Press", href: "#press" },
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="group inline-flex items-center text-zinc-400 hover:text-[#2FCA71] transition-all">
                    <span className="w-0 h-0.5 bg-[#2FCA71] mr-0 transition-all duration-300 group-hover:w-2 group-hover:mr-2"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Links: Help */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="text-white font-bold mb-6 text-lg tracking-wide relative inline-block">
              Help
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-[#2FCA71] rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              {[
                { name: "Send a message", href: "#contact" },
                { name: "Safety", href: "#safety" },
                { name: "Download app", href: "#download" },
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="group inline-flex items-center text-zinc-400 hover:text-[#2FCA71] transition-all">
                    <span className="w-0 h-0.5 bg-[#2FCA71] mr-0 transition-all duration-300 group-hover:w-2 group-hover:mr-2"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Links: Company */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="text-white font-bold mb-6 text-lg tracking-wide relative inline-block">
              Company
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-[#2FCA71] rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link href="/" className="group inline-flex items-center text-zinc-400 hover:text-[#2FCA71] transition-all">
                  <span className="w-0 h-0.5 bg-[#2FCA71] mr-0 transition-all duration-300 group-hover:w-2 group-hover:mr-2"></span>
                  About OnWay
                </Link>
              </li>
              <li>
                <a href="#press" className="group inline-flex items-center text-zinc-400 hover:text-[#2FCA71] transition-all">
                  <span className="w-0 h-0.5 bg-[#2FCA71] mr-0 transition-all duration-300 group-hover:w-2 group-hover:mr-2"></span>
                  Press
                </a>
              </li>
              <li>
                <a href="#blog" className="group inline-flex items-center text-zinc-400 hover:text-[#2FCA71] transition-all">
                  <span className="w-0 h-0.5 bg-[#2FCA71] mr-0 transition-all duration-300 group-hover:w-2 group-hover:mr-2"></span>
                  Blog
                </a>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Bar Container w/ Glassmorphism */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 text-sm sm:flex-row sm:px-6 lg:px-8">

          <div className="flex flex-wrap justify-center gap-6 text-zinc-400 font-medium">
            <Link href="/terms" className="hover:text-[#2FCA71] hover:-translate-y-0.5 inline-block transition-all">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#2FCA71] hover:-translate-y-0.5 inline-block transition-all">
              Privacy
            </Link>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <span>Region: Global</span>
          </div>

          <p className="text-zinc-500 font-medium text-center">
            © {new Date().getFullYear()} OnWay. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ scale: 1.2, rotate: 5, y: -4, color: '#2FCA71' }}
                whileTap={{ scale: 0.9 }}
                className="text-zinc-400 transition-colors drop-shadow-lg"
              >
                <Icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>

        </div>
      </motion.div>
    </footer>
  );
}
