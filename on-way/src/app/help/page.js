"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Bike, DollarSign, Star, FileText, AlertTriangle, Users, CreditCard, MapPin, Shield, Phone, Clock, Wrench, Info, Search, X } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08, ease: "easeOut" } }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
};
const tabContent = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const riderFaqs = [
  {
    category: "Getting Started", icon: FileText,
    questions: [
      { question: "How do I register as an OnWay rider?", answer: "Go to the OnWay app, tap 'Become a Rider', upload your NID, driving license, and vehicle registration documents. After verification (2-3 business days), you'll be approved to start accepting rides." },
      { question: "What documents do I need to start riding?", answer: "You'll need a valid National ID (NID), driving license, vehicle registration certificate, vehicle fitness certificate, and a clear profile photo. All documents must be up to date." },
      { question: "How do I update my vehicle or document information?", answer: "Go to your rider profile in the app, tap 'Documents', and upload the updated files. Changes are reviewed within 24 hours." },
    ]
  },
  {
    category: "Earnings & Payments", icon: DollarSign,
    questions: [
      { question: "How and when do I get paid?", answer: "Your earnings are credited to your OnWay wallet after each completed trip. You can withdraw to bKash, Nagad, or your bank account anytime. Minimum withdrawal amount is ৳100." },
      { question: "What is OnWay's commission rate?", answer: "OnWay takes a 20% platform fee per ride. You keep 80% of the fare plus 100% of any tips from passengers." },
      { question: "I didn't receive the correct fare. What should I do?", answer: "Go to 'My Trips', select the affected ride, and tap 'Report a Fare Issue'. Our team will review and adjust within 24 hours." },
      { question: "What are the peak hours and how do surge fares work?", answer: "Peak hours are 7–9 AM and 5–8 PM on weekdays, and Friday/Saturday evenings. Surge pricing (1.2x–2x) automatically applies during these times." },
    ]
  },
  {
    category: "Rides & Requests", icon: Bike,
    questions: [
      { question: "Why am I not getting ride requests?", answer: "Make sure your app is online and GPS is enabled. Low acceptance rate or low rating can also reduce ride requests. Try moving to a busier area." },
      { question: "Can I take a break or go offline anytime?", answer: "Yes, you can go offline anytime by toggling your status in the app. There's no penalty for going offline." },
    ]
  },
  {
    category: "Ratings & Account", icon: Star,
    questions: [
      { question: "How does the rating system work for riders?", answer: "Passengers rate you 1-5 stars after each trip. You need to maintain at least a 4.0 rating to stay active." },
      { question: "My account has been suspended. What do I do?", answer: "Contact OnWay rider support through the app or visit a Walk-In Support Center with your NID. Most suspensions can be resolved within 48 hours." },
    ]
  },
  {
    category: "Safety", icon: AlertTriangle,
    questions: [
      { question: "What should I do if a passenger misbehaves?", answer: "End the trip safely and report the passenger immediately through the app under 'Report an Issue'. OnWay has zero tolerance for harassment." },
    ]
  },
];

const passengerFaqs = [
  {
    category: "Getting Started", icon: Users,
    questions: [
      { question: "How do I create an OnWay account?", answer: "Download the OnWay app, tap 'Sign Up', enter your phone number, verify with the OTP, and complete your profile. It takes less than 2 minutes." },
      { question: "Is my personal data safe with OnWay?", answer: "Yes. OnWay uses end-to-end encryption for all personal and payment data. We never share your information with third parties without your consent." },
    ]
  },
  {
    category: "Booking Rides", icon: MapPin,
    questions: [
      { question: "How do I book a ride?", answer: "Open the app, enter your pickup location and destination, choose your ride type, review the fare, and tap 'Book Ride'. A nearby rider will be assigned within minutes." },
      { question: "Can I schedule a ride in advance?", answer: "Yes. When booking, tap 'Schedule' and pick your preferred date and time. Scheduled rides can be cancelled up to 30 minutes before pickup." },
      { question: "How do I track my ride in real-time?", answer: "After booking, you'll see your rider's live location on the map along with their estimated arrival time." },
      { question: "Can I cancel a ride after booking?", answer: "Yes, you can cancel before the rider arrives. Cancellations within 2 minutes of booking are free. After that, a small fee may apply." },
      { question: "How do I contact my rider?", answer: "After booking, tap 'Call Rider' or 'Message Rider'. Your personal number stays private through OnWay's secure system." },
    ]
  },
  {
    category: "Payments", icon: CreditCard,
    questions: [
      { question: "What payment methods does OnWay accept?", answer: "We accept bKash, Nagad, Rocket, credit/debit cards, and cash. Set your preferred method in Settings → Payment." },
      { question: "How do I apply a promo code?", answer: "On the booking screen, tap 'Add Promo Code' before confirming. The discount will be applied automatically." },
    ]
  },
  {
    category: "Safety", icon: Shield,
    questions: [
      { question: "What safety features does OnWay offer passengers?", answer: "OnWay provides an SOS emergency button, live trip sharing, verified rider profiles, and 24/7 support." },
      { question: "I left something in the vehicle. What should I do?", answer: "Go to 'My Trips', select the trip, and tap 'Report Lost Item'. Most items are recovered within 24 hours." },
    ]
  },
  {
    category: "Ratings & Feedback", icon: Star,
    questions: [
      { question: "How do I rate my ride?", answer: "After each trip, you'll be prompted to rate your rider from 1 to 5 stars and leave optional feedback." },
    ]
  },
];

const supportCenters = [
  { name: "OnWay Tangail Support Center", address: "Zubaear's House, Tangail Sadar, Tangail 1900", phone: "+880 1700-000000", hours: "9:00 AM - 8:00 PM (7 days a week)", services: ["Account Issues", "Payment Problems", "Driver Registration", "Vehicle Inspection"] },
  { name: "OnWay Bogura Branch", address: "Minhajer's House, Bogura Sadar, Bogura 5800", phone: "+880 1700-000001", hours: "10:00 AM - 7:00 PM (Closed on Fridays)", services: ["General Support", "Lost & Found", "Complaint Resolution"] },
  { name: "OnWay Kishoreganj Office", address: "Zarif's House, Kishoreganj Sadar, Kishoreganj 2300", phone: "+880 1800-000000", hours: "9:00 AM - 6:00 PM (Closed on Fridays)", services: ["Driver Registration", "Account Support", "Payment Issues"] },
  { name: "OnWay Jamalpur Center", address: "Shourove's House, Jamalpur Sadar, Jamalpur 2000", phone: "+880 1800-000001", hours: "10:00 AM - 6:00 PM (Closed on Fridays)", services: ["General Support", "Driver Onboarding", "Account Issues"] },
  { name: "OnWay Chittagong Hub", address: "Ishteak's House, Chittagong Sadar, Chittagong 4000", phone: "+880 1900-000002", hours: "9:00 AM - 9:00 PM (7 days a week)", services: ["Account Issues", "Driver Registration", "Lost & Found", "Payment Problems", "App Technical Support"] },
];

function FaqItem({ faq, id, isOpen, onToggle, showCategory }) {
  return (
    <div className={`bg-white rounded-2xl border transition-all overflow-hidden ${isOpen ? "border-primary/30 shadow-sm" : "border-gray-100"}`}>
      <button onClick={() => onToggle(id)} className="w-full px-6 py-4 text-left flex justify-between items-center gap-4">
        <div>
          {showCategory && <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-1">{faq.category}</span>}
          <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={16} className="text-primary shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 border-t border-gray-50">
              <p className="text-gray-600 text-sm leading-relaxed pt-4">{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FaqSection({ sections, searchQuery }) {
  const [openFaq, setOpenFaq] = useState(null);
  const toggle = (id) => setOpenFaq(openFaq === id ? null : id);

  const allQuestions = sections.flatMap((s) =>
    s.questions.map((q) => ({ ...q, category: s.category, icon: s.icon }))
  );

  const filtered = searchQuery.trim()
    ? allQuestions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  if (filtered !== null) {
    return (
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <motion.p variants={fadeIn} initial="hidden" animate="visible" className="text-center text-gray-400 text-sm py-8">
            No results found. Try a different keyword.
          </motion.p>
        ) : (
          filtered.map((faq, i) => (
            <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" animate="visible">
              <FaqItem faq={faq} id={`s-${i}`} isOpen={openFaq === `s-${i}`} onToggle={toggle} showCategory={true} />
            </motion.div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section, si) => (
        <motion.div key={si} variants={fadeUp} custom={si} initial="hidden" animate="visible">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <section.icon size={16} className="text-primary" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">{section.category}</h4>
          </div>
          <div className="space-y-2">
            {section.questions.map((faq, qi) => {
              const id = `${si}-${qi}`;
              return (
                <FaqItem key={qi} faq={faq} id={id} isOpen={openFaq === id} onToggle={toggle} showCategory={false} />
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function HelpContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "rider");
  const [query, setQuery] = useState("");
  const [centerQuery, setCenterQuery] = useState("");

  useEffect(() => {
    if (tabParam) {
      // defer to avoid synchronous setState in effect
      const t = setTimeout(() => setActiveTab(tabParam), 0);
      return () => clearTimeout(t);
    }
  }, [tabParam]);

  const tabs = [
    { id: "rider", label: "Rider Help Center", icon: Bike },
    { id: "user", label: "User Help Center", icon: Users },
    { id: "walkin", label: "Walk-In Support Centers", icon: MapPin },
  ];

  const filteredCenters = centerQuery.trim()
    ? supportCenters.filter(
        (c) =>
          c.name.toLowerCase().includes(centerQuery.toLowerCase()) ||
          c.address.toLowerCase().includes(centerQuery.toLowerCase()) ||
          c.services.some((s) => s.toLowerCase().includes(centerQuery.toLowerCase()))
      )
    : supportCenters;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-secondary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #259461 0%, transparent 50%), radial-gradient(circle at 80% 20%, #2cbe6b 0%, transparent 40%)" }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible"
            className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Help Center
          </motion.h1>
          <motion.p variants={fadeUp} custom={1} initial="hidden" animate="visible"
            className="text-lg text-gray-300 mb-8">
            Find answers, get support, visit us in person
          </motion.p>
          <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible">
            {activeTab !== "walkin" ? (
              <div className="relative max-w-2xl mx-auto">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={activeTab === "rider" ? "Search rider help articles..." : "Search user help articles..."}
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white/15 transition-all text-sm"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                )}
              </div>
            ) : (
              <div className="relative max-w-2xl mx-auto">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={centerQuery}
                  onChange={(e) => setCenterQuery(e.target.value)}
                  placeholder="Search by city, service, or center name..."
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white/15 transition-all text-sm"
                />
                {centerQuery && (
                  <button onClick={() => setCenterQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-20 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setQuery(""); setCenterQuery(""); }}
                className={`relative flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all ${
                  activeTab === tab.id ? "text-primary" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">

        {activeTab === "rider" && (
          <motion.div key="rider" variants={tabContent} initial="hidden" animate="visible" exit="exit"
            className="max-w-4xl mx-auto px-6 py-12">
            {!query && (
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                  { icon: DollarSign, title: "Earnings", desc: "Payment schedules, bonuses, and cash out options" },
                  { icon: Bike, title: "Vehicle Requirements", desc: "Standards, inspections, and maintenance tips" },
                  { icon: Star, title: "Ratings & Reviews", desc: "How ratings work and tips to improve" },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" animate="visible"
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <item.icon size={22} className="text-primary" />
                    </div>
                    <h3 className="text-base font-bold text-secondary mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            )}
            {query && (
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                Results for &quot;{query}&quot;
              </p>
            )}
            <FaqSection sections={riderFaqs} searchQuery={query} />
          </motion.div>
        )}

        {activeTab === "user" && (
          <motion.div key="user" variants={tabContent} initial="hidden" animate="visible" exit="exit"
            className="max-w-4xl mx-auto px-6 py-12">
            {!query && (
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                  { icon: MapPin, title: "Booking Rides", desc: "Learn how to book, schedule, and manage your rides" },
                  { icon: CreditCard, title: "Payments", desc: "Payment methods, receipts, and billing questions" },
                  { icon: Users, title: "Account", desc: "Manage your profile, settings, and preferences" },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" animate="visible"
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <item.icon size={22} className="text-primary" />
                    </div>
                    <h3 className="text-base font-bold text-secondary mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            )}
            {query && (
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                Results for &quot;{query}&quot;
              </p>
            )}
            <FaqSection sections={passengerFaqs} searchQuery={query} />
          </motion.div>
        )}

        {activeTab === "walkin" && (
          <motion.div key="walkin" variants={tabContent} initial="hidden" animate="visible" exit="exit"
            className="max-w-6xl mx-auto px-6 py-12">
            <motion.div variants={fadeUp} initial="hidden" animate="visible"
              className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-start gap-4 mb-10">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Info size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-secondary mb-2">Before You Visit</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Bring your government-issued ID</li>
                  <li>• Have your OnWay account details ready</li>
                  <li>• For driver registration, bring vehicle documents</li>
                  <li>• Walk-ins are welcome, but appointments are recommended for faster service</li>
                </ul>
              </div>
            </motion.div>

            {filteredCenters.length === 0 ? (
              <motion.div variants={fadeIn} initial="hidden" animate="visible"
                className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <p className="text-gray-400 text-sm">No centers found for &quot;{centerQuery}&quot;. Try searching by city or service.</p>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredCenters.map((center, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" animate="visible"
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all overflow-hidden">
                    <div className="bg-secondary px-6 py-5 flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                        <MapPin size={18} className="text-primary" />
                      </div>
                      <h3 className="text-white font-black text-base tracking-tight">{center.name}</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Address</p>
                          <p className="text-sm text-gray-700">{center.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone size={16} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                          <p className="text-sm text-gray-700">{center.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock size={16} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Hours</p>
                          <p className="text-sm text-gray-700">{center.hours}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Wrench size={16} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Services</p>
                          <div className="flex flex-wrap gap-2">
                            {center.services.map((s, idx) => (
                              <span key={idx} className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button className="w-full mt-2 bg-secondary text-white py-3 rounded-xl text-sm font-bold hover:bg-primary transition-all active:scale-95">
                        Get Directions
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* Support CTA */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="bg-secondary py-16 mt-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Still Need Help?</h2>
          <p className="text-gray-400 mb-8 text-sm">Our support team is here for you 24/7</p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-accent transition-colors">
              Live Chat
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="bg-white/10 text-white border border-white/20 px-8 py-3 rounded-2xl font-bold text-sm hover:bg-white/20 transition-colors">
              Email Support
            </motion.button>
          </div>
        </div>
      </motion.div>

    </div>
  );
}

export default function HelpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <HelpContent />
    </Suspense>
  );
}
