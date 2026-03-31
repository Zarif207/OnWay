"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Car, User, Phone, Mail, FileText, CheckCircle, ArrowRight, Zap, Star, Shield } from "lucide-react";
import Link from "next/link";
import PageBanner from "../components/PageBanner";

const PERKS = [
  { icon: Zap,    title: "Flexible Hours",  desc: "Drive whenever you want. Full control over your schedule." },
  { icon: Star,   title: "Competitive Pay", desc: "Earn more per trip with transparent, fair commission rates." },
  { icon: Shield, title: "Full Insurance",  desc: "Every trip is covered under OnWay's safety insurance policy." },
  { icon: Car,    title: "Easy Onboarding", desc: "Simple registration. Start earning within 48 hours." },
];

const STEPS = [
  { num: "01", title: "Submit Application",     desc: "Fill out the form with your personal and vehicle details." },
  { num: "02", title: "Document Verification",  desc: "Upload your NID, driving license, and vehicle registration." },
  { num: "03", title: "Face Verification",      desc: "Complete our AI-powered face verification for security." },
  { num: "04", title: "Start Earning",          desc: "Get approved and start accepting rides immediately." },
];

export default function DriverRegisterPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", vehicle: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="bg-[#f4f6f9] min-h-screen">
      <PageBanner
        tag="Drive with OnWay"
        title="Driver Registration"
        subtitle="Join thousands of drivers earning on their own terms. Flexible hours, great pay, full support."
      />

      {/* Perks */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {PERKS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#2FCA71]/10 flex items-center justify-center mx-auto mb-4">
                <p.icon className="w-5 h-5 text-[#2FCA71]" />
              </div>
              <h3 className="font-black text-[#011421] mb-1">{p.title}</h3>
              <p className="text-gray-500 text-sm">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Steps + Form */}
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-3">How to Join</p>
            <h2 className="text-3xl font-black text-[#011421] mb-8">4 simple steps</h2>
            <div className="space-y-6">
              {STEPS.map((s) => (
                <div key={s.num} className="flex gap-4">
                  <span className="text-2xl font-black text-gray-200 leading-none w-10 shrink-0">{s.num}</span>
                  <div>
                    <h4 className="font-black text-[#011421] mb-0.5">{s.title}</h4>
                    <p className="text-gray-500 text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
            {submitted ? (
              <div className="p-10 rounded-2xl bg-white border border-gray-100 shadow-sm text-center">
                <CheckCircle className="w-14 h-14 text-[#2FCA71] mx-auto mb-4" />
                <h3 className="text-2xl font-black text-[#011421] mb-2">Application Received!</h3>
                <p className="text-gray-500 mb-6">We'll review your details and get back to you within 48 hours.</p>
                <Link href="/" className="inline-flex items-center gap-2 bg-[#2FCA71] text-[#011421] font-black text-sm uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-[#26b861] transition-colors">
                  Back to Home <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-xl font-black text-[#011421] mb-2">Apply to Drive</h3>
                {[
                  { name: "name",    placeholder: "Full Name",     icon: User,     type: "text" },
                  { name: "phone",   placeholder: "Phone Number",  icon: Phone,    type: "tel" },
                  { name: "email",   placeholder: "Email Address", icon: Mail,     type: "email" },
                  { name: "city",    placeholder: "Your City",     icon: Car,      type: "text" },
                  { name: "vehicle", placeholder: "Vehicle Model", icon: FileText, type: "text" },
                ].map((field) => (
                  <div key={field.name} className="relative">
                    <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      required
                      value={form[field.name]}
                      onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-[#011421] text-sm font-medium placeholder-gray-400 outline-none focus:border-[#2FCA71] focus:ring-2 focus:ring-[#2FCA71]/20 transition-all"
                    />
                  </div>
                ))}
                <button type="submit" className="w-full bg-[#2FCA71] text-[#011421] font-black text-sm uppercase tracking-widest py-4 rounded-2xl hover:bg-[#26b861] transition-colors shadow-lg shadow-[#2FCA71]/20 flex items-center justify-center gap-2">
                  Submit Application <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-center text-[11px] text-gray-400">By submitting, you agree to our Terms of Service.</p>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
