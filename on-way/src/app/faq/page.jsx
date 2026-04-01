"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Search, HelpCircle, MapPin,
  CreditCard, Shield, User, Car, Mail, Phone, MessageCircle,
} from "lucide-react";
import Link from "next/link";
import PageBanner from "../components/PageBanner";

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    key: "general",
    label: "General",
    icon: HelpCircle,
    accent: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    activeBg: "bg-blue-500",
    questions: [
      { id: "g1", q: "What is OnWay?", a: "OnWay is a modern ride-sharing platform that connects passengers with verified drivers across Bangladesh. We provide safe, affordable, and reliable transportation for daily commutes and special occasions." },
      { id: "g2", q: "How does OnWay work?", a: "Open the app, enter your pickup and destination, choose a ride type, and confirm. Our algorithm instantly matches you with the nearest verified driver. You can track the ride live and pay digitally or with cash." },
      { id: "g3", q: "Is OnWay available in my city?", a: "OnWay currently operates in Dhaka, Chattogram, Sylhet, and is rapidly expanding to other major cities across Bangladesh. Check the app for the latest coverage map." },
      { id: "g4", q: "Do I need to create an account?", a: "Yes, a free account is required to book rides. Sign up with your phone number or email, verify your identity, and you're ready to go in under 2 minutes." },
      { id: "g5", q: "Can I use OnWay for corporate travel?", a: "Absolutely. OnWay offers corporate accounts with centralized billing, ride analytics, and dedicated support. Contact our business team at business@onway.com for details." },
    ],
  },
  {
    key: "booking",
    label: "Booking",
    icon: MapPin,
    accent: "text-[#2FCA71]",
    bg: "bg-[#2FCA71]/10",
    border: "border-[#2FCA71]/20",
    activeBg: "bg-[#2FCA71]",
    questions: [
      { id: "b1", q: "How do I book a ride?", a: "Open the app, tap 'Book a Ride', enter your pickup and drop-off locations, select your preferred ride category, and confirm. You'll see driver details and ETA within seconds." },
      { id: "b2", q: "Can I schedule a ride in advance?", a: "Yes! Tap 'Schedule for Later' when booking, pick your date and time (up to 7 days ahead), and we'll match you with a driver 15 minutes before your scheduled pickup." },
      { id: "b3", q: "How do I cancel a ride?", a: "Tap the active ride card and select 'Cancel Ride'. Cancellations before the driver departs are free. A small fee applies if the driver is already on the way to you." },
      { id: "b4", q: "Can I add multiple stops?", a: "Yes. After entering your destination, tap 'Add Stop' to include intermediate locations. Fares are calculated based on the total route distance." },
      { id: "b5", q: "What if my driver doesn't show up?", a: "If your driver hasn't arrived within the estimated time, you can contact them directly via the app or cancel and rebook. Our support team is available 24/7 if you need assistance." },
      { id: "b6", q: "Can I request a specific driver?", a: "You can mark favourite drivers in the app. While we can't guarantee a specific driver, the system will prioritise your favourites when they're available nearby." },
    ],
  },
  {
    key: "payments",
    label: "Payments",
    icon: CreditCard,
    accent: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    activeBg: "bg-violet-500",
    questions: [
      { id: "p1", q: "What payment methods are accepted?", a: "We accept cash, debit/credit cards, bKash, Nagad, and Rocket. You can manage your preferred payment method in Account Settings before booking." },
      { id: "p2", q: "How is my fare calculated?", a: "Fares are based on base rate + distance + estimated time. The full estimated fare is shown before you confirm. Final fare may vary slightly due to traffic or route changes." },
      { id: "p3", q: "Can I use promo codes?", a: "Yes. Enter your promo code in the 'Offers' section of the app before booking. Discounts are applied automatically at checkout. Each code has its own terms and expiry." },
      { id: "p4", q: "How do I get a refund?", a: "Refund requests can be submitted via Help > Payments > Request Refund. Valid refunds are processed within 3–5 business days to your original payment method." },
      { id: "p5", q: "Will I receive a receipt?", a: "Yes. A detailed receipt is sent to your registered email and is also available in the app under Trip History immediately after each completed ride." },
      { id: "p6", q: "Is there a cancellation fee?", a: "Cancellations made before the driver departs are free. If the driver is already en route, a fee of ৳20–৳50 may apply depending on the ride category." },
    ],
  },
  {
    key: "safety",
    label: "Safety",
    icon: Shield,
    accent: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    activeBg: "bg-amber-500",
    questions: [
      { id: "s1", q: "How are drivers verified?", a: "Every driver undergoes NID verification, BRTA license check, vehicle inspection, and AI-powered face verification before activation. We re-verify drivers periodically." },
      { id: "s2", q: "What is the Emergency SOS feature?", a: "Tap the SOS button in any active ride to instantly alert our safety team and share your live location. The feature also provides a direct line to local emergency services." },
      { id: "s3", q: "Can I share my trip with someone?", a: "Yes. Tap 'Share Trip' during an active ride to send a live tracking link to any contact. They can follow your journey in real-time without needing the OnWay app." },
      { id: "s4", q: "What if I feel unsafe during a ride?", a: "Use the in-app SOS button immediately. You can also call our 24/7 safety hotline. All rides are GPS-tracked and our team can intervene within minutes." },
      { id: "s5", q: "Are vehicles inspected?", a: "Yes. All vehicles must pass a physical inspection covering brakes, tyres, lights, and seatbelts before being approved. Inspections are repeated every 6 months." },
      { id: "s6", q: "How do I report a driver?", a: "After your trip, tap 'Rate & Review', then 'Report an Issue'. You can also go to Help > Report a Safety Concern. All reports are reviewed within 24 hours." },
    ],
  },
  {
    key: "account",
    label: "Account",
    icon: User,
    accent: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    activeBg: "bg-pink-500",
    questions: [
      { id: "a1", q: "How do I create an account?", a: "Download the OnWay app, tap 'Sign Up', enter your phone number or email, verify with OTP, and complete your profile. The whole process takes under 2 minutes." },
      { id: "a2", q: "How do I update my profile?", a: "Go to Account > Edit Profile to update your name, photo, phone number, emergency contacts, and preferred payment method at any time." },
      { id: "a3", q: "I forgot my password. What do I do?", a: "On the login screen, tap 'Forgot Password', enter your registered email or phone, and follow the OTP verification steps to set a new password." },
      { id: "a4", q: "Can I have multiple accounts?", a: "Each phone number and email can only be linked to one account. If you need a separate corporate account, contact our business team." },
      { id: "a5", q: "How do I delete my account?", a: "Go to Account > Settings > Delete Account. Your data will be permanently removed within 30 days as per our privacy policy. Active rides or pending payments must be resolved first." },
      { id: "a6", q: "How do I add an emergency contact?", a: "Go to Account > Safety > Emergency Contacts and add up to 3 contacts. They'll be notified automatically if you use the SOS feature during a ride." },
    ],
  },
  {
    key: "driver",
    label: "Drivers",
    icon: Car,
    accent: "text-teal-500",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    activeBg: "bg-teal-500",
    questions: [
      { id: "d1", q: "How do I become an OnWay driver?", a: "Visit /driver-register, fill out the application form with your personal details and vehicle info, upload required documents, and complete face verification. Approval takes up to 48 hours." },
      { id: "d2", q: "What documents are required?", a: "You'll need a valid NID, BRTA driving license, vehicle registration certificate, and a recent photo of yourself and your vehicle." },
      { id: "d3", q: "How do drivers get paid?", a: "Earnings are calculated per trip and transferred to your registered mobile banking account (bKash/Nagad) weekly. You can also track daily earnings in the driver app." },
      { id: "d4", q: "What is the commission structure?", a: "OnWay takes a transparent platform fee per trip. The exact percentage is shown in the driver app and varies slightly by ride category. There are no hidden deductions." },
      { id: "d5", q: "Can I drive part-time?", a: "Absolutely. OnWay is fully flexible — you choose when to go online and offline. There are no minimum hour requirements." },
      { id: "d6", q: "What support is available for drivers?", a: "Drivers have access to a dedicated support line, in-app help centre, and a community forum. Our driver relations team is available Mon–Sat 9am–7pm." },
    ],
  },
];

// ─── Accordion Item ────────────────────────────────────────────────────────────
function AccordionItem({ item, isOpen, onToggle, accent, border }) {
  return (
    <div className={`rounded-2xl bg-white border ${isOpen ? border : "border-gray-100"} shadow-sm overflow-hidden transition-all duration-300`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group"
      >
        <span className={`font-black text-sm leading-snug transition-colors duration-200 ${isOpen ? "text-[#011421]" : "text-gray-700 group-hover:text-[#011421]"}`}>
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 ${isOpen ? "bg-[#2FCA71]/10" : "bg-gray-100 group-hover:bg-gray-200"}`}
        >
          <ChevronDown className={`w-4 h-4 transition-colors duration-200 ${isOpen ? "text-[#2FCA71]" : "text-gray-400"}`} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-1">
              <div className={`w-8 h-0.5 ${accent.replace("text-", "bg-")} rounded-full mb-3`} />
              <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FAQPage() {
  const [activeKey, setActiveKey] = useState("general");
  const [openId, setOpenId] = useState(null);
  const [query, setQuery] = useState("");

  const activeCategory = CATEGORIES.find((c) => c.key === activeKey);

  const displayed = useMemo(() => {
    if (!query.trim()) return activeCategory.questions;
    const q = query.toLowerCase();
    return CATEGORIES.flatMap((c) =>
      c.questions.filter((item) =>
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      )
    );
  }, [query, activeKey]);

  const isSearching = query.trim().length > 0;

  const handleCategoryChange = (key) => {
    setActiveKey(key);
    setOpenId(null);
  };

  return (
    <main className="min-h-screen bg-[#f4f6f9]">
      <PageBanner
        tag="OnWay Support"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about OnWay — rides, payments, safety, and more."
        pills={["General", "Booking", "Payments", "Safety", "Account", "Drivers"]}
      />

      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-2xl mx-auto mb-14"
        >
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search any question..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpenId(null); }}
            className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm text-[#011421] text-sm font-medium placeholder-gray-400 outline-none focus:border-[#2FCA71] focus:ring-2 focus:ring-[#2FCA71]/20 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          )}
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Sidebar — category tabs */}
          {!isSearching && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full lg:w-56 shrink-0 lg:sticky lg:top-24"
            >
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Categories</p>
              <div className="flex flex-row lg:flex-col gap-2 flex-wrap">
                {CATEGORIES.map((cat) => {
                  const isActive = cat.key === activeKey;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => handleCategoryChange(cat.key)}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-black transition-all duration-200 text-left ${
                        isActive
                          ? `${cat.activeBg} text-white shadow-md`
                          : "bg-white text-gray-500 hover:text-[#011421] hover:bg-gray-50 border border-gray-100"
                      }`}
                    >
                      <cat.icon className="w-4 h-4 shrink-0" />
                      <span>{cat.label}</span>
                      <span className={`ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"}`}>
                        {cat.questions.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          )}

          {/* Accordion panel */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            {!isSearching && (
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className={`w-10 h-10 rounded-2xl ${activeCategory.bg} flex items-center justify-center`}>
                  <activeCategory.icon className={`w-5 h-5 ${activeCategory.accent}`} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#011421]">{activeCategory.label}</h2>
                  <p className="text-xs text-gray-400">{activeCategory.questions.length} questions</p>
                </div>
              </motion.div>
            )}

            {isSearching && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-400 mb-6"
              >
                {displayed.length} result{displayed.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
              </motion.p>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={isSearching ? "search" : activeKey}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3"
              >
                {displayed.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="font-black text-gray-400">No results found</p>
                    <p className="text-sm text-gray-300 mt-1">Try different keywords</p>
                  </div>
                ) : (
                  displayed.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.35 }}
                    >
                      <AccordionItem
                        item={item}
                        isOpen={openId === item.id}
                        onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                        accent={isSearching ? "text-[#2FCA71]" : activeCategory.accent}
                        border={isSearching ? "border-[#2FCA71]/20" : activeCategory.border}
                      />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 relative rounded-[2.5rem] bg-[#011421] overflow-hidden p-10 md:p-14"
        >
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#2FCA71]/8 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-violet-600/8 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-[11px] font-black text-[#2FCA71] uppercase tracking-[0.25em] mb-2">Still need help?</p>
              <h3 className="text-3xl font-black text-white mb-2">Can't find your answer?</h3>
              <p className="text-gray-400 text-sm max-w-sm">Our support team is available 24/7 across email, phone, and live chat.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              {[
                { icon: Mail,          label: "Email Us",  href: "mailto:support@onway.com",  style: "bg-white/5 border border-white/10 text-white hover:bg-white/10" },
                { icon: Phone,         label: "Call Us",   href: "tel:+8801234567890",         style: "bg-white/5 border border-white/10 text-white hover:bg-white/10" },
                { icon: MessageCircle, label: "Live Chat", href: "/help",                      style: "bg-[#2FCA71] text-[#011421] hover:bg-[#26b861] shadow-lg shadow-[#2FCA71]/20" },
              ].map((ch) => (
                <Link
                  key={ch.label}
                  href={ch.href}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-200 ${ch.style}`}
                >
                  <ch.icon className="w-4 h-4" />
                  {ch.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
