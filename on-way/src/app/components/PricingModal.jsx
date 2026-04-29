"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, CreditCard, Smartphone, Loader2, CheckCircle2, ChevronRight } from "lucide-react";

// ─── Confetti burst ────────────────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ["#2FCA71", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"][Math.floor(Math.random() * 5)],
    size: 6 + Math.random() * 6,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -10, x: `${p.x}%`, opacity: 1, rotate: 0 }}
          animate={{ y: "110%", opacity: 0, rotate: 360 }}
          transition={{ duration: 1.4 + Math.random(), delay: p.delay, ease: "easeIn" }}
          style={{ width: p.size, height: p.size, background: p.color, borderRadius: 2 }}
          className="absolute top-0"
        />
      ))}
    </div>
  );
}

// ─── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Plan", "Details", "Payment"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                done ? "bg-[#2FCA71] text-white" : active ? "bg-[#011421] text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {done ? <Check className="w-4 h-4" /> : idx}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${active ? "text-[#011421]" : "text-gray-400"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-4 transition-colors duration-300 ${done ? "bg-[#2FCA71]" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main modal ────────────────────────────────────────────────────────────────
export default function PricingModal({ plan, onClose }) {
  const [step, setStep] = useState(1);          // 1=plan, 2=details, 3=payment, 4=success
  const [method, setMethod] = useState("bkash");
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", txn: "", card: "", expiry: "", cvv: "" });

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const step2Valid = form.name.trim() && form.phone.trim() && form.email.trim();
  const step3Valid =
    (method === "bkash" || method === "nagad") ? form.txn.trim() :
    form.card.trim() && form.expiry.trim() && form.cvv.trim();

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(4);
      setShowConfetti(true);
    }, 1800);
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
        >
          {showConfetti && <Confetti />}

          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-7 pb-0">
            <div>
              <p className="text-[10px] font-black text-[#2FCA71] uppercase tracking-[0.2em]">OnWay Plans</p>
              <h2 className="text-xl font-black text-[#011421]">
                {step === 4 ? "Payment Successful" : "Complete Your Order"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="px-7 py-6">
            {/* ── Step bar (steps 1-3) ── */}
            {step < 4 && <StepBar step={step} />}

            <AnimatePresence mode="wait">

              {/* ── STEP 1: Plan summary ── */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <div className="p-5 rounded-2xl bg-[#011421] mb-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#2FCA71]/10 blur-[40px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-[#2FCA71] uppercase tracking-widest mb-1">{plan.name} Plan</p>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-4xl font-black text-white">{plan.price}</span>
                        <span className="text-gray-400 text-sm">{plan.period}</span>
                      </div>
                      <ul className="space-y-2">
                        {plan.features.filter((f) => f.included).map((f) => (
                          <li key={f.text} className="flex items-center gap-2 text-xs text-gray-300">
                            <Check className="w-3.5 h-3.5 text-[#2FCA71] shrink-0" /> {f.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-[#2FCA71] text-white font-black text-sm uppercase tracking-widest py-4 rounded-2xl hover:bg-[#26b861] transition-colors flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* ── STEP 2: Personal details ── */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-4">
                  {[
                    { key: "name",  label: "Full Name",    type: "text",  placeholder: "Your full name" },
                    { key: "phone", label: "Phone Number", type: "tel",   placeholder: "+880 1XXX-XXXXXX" },
                    { key: "email", label: "Email Address",type: "email", placeholder: "you@example.com" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={(e) => set(f.key, e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-[#011421] placeholder-gray-400 outline-none focus:border-[#2FCA71] focus:ring-2 focus:ring-[#2FCA71]/20 transition-all"
                      />
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-sm font-black text-gray-500 hover:bg-gray-50 transition-colors">Back</button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!step2Valid}
                      className="flex-1 py-3.5 rounded-2xl bg-[#2FCA71] text-white font-black text-sm uppercase tracking-widest hover:bg-[#26b861] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Payment ── */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-5">
                  {/* Method selector */}
                  <div>
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-3">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "bkash",  label: "bKash",  color: "bg-pink-50 border-pink-200 text-pink-600" },
                        { key: "nagad",  label: "Nagad",  color: "bg-orange-50 border-orange-200 text-orange-600" },
                        { key: "card",   label: "Card",   color: "bg-blue-50 border-blue-200 text-blue-600" },
                      ].map((m) => (
                        <button
                          key={m.key}
                          onClick={() => setMethod(m.key)}
                          className={`py-3 rounded-2xl border-2 text-xs font-black uppercase tracking-wider transition-all ${
                            method === m.key ? m.color + " scale-105 shadow-sm" : "border-gray-200 text-gray-400 hover:border-gray-300"
                          }`}
                        >
                          {m.key === "card" ? <CreditCard className="w-4 h-4 mx-auto mb-0.5" /> : <Smartphone className="w-4 h-4 mx-auto mb-0.5" />}
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* bKash / Nagad */}
                  {(method === "bkash" || method === "nagad") && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className="p-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Send money to</p>
                        <p className="text-xl font-black text-[#011421]">01712-345678</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {method === "bkash" ? "bKash Personal" : "Nagad Personal"} · Reference: {plan.name.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Transaction ID</label>
                        <input
                          type="text"
                          placeholder="e.g. TXN8F2K9X1"
                          value={form.txn}
                          onChange={(e) => set("txn", e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-[#011421] placeholder-gray-400 outline-none focus:border-[#2FCA71] focus:ring-2 focus:ring-[#2FCA71]/20 transition-all"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Card */}
                  {method === "card" && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div>
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          value={form.card}
                          onChange={(e) => set("card", e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-[#011421] placeholder-gray-400 outline-none focus:border-[#2FCA71] focus:ring-2 focus:ring-[#2FCA71]/20 transition-all font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Expiry</label>
                          <input
                            type="text"
                            placeholder="MM / YY"
                            maxLength={7}
                            value={form.expiry}
                            onChange={(e) => set("expiry", e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-[#011421] placeholder-gray-400 outline-none focus:border-[#2FCA71] focus:ring-2 focus:ring-[#2FCA71]/20 transition-all font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">CVV</label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={4}
                            value={form.cvv}
                            onChange={(e) => set("cvv", e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-[#011421] placeholder-gray-400 outline-none focus:border-[#2FCA71] focus:ring-2 focus:ring-[#2FCA71]/20 transition-all font-mono"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Order summary strip */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#2FCA71]/5 border border-[#2FCA71]/20">
                    <span className="text-xs font-black text-gray-500">{plan.name} Plan</span>
                    <span className="text-sm font-black text-[#2FCA71]">{plan.price}{plan.period}</span>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-sm font-black text-gray-500 hover:bg-gray-50 transition-colors">Back</button>
                    <button
                      onClick={handleConfirm}
                      disabled={!step3Valid || loading}
                      className="flex-1 py-3.5 rounded-2xl bg-[#011421] text-white font-black text-sm uppercase tracking-widest hover:bg-[#2FCA71] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : "Confirm Payment"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 4: Success ── */}
              {step === 4 && (
                <motion.div
                  key="s4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-[#2FCA71]/10 flex items-center justify-center mx-auto mb-5"
                  >
                    <CheckCircle2 className="w-10 h-10 text-[#2FCA71]" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-[#011421] mb-2">Payment Successful!</h3>
                  <p className="text-gray-400 text-sm mb-1">Your <span className="font-black text-[#011421]">{plan.name}</span> plan has been activated.</p>
                  <p className="text-gray-400 text-sm mb-8">A confirmation has been sent to <span className="font-black text-[#011421]">{form.email || "your email"}</span>.</p>
                  <button
                    onClick={onClose}
                    className="w-full bg-[#2FCA71] text-white font-black text-sm uppercase tracking-widest py-4 rounded-2xl hover:bg-[#26b861] transition-colors"
                  >
                    Continue
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
