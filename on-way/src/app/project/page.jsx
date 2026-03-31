"use client";

import { motion } from "framer-motion";
import { Layers, Cpu, Globe2, Terminal, GitBranch, Shield, Smartphone, Code2, ArrowRight } from "lucide-react";
import Link from "next/link";
import PageBanner from "../components/PageBanner";

const FLOW = [
  { label: "Passenger",    desc: "Opens app, sets pickup & destination" },
  { label: "Matching",     desc: "AI matches nearest verified driver" },
  { label: "Live Ride",    desc: "Socket.io streams real-time location" },
  { label: "Payment",      desc: "Secure transaction processed" },
  { label: "Review",       desc: "Both parties rate the experience" },
];

const FEATURES = [
  { icon: Layers,     title: "Full-Stack",       desc: "Next.js 16 + Node.js + Express + MongoDB" },
  { icon: Cpu,        title: "AI Verification",  desc: "face-api.js for driver face recognition" },
  { icon: Globe2,     title: "Real-Time",        desc: "Socket.io live GPS tracking" },
  { icon: Shield,     title: "Safety Systems",   desc: "SOS, monitoring, background checks" },
  { icon: Smartphone, title: "Responsive",       desc: "Mobile-first across all devices" },
  { icon: Code2,      title: "Clean Code",       desc: "Modular, scalable architecture" },
];

const TECH = [
  { cat: "Frontend",  items: ["Next.js 16", "React 19", "Tailwind CSS 4", "Framer Motion"] },
  { cat: "Backend",   items: ["Node.js", "Express.js", "MongoDB", "Mongoose"] },
  { cat: "Real-Time", items: ["Socket.io", "WebSockets", "Live GPS"] },
  { cat: "Services",  items: ["Cloudinary", "Nodemailer", "face-api.js", "JWT"] },
];

export default function ProjectPage() {
  return (
    <main className="bg-[#f4f6f9] min-h-screen">
      <PageBanner
        tag="About the Project"
        title="The OnWay System"
        subtitle="A full-stack ride-sharing platform built from the ground up by the DevVibe team — designed for Bangladesh's urban mobility."
      />

      {/* System flow */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-2">System Flow</p>
          <h2 className="text-4xl font-black text-[#011421] tracking-tight">How a ride works end-to-end</h2>
        </motion.div>

        {/* Horizontal flow */}
        <div className="flex flex-col md:flex-row items-stretch gap-0">
          {FLOW.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex-1 flex flex-col md:flex-row items-center"
            >
              <div className="flex-1 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-8 h-8 rounded-full bg-[#2FCA71]/10 text-[#2FCA71] text-xs font-black flex items-center justify-center mx-auto mb-3">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className="font-black text-[#011421] text-sm mb-1">{step.label}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
              </div>
              {i < FLOW.length - 1 && (
                <div className="w-px h-6 md:h-px md:w-6 bg-[#2FCA71]/30 shrink-0 mx-1" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features + Tech stack */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Features */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-2">Core Features</p>
              <h2 className="text-3xl font-black text-[#011421] tracking-tight">What makes OnWay different</h2>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#2FCA71]/10 flex items-center justify-center mb-3">
                    <f.icon className="w-4 h-4 text-[#2FCA71]" />
                  </div>
                  <p className="font-black text-[#011421] text-sm mb-1">{f.title}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tech stack dark card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative p-8 rounded-[2rem] bg-[#011421] overflow-hidden sticky top-24"
          >
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#2FCA71]/10 blur-[60px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-2 mb-6">
              <Terminal className="w-4 h-4 text-[#2FCA71]" />
              <span className="text-[11px] font-black text-[#2FCA71] uppercase tracking-widest">Tech Stack</span>
            </div>
            {TECH.map((g) => (
              <div key={g.cat} className="mb-5">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{g.cat}</p>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <span key={item} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-gray-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2.5rem] bg-[#011421] p-10 md:p-14 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#2FCA71]/8 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mb-2">Want to meet the team?</h3>
            <p className="text-gray-400 text-sm">Five developers. One shared vision.</p>
          </div>
          <div className="relative z-10 flex gap-3 flex-wrap">
            <Link href="/developers" className="inline-flex items-center gap-2 bg-[#2FCA71] text-[#011421] font-black text-sm uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-[#26b861] transition-colors">
              <GitBranch className="w-4 h-4" /> Meet DevVibe
            </Link>
            <Link href="/earn-with-onway" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-white/10 transition-colors">
              Join OnWay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
