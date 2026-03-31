"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Users, CreditCard, MapPin, Shield, Star, ArrowLeft, Search, X } from "lucide-react";

const passengerFaqs = [
  {
    category: "Getting Started",
    icon: Users,
    questions: [
      {
        question: "How do I create an OnWay account?",
        answer: "Download the OnWay app, tap 'Sign Up', enter your phone number, verify with the OTP sent to your number, and complete your profile. It takes less than 2 minutes."
      },
      {
        question: "Is my personal data safe with OnWay?",
        answer: "Yes. OnWay uses end-to-end encryption for all personal and payment data. We never share your information with third parties without your consent."
      },
    ]
  },
  {
    category: "Booking Rides",
    icon: MapPin,
    questions: [
      {
        question: "How do I book a ride?",
        answer: "Open the app, enter your pickup location and destination, choose your ride type (economy, comfort, or premium), review the estimated fare, and tap 'Book Ride'. A nearby rider will be assigned within minutes."
      },
      {
        question: "Can I schedule a ride in advance?",
        answer: "Yes. When booking, tap 'Schedule' and pick your preferred date and time. You'll receive a confirmation and a reminder before your ride. Scheduled rides can be cancelled up to 30 minutes before pickup."
      },
      {
        question: "How do I track my ride in real-time?",
        answer: "After booking, you'll see your rider's live location on the map along with their estimated arrival time. You can also share your trip status with a trusted contact."
      },
      {
        question: "Can I cancel a ride after booking?",
        answer: "Yes, you can cancel before the rider arrives. Cancellations made within 2 minutes of booking are free. After that, a small cancellation fee may apply."
      },
      {
        question: "How do I contact my rider?",
        answer: "After booking, tap 'Call Rider' or 'Message Rider' in the app. Your personal number stays private — all calls go through OnWay's secure system."
      },
    ]
  },
  {
    category: "Payments",
    icon: CreditCard,
    questions: [
      {
        question: "What payment methods does OnWay accept?",
        answer: "We accept bKash, Nagad, Rocket, credit/debit cards, and cash. You can set your preferred payment method in the app under Settings → Payment."
      },
      {
        question: "How do I apply a promo code or discount?",
        answer: "On the booking screen, tap 'Add Promo Code' before confirming your ride. Enter the code and the discount will be applied to your fare automatically."
      },
    ]
  },
  {
    category: "Safety",
    icon: Shield,
    questions: [
      {
        question: "What safety features does OnWay offer passengers?",
        answer: "OnWay provides an SOS emergency button, live trip sharing with contacts, verified rider profiles with photos and ratings, and 24/7 support. You can also report any safety concern directly from the app."
      },
      {
        question: "I left something in the vehicle. What should I do?",
        answer: "Go to 'My Trips', select the trip, and tap 'Report Lost Item'. Describe the item and we'll connect you with the rider. Most items are recovered within 24 hours."
      },
    ]
  },
  {
    category: "Ratings & Feedback",
    icon: Star,
    questions: [
      {
        question: "How do I rate my ride?",
        answer: "After each trip, you'll be prompted to rate your rider from 1 to 5 stars and leave optional feedback. Your ratings help us maintain service quality."
      },
    ]
  },
];

const quickLinks = [
  { icon: MapPin, title: "Booking Rides", desc: "Learn how to book, schedule, and manage your rides" },
  { icon: CreditCard, title: "Payments", desc: "Payment methods, receipts, and billing questions" },
  { icon: Users, title: "Account", desc: "Manage your profile, settings, and preferences" },
];

export default function PassengerHelpCenter() {
  const [openFaq, setOpenFaq] = useState(null);
  const [query, setQuery] = useState("");

  const toggle = (id) => setOpenFaq(openFaq === id ? null : id);

  const allQuestions = passengerFaqs.flatMap((section) =>
    section.questions.map((q) => ({ ...q, category: section.category, icon: section.icon }))
  );

  const filtered = query.trim()
    ? allQuestions.filter(
        (q) =>
          q.question.toLowerCase().includes(query.toLowerCase()) ||
          q.answer.toLowerCase().includes(query.toLowerCase())
      )
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-secondary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #259461 0%, transparent 50%), radial-gradient(circle at 80% 20%, #2cbe6b 0%, transparent 40%)" }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Link href="/help" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Help Center
          </Link>
          <div className="w-16 h-16 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users size={32} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Passenger Help Center</h1>
          <p className="text-lg text-gray-300 mb-8">Everything you need to know about riding with OnWay</p>
          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search passenger help articles..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white/15 transition-all text-sm"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {filtered !== null && (
        <div className="max-w-4xl mx-auto px-6 py-10">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &quot;{query}&quot;
          </p>
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-gray-400 text-sm">No results found. Try a different keyword.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((faq, i) => {
                const isOpen = openFaq === `search-${i}`;
                return (
                  <div key={i} className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen ? "border-primary/30 shadow-sm" : "border-gray-100"}`}>
                    <button onClick={() => toggle(`search-${i}`)} className="w-full px-6 py-4 text-left flex justify-between items-center gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-1">{faq.category}</span>
                        <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
                      </div>
                      <ChevronDown size={16} className={`text-primary shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 border-t border-gray-50">
                        <p className="text-gray-600 text-sm leading-relaxed pt-4">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      {!query && (
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-black text-secondary text-center mb-10 tracking-tight">Quick Help Topics</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickLinks.map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon size={22} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-secondary mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
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
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <section.icon size={16} className="text-primary" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{section.category}</h3>
                </div>
                <div className="space-y-2">
                  {section.questions.map((faq, qi) => {
                    const id = `${si}-${qi}`;
                    const isOpen = openFaq === id;
                    return (
                      <div key={qi} className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen ? "border-primary/30 shadow-sm" : "border-gray-100"}`}>
                        <button onClick={() => toggle(id)} className="w-full px-6 py-4 text-left flex justify-between items-center gap-4">
                          <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
                          <ChevronDown size={16} className={`text-primary shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-5 border-t border-gray-50">
                            <p className="text-gray-600 text-sm leading-relaxed pt-4">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support CTA */}
      <div className="bg-secondary py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Still Need Help?</h2>
          <p className="text-gray-400 mb-8 text-sm">Our support team is here for you 24/7</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-accent transition-all hover:scale-105 active:scale-95">
              Live Chat
            </button>
            <button className="bg-white/10 text-white border border-white/20 px-8 py-3 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all">
              Email Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
