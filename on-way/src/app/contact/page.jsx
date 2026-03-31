"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Phone, Mail, MapPin, Send, Clock, MessageCircle } from "lucide-react";
import PageBanner from "../components/PageBanner";

const INFO = [
  { icon: Phone,   label: "Phone",    value: "+880 1234-567890",    sub: "Available 24/7" },
  { icon: Mail,    label: "Email",    value: "support@onway.com",   sub: "Response within 24h" },
  { icon: MapPin,  label: "Location", value: "Chattogram, Bangladesh", sub: "Headquarters" },
  { icon: Clock,   label: "Hours",    value: "Sun–Thu: 9am–7pm",    sub: "Fri: Emergency only" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="bg-[#f4f6f9] min-h-screen">
      <PageBanner
        tag="Get in Touch"
        title="Contact Us"
        subtitle="Have a question, feedback, or safety concern? Our team is here to help — always."
      />

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* Form — 3 cols */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 p-8 rounded-2xl bg-white border border-gray-100 shadow-sm"
          >
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#2FCA71]/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-[#2FCA71]" />
                </div>
                <h3 className="text-2xl font-black text-[#011421] mb-2">Message Sent!</h3>
                <p className="text-gray-500">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2FCA71] mb-2">Send a Message</p>
                <h2 className="text-2xl font-black text-[#011421] mb-6">We'd love to hear from you</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { name: "name",    placeholder: "Your Name",    type: "text" },
                      { name: "email",   placeholder: "Your Email",   type: "email" },
                    ].map((f) => (
                      <input
                        key={f.name}
                        type={f.type}
                        placeholder={f.placeholder}
                        required
                        value={form[f.name]}
                        onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-[#011421] text-sm placeholder-gray-400 outline-none focus:border-[#2FCA71] focus:ring-2 focus:ring-[#2FCA71]/20 transition-all"
                      />
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Subject"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-[#011421] text-sm placeholder-gray-400 outline-none focus:border-[#2FCA71] focus:ring-2 focus:ring-[#2FCA71]/20 transition-all"
                  />
                  <textarea
                    rows={5}
                    placeholder="Your message..."
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-[#011421] text-sm placeholder-gray-400 outline-none focus:border-[#2FCA71] focus:ring-2 focus:ring-[#2FCA71]/20 transition-all resize-none"
                  />
                  <button type="submit" className="w-full bg-[#2FCA71] text-[#011421] font-black text-sm uppercase tracking-widest py-4 rounded-2xl hover:bg-[#26b861] transition-colors shadow-lg shadow-[#2FCA71]/20 flex items-center justify-center gap-2">
                    Send Message <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </motion.div>

          {/* Info panel — 2 cols */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            {INFO.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#2FCA71]/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-[#2FCA71]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                  <p className="font-black text-[#011421] text-sm">{item.value}</p>
                  <p className="text-gray-400 text-xs">{item.sub}</p>
                </div>
              </motion.div>
            ))}

            {/* Dark card */}
            <div className="relative p-6 rounded-2xl bg-[#011421] overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#2FCA71]/10 blur-[50px] rounded-full pointer-events-none" />
              <div className="relative z-10">
                <MessageCircle className="w-7 h-7 text-[#2FCA71] mb-3" />
                <p className="font-black text-white mb-1">Live Chat</p>
                <p className="text-gray-400 text-xs mb-4">Average response time: 2 minutes</p>
                <button className="w-full bg-[#2FCA71] text-[#011421] font-black text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-[#26b861] transition-colors">
                  Start Chat
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
