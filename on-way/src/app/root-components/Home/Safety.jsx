"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, PhoneCall, ArrowRight, ShieldCheck, Download, X, CheckCircle2, Rocket } from "lucide-react";
import Container from "./Container";
import { safetyFeatures } from "./homeData";
import AnimatedButton from "../AnimatedButton";
import { useRouter } from "next/navigation";

import { StaggerContainer, AnimatedHeading, AnimatedCard } from "../MotionWrappers";

/**
 * Safety Component (V2)
 * Premium "2026 Tech Product" design with high-end glassmorphism and motion.
 */
export default function Safety() {
  const router = useRouter();
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [appModalOpen, setAppModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSupportModalOpen(false);
        setAppModalOpen(false);
      }
    };
    if (supportModalOpen || appModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [supportModalOpen, appModalOpen]);

  return (
    <section id="safety" className="bg-[#F8FAFC] py-24 sm:py-32 overflow-hidden relative">
      <Container>
        {/* Top Grid: Content + Feature Cards */}
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center mb-16">
          {/* Left: Content and Actions + Image */}
          <div className="lg:col-span-6 flex flex-col gap-12 lg:gap-16">
            <AnimatedHeading>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A1F3D] leading-[1.1]">
                Safety and support <br />
                <span className="bg-gradient-to-r from-[#2FCA71] to-[#259461] bg-clip-text text-transparent">built into every trip.</span>
              </h2>
              <p className="mt-6 text-lg text-[#0A1F3D]/60 leading-relaxed max-w-md">
                OnWay pairs smart safety features with responsive support
                so you can ride and travel with absolute confidence.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <AnimatedButton onClick={() => setSupportModalOpen(true)}>
                  Talk to Support
                  <PhoneCall className="w-4 h-4" />
                </AnimatedButton>
                <AnimatedButton onClick={() => setAppModalOpen(true)}>
                  Download App
                  <ArrowRight className="w-4 h-4" />
                </AnimatedButton>
              </div>
            </AnimatedHeading>

            {/* Safety Image - Desktop/Mobile Responsive */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full aspect-video rounded-3xl overflow-hidden border border-gray-100/50"
            >
              <Image
                src="/safety-2.jpg"
                alt="OnWay Safety Features"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </div>

          {/* Right: Feature Cards */}
          <StaggerContainer className="lg:col-span-6 flex flex-col gap-4">
            {safetyFeatures.map((f, idx) => (
              <FeatureCard key={f.title} feature={f} index={idx} />
            ))}
          </StaggerContainer>
        </div>

        {/* Bottom: Full-width SOS Card */}
        <AnimatedHeading>
          <motion.div
            whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(34, 197, 94, 0.1)" }}
            className="relative overflow-hidden rounded-[2.5rem] border border-[#22c55e]/10 bg-white/70 backdrop-blur-xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] group"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#22c55e]/5 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-[#22c55e]/10 transition-colors duration-700" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 md:justify-between">
              <div className="flex items-start md:items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] flex-shrink-0 animate-pulse">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#0A1F3D] tracking-tight mb-2 uppercase">
                    Emergency-Ready Tools
                  </h3>
                  <p className="text-[#0A1F3D]/60 max-w-xl leading-relaxed">
                    Use in-app SOS tools to quickly reach help and share your location
                    with trusted contacts. One tap for total peace of mind.
                  </p>
                </div>
              </div>
              <AnimatedButton onClick={() => router.push("/sos")}>
                About SOS
              </AnimatedButton>
            </div>
          </motion.div>
        </AnimatedHeading>
      </Container>

      {/* Support Modal */}
      <AnimatePresence>
        {supportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => setSupportModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 z-10"
            >
              <button
                onClick={() => setSupportModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-[#0A1F3D]">Instant Support Activation</h3>
              </div>

              <div className="space-y-4 text-gray-600">
                <p>When a passenger presses the <strong>SOS button</strong>, our system automatically triggers a high-priority alert sequence.</p>
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>A missed call is sent directly to our 24/7 support agents.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>The support team immediately identifies the user and accesses their exact live location.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Experience faster, automated response times without the need to dial manually.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSupportModalOpen(false)}
                  className="bg-gray-100 text-[#0A1F3D] px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* App Coming Soon Modal */}
      <AnimatePresence>
        {appModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-[#0A1F3D]/60 backdrop-blur-xl"
              onClick={() => setAppModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 z-10 text-center overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />

              <button
                onClick={() => setAppModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-20"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-blue-50">
                  <Rocket className="w-10 h-10" />
                </div>

                <h3 className="text-3xl font-black text-[#0A1F3D] mb-3">App Coming Soon 🚀</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  The completely revamped OnWay mobile app is currently under development. Our engineers are actively crafting the ultimate ride experience, and it will be available in the coming months!
                </p>

                <button
                  onClick={() => setAppModalOpen(false)}
                  className="w-full bg-[#0A1F3D] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#112F5A] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  Stay Tuned
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function FeatureCard({ feature, index }) {
  const Icon = feature.icon || ShieldCheck;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 }
      }}
      whileHover={{ scale: 1.01 }}
      className="group flex items-center gap-6 p-6 md:p-8 rounded-[2rem] bg-white border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:bg-green-50 hover:border-green-200 transition-all duration-300 cursor-pointer"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#f8fafc] group-hover:bg-white flex items-center justify-center text-[#0A1F3D]/30 group-hover:text-[#22c55e] transition-all duration-300 shadow-sm border border-transparent group-hover:border-green-100">
        <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </div>
      <div>
        <h4 className="text-lg font-black text-[#0A1F3D] tracking-tight leading-tight uppercase mb-1">
          {feature.title}
        </h4>
        <p className="text-sm text-[#0A1F3D]/60 leading-relaxed font-medium">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}
