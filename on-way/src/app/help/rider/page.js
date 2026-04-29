"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Bike, DollarSign, Star, FileText, AlertTriangle, ArrowLeft, Search, X } from "lucide-react";

const riderFaqs = [
  {
    category: "Getting Started",
    icon: FileText,
    questions: [
      {
        question: "How do I register as an OnWay rider?",
        answer: "Go to the OnWay app, tap 'Become a Rider', upload your NID, driving license, and vehicle registration documents. After verification (2-3 business days), you'll be approved to start accepting rides."
      },
      {
        question: "What documents do I need to start riding?",
        answer: "You'll need a valid National ID (NID), driving license, vehicle registration certificate, vehicle fitness certificate, and a clear profile photo. All documents must be up to date."
      },
      {
        question: "How do I update my vehicle or document information?",
        answer: "Go to your rider profile in the app, tap 'Documents', and upload the updated files. Changes are reviewed within 24 hours. You can continue riding during the review period."
      },
    ]
  },
  {
    category: "Earnings & Payments",
    icon: DollarSign,
    questions: [
      {
        question: "How and when do I get paid?",
        answer: "Your earnings are credited to your OnWay wallet after each completed trip. You can withdraw to bKash, Nagad, or your bank account anytime. Minimum withdrawal amount is ৳100."
      },
      {
        question: "What is OnWay's commission rate?",
        answer: "OnWay takes a 20% platform fee per ride. You keep 80% of the fare plus 100% of any tips from passengers. Bonus earnings during peak hours are added on top."
      },
      {
        question: "I didn't receive the correct fare. What should I do?",
        answer: "Go to 'My Trips', select the affected ride, and tap 'Report a Fare Issue'. Our team will review the trip details and adjust the fare if there was an error, usually within 24 hours."
      },
      {
        question: "What are the peak hours and how do surge fares work?",
        answer: "Peak hours are 7–9 AM and 5–8 PM on weekdays, and Friday/Saturday evenings. During these times, surge pricing (1.2x–2x) automatically applies, increasing your earnings per trip."
      },
    ]
  },
  {
    category: "Rides & Requests",
    icon: Bike,
    questions: [
      {
        question: "Why am I not getting ride requests?",
        answer: "Make sure your app is online and GPS is enabled. Check that your service area is set correctly. Low acceptance rate or low rating can also reduce ride requests. Try moving to a busier area."
      },
      {
        question: "Can I take a break or go offline anytime?",
        answer: "Yes, you can go offline anytime by toggling your status in the app. There's no penalty for going offline. Just make sure to complete any active trip before going offline."
      },
    ]
  },
  {
    category: "Ratings & Account",
    icon: Star,
    questions: [
      {
        question: "How does the rating system work for riders?",
        answer: "Passengers rate you 1-5 stars after each trip. You need to maintain at least a 4.0 rating to stay active. Consistently low ratings may lead to account review or suspension."
      },
      {
        question: "My account has been suspended. What do I do?",
        answer: "Contact OnWay rider support through the app or visit a Walk-In Support Center with your NID. Common reasons include document expiry, low ratings, or policy violations. Most suspensions can be resolved within 48 hours."
      },
    ]
  },
  {
    category: "Safety",
    icon: AlertTriangle,
    questions: [
      {
        question: "What should I do if a passenger misbehaves?",
        answer: "End the trip safely and report the passenger immediately through the app under 'Report an Issue'. OnWay has zero tolerance for harassment. You can also call the emergency hotline if you feel unsafe."
      },
    ]
  },
];

const quickLinks = [
  { icon: DollarSign, title: "Earnings", desc: "Payment schedules, bonuses, and cash out options" },
  { icon: Bike, title: "Vehicle Requirements", desc: "Standards, inspections, and maintenance tips" },
  { icon: Star, title: "Ratings & Reviews", desc: "How ratings work and tips to improve" },
];

export default function RiderHelpCenter() {
  const [openFaq, setOpenFaq] = useState(null);
  const [query, setQuery] = useState("");

  const toggle = (id) => setOpenFaq(openFaq === id ? null : id);

  const allQuestions = riderFaqs.flatMap((section) =>
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
            <Bike size={32} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Rider Help Center</h1>
          <p className="text-lg text-gray-300 mb-8">Support and resources for OnWay riders</p>
          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rider help articles..."
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

      {/* Quick Links — hide when searching */}
      {!query && (
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-black text-secondary text-center mb-10 tracking-tight">Rider Resources</h2>
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

      {/* FAQ — hide when searching */}
      {!query && (
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-black text-secondary text-center mb-10 tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {riderFaqs.map((section, si) => (
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
          <p className="text-gray-400 mb-8 text-sm">Dedicated support for our rider partners</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-accent transition-all hover:scale-105 active:scale-95">
              Rider Live Chat
            </button>
            <button className="bg-white/10 text-white border border-white/20 px-8 py-3 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all">
              Emergency Hotline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
