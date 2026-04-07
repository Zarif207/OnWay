"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Code2, ArrowRight,
  Terminal, Layers, Cpu, Globe2
} from "lucide-react";
import Link from "next/link";
import DeveloperCard from "./_components/DeveloperCard";

// ─── Team Data ────────────────────────────────────────────────────────────────
const DEVELOPERS = [
  {
    name: "Zubaear Hasan",
    role: "Frontend Developer",
    isLeader: true,
    avatar: "/Devs/JUBAEAR.jpeg",
    socials: {
      github:    "https://github.com/Xubaear",
      linkedin:  "https://www.linkedin.com/in/zubaear/",
      facebook:  "https://www.facebook.com/share/1P7KbH4qBa/",
      portfolio: "https://xubaears-portfolio.netlify.app/",
    },
  },
  {
    name: "Minhaj Islam",
    role: "Fullstack Developer",
    isCoLeader: true,
    avatar: "/Devs/MINHAJ.jpeg",
    socials: {
      github:    "https://github.com/minhaj-net",
      linkedin:  "https://www.linkedin.com/in/minhaj-net/",
      facebook:  "https://www.facebook.com/x.misuk",
      portfolio: "https://minhaj-dev-xi.vercel.app/",
    },
  },
  {
    name: "Zarif Hasan",
    role: "System Developer",
    avatar: "/Devs/ZARIF.jpg",
    socials: {
      github:    "https://github.com/Zarif207",
      linkedin:  "https://www.linkedin.com/in/zarif-hasan5/",
      facebook:  "https://www.facebook.com/zarif.hasan.5059",
      portfolio: "https://zarif-hasan.netlify.app/",
    },
  },
  {
    name: "Shourov Hasan",
    role: "MERN Stack Developer",
    avatar: "/Devs/SHOUROV.jpg",
    socials: {
      github:    "https://github.com/shouravhasanshurjo8201",
      linkedin:  "https://www.linkedin.com/in/shourav-hasan-22b948396/",
      facebook:  "https://web.facebook.com/profile.php?id=100080296736228",
      portfolio: "https://portfolio-shourav-hasan.netlify.app/",
    },
  },
  {
    name: "Istheak Ahmed",
    role: "Frontend Developer",
    avatar: "/Devs/ISTHIAK.jpeg",
    socials: {
      github:    "https://github.com/Istheaksayem",
      linkedin:  "https://www.linkedin.com/in/istheak-ahmed-557471392",
      facebook:  "https://www.facebook.com/share/1AxPHcdWri/",
      portfolio: "https://shiny-meerkat-dd94be.netlify.app",
    },
  },
];

const TECH_STACK = [
  "Next.js", "React", "Node.js", "Express",
  "MongoDB", "Socket.io", "Tailwind CSS", "Framer Motion",
];

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

export default function DevelopersPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <main className="min-h-screen bg-[#f4f6f9] overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#060d18]">

        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay z-10"
          style={{ backgroundImage: GRAIN_SVG, backgroundSize: "200px 200px" }}
        />

        {/* Animated gradient mesh */}
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-[#2FCA71]/10 blur-[130px]"
          />
          <motion.div
            animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 6 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/6 blur-[100px]"
          />
        </div>

        {/* Grid lines */}
        <div
          className="absolute inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Top border line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FCA71]/40 to-transparent z-10" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        >
          {/* Eyebrow badge
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-10"
          >
            <span className="w-2 h-2 rounded-full bg-[#2FCA71] animate-pulse" />
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">OnWay · DevVibe Team</span>
            <Sparkles className="w-3.5 h-3.5 text-[#2FCA71]" />
          </motion.div> */}

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8"
          >
            Meet the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2FCA71] via-emerald-400 to-teal-300">
              DevVibe
            </span>
            <br />
            <span className="text-white/90">Team</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-14"
          >
            Five developers. One shared vision. Building the future of urban
            mobility in Bangladesh — one commit at a time.
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="inline-flex items-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden mb-14"
          >
            {[
              { value: "5", label: "Developers" },
              { value: "1", label: "Vision" },
              { value: "∞", label: "Passion" },
            ].map(({ value, label }, i) => (
              <div
                key={label}
                className={`px-10 py-5 text-center ${i !== 2 ? "border-r border-white/10" : ""}`}
              >
                <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* Tech stack pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {TECH_STACK.map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-gray-400 hover:text-white hover:border-[#2FCA71]/40 hover:bg-[#2FCA71]/5 transition-all duration-200 cursor-default"
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 w-full z-10">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 80L1440 80L1440 30C1200 75 960 5 720 30C480 55 240 5 0 30L0 80Z" fill="#f4f6f9" />
          </svg>
        </div>
      </section>

      {/* ── CARDS SECTION ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14"
        >
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-2">Core Team</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#011421] tracking-tight leading-tight">
              The people who<br />built OnWay
            </h2>
          </div>
          <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
            A passionate team of student developers from Bangladesh, united by code and creativity.
          </p>
        </motion.div>

        {/* Row 1 — Leader + Co-Leader, centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-6">
          {DEVELOPERS.slice(0, 2).map((dev, i) => (
            <DeveloperCard key={dev.name} developer={dev} index={i} />
          ))}
        </div>

        {/* Row 2 — Remaining 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEVELOPERS.slice(2).map((dev, i) => (
            <DeveloperCard key={dev.name} developer={dev} index={i + 2} />
          ))}
        </div>
      </section>

      {/* ── ABOUT THE PROJECT ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[2.5rem] bg-[#011421] overflow-hidden p-10 md:p-16"
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#2FCA71]/8 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-600/8 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2FCA71]/10 border border-[#2FCA71]/20 mb-6">
                <Terminal className="w-3.5 h-3.5 text-[#2FCA71]" />
                <span className="text-[11px] font-black text-[#2FCA71] uppercase tracking-widest">About the Project</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-5">
                Built with passion,<br />shipped with purpose.
              </h3>
              <p className="text-gray-400 text-base leading-relaxed mb-8">
                OnWay is a full-stack ride-sharing platform built entirely by the DevVibe team.
                From real-time socket tracking to AI face verification — every feature was
                designed, developed, and deployed by these five developers.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2FCA71] text-white font-black text-sm hover:bg-[#26b861] transition-colors shadow-lg shadow-[#2FCA71]/20"
              >
                Explore OnWay
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Layers, label: "Full-Stack",  desc: "Next.js + Node.js + MongoDB" },
                { icon: Cpu,    label: "AI Powered",  desc: "Face verification with face-api.js" },
                { icon: Globe2, label: "Real-Time",   desc: "Socket.io live ride tracking" },
                { icon: Code2,  label: "Clean Code",  desc: "Modular, scalable architecture" },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="p-5 rounded-2xl bg-white/5 border border-white/8 hover:border-[#2FCA71]/30 hover:bg-[#2FCA71]/5 transition-all duration-300 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#2FCA71]/10 flex items-center justify-center mb-3 group-hover:bg-[#2FCA71]/20 transition-colors">
                    <Icon className="w-4 h-4 text-[#2FCA71]" />
                  </div>
                  <p className="text-sm font-black text-white mb-1">{label}</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

    </main>
  );
}
