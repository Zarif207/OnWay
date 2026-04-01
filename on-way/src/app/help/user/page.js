"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Users, CreditCard, MapPin, Shield, Star, ArrowLeft, Search, X } from "lucide-react";
import PageBanner from "../../components/PageBanner";

const passengerFaqs = [
  {
    category: "Getting Started",
    icon: Users,
    questions: [
      { question: "How do I create an OnWay account?", answer: "Download the OnWay app, tap 'Sign Up', enter your phone number, verify with the OTP sent to your number, and complete your profile. It takes less than 2 minutes." },
      { question: "Is my personal data safe with OnWay?", answer: "Yes. OnWay uses end-to-end encryption for all personal and payment data. We never share your information with third parties without your consent." },
    ]
  },
  {
    category: "Booking Rides",
    icon: MapPin,
    questions: [
      { question: "How do I book a ride?", answer: "Open the app, enter your pickup location and destination, choose your ride type, review the estimated fare, and tap 'Book Ride'. A nearby rider will be assigned within minutes." },
      { question: "Can I schedule a ride in advance?", answer: "Yes. When booking, tap 'Schedule' and pick your preferred date and time. Scheduled rides can be cancelled up to 30 minutes before pickup." },
      { question: "Can I cancel a ride after booking?", answer: "Yes, you can cancel before the rider arrives. Cancellations made within 2 minutes of booking are free. After that, a small cancellation fee may apply." },
    ]
  },
  {
    category: "Payments",
    icon: CreditCard,
    questions: [
      { question: "What payment methods does OnWay accept?", answer: "We accept bKash, Nagad, Rocket, credit/debit cards, and cash. You can set your preferred payment method in the app under Settings → Payment." },
      { question: "How do I apply a promo code?", answer: "On the booking screen, tap 'Add Promo Code' before confirming your ride. Enter the code and the discount will be applied automatically." },
    ]
  },
  {
    category: "Safety",
    icon: Shield,
    questions: [
      { question: "What safety features does OnWay offer passengers?", answer: "OnWay provides an SOS emergency button, live trip sharing, verified rider profiles, and 24/7 support." },
      { question: "I left something in the vehicle. What should I do?", answer: "Go to 'My Trips', select the trip, and tap 'Report Lost Item'. Most items are recovered within 24 hours." },
    ]
  },
  {
    category: "Ratings & Feedback",
    icon: Star,
    questions: [
      { question: "How do I rate my ride?", answer: "After each trip, you'll be prompted to rate your rider from 1 to 5 stars and leave optional feedback." },
    ]
  },
];

export default function PassengerHelpCenter() {
  const [openFaq, setOpenFaq] = useState(null);
  const [query, setQuery] = useState("");
  const toggle = (id) => setOpenFaq(openFaq === id ? null : id);
  const allQuestions = passengerFaqs.flatMap((s) => s.questions.map((q) => ({ ...q, category: s.category })));
  const filtered = query.trim() ? allQuestions.filter((q) => q.question.toLowerCase().includes(query.toLowerCase()) || q.answer.toLowerCase().includes(query.toLowerCase())) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        tag="Passenger Support"
        title="Passenger Help Center"
        subtitle="Everything you need to know about riding with OnWay"
        waveFill="#f9fafb"
      />

      {/* Back + Search */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-6">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Help Center
        </Link>
        <div className="relative">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search passenger help articles..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm text-sm outline-none focus:border-primary transition-all" />
          {query && <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"><X size={18} /></button>}
        </div>
      </div>

      {/* Search Results */}
      {filtered !== null && (
        <div className="max-w-4xl mx-auto px-6 pb-10">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{query}"</p>
          {filtered.length === 0 ? <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center"><p className="text-gray-400 text-sm">No results found.</p></div> : (
            <div className="space-y-2">
              {filtered.map((faq, i) => {
                const isOpen = openFaq === `s-${i}`;
                return (
                  <div key={i} className={`bg-white rounded-2xl border overflow-hidden ${isOpen ? "border-primary/30" : "border-gray-100"}`}>
                    <button onClick={() => toggle(`s-${i}`)} className="w-full px-6 py-4 text-left flex justify-between items-center gap-4">
                      <div><span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-1">{faq.category}</span><span className="text-sm font-semibold text-gray-900">{faq.question}</span></div>
                      <ChevronDown size={16} className={`text-primary shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && <div className="px-6 pb-5 border-t border-gray-50 pt-4"><p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p></div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FAQ */}
      {!query && (
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-black text-secondary text-center mb-10 tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {passengerFaqs.map((section, si) => (
              <div key={si}>
                <div className="flex items-center gap-3 mb-3 px-1">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center"><section.icon size={16} className="text-primary" /></div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{section.category}</h3>
                </div>
                <div className="space-y-2">
                  {section.questions.map((faq, qi) => {
                    const id = `${si}-${qi}`;
                    const isOpen = openFaq === id;
                    return (
                      <div key={qi} className={`bg-white rounded-2xl border overflow-hidden ${isOpen ? "border-primary/30 shadow-sm" : "border-gray-100"}`}>
                        <button onClick={() => toggle(id)} className="w-full px-6 py-4 text-left flex justify-between items-center gap-4">
                          <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
                          <ChevronDown size={16} className={`text-primary shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isOpen && <div className="px-6 pb-5 border-t border-gray-50 pt-4"><p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
