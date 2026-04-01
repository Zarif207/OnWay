"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Bike, DollarSign, Star, FileText, AlertTriangle, ArrowLeft, Search, X } from "lucide-react";
import PageBanner from "../../components/PageBanner";

const riderFaqs = [
  {
    category: "Getting Started",
    icon: FileText,
    questions: [
      { question: "How do I register as an OnWay rider?", answer: "Go to the OnWay app, tap 'Become a Rider', upload your NID, driving license, and vehicle registration documents. After verification (2-3 business days), you'll be approved." },
      { question: "What documents do I need to start riding?", answer: "You'll need a valid NID, driving license, vehicle registration certificate, vehicle fitness certificate, and a clear profile photo." },
    ]
  },
  {
    category: "Earnings & Payments",
    icon: DollarSign,
    questions: [
      { question: "How and when do I get paid?", answer: "Your earnings are credited to your OnWay wallet after each completed trip. You can withdraw to bKash, Nagad, or your bank account anytime. Minimum withdrawal is ৳100." },
      { question: "What is OnWay's commission rate?", answer: "OnWay takes a 20% platform fee per ride. You keep 80% of the fare plus 100% of any tips." },
      { question: "What are peak hours and surge fares?", answer: "Peak hours are 7–9 AM and 5–8 PM on weekdays. During these times, surge pricing (1.2x–2x) automatically applies." },
    ]
  },
  {
    category: "Rides & Requests",
    icon: Bike,
    questions: [
      { question: "Why am I not getting ride requests?", answer: "Make sure your app is online and GPS is enabled. Low acceptance rate or low rating can also reduce ride requests." },
      { question: "Can I take a break or go offline anytime?", answer: "Yes, you can go offline anytime by toggling your status. Just complete any active trip before going offline." },
    ]
  },
  {
    category: "Ratings & Account",
    icon: Star,
    questions: [
      { question: "How does the rating system work?", answer: "Passengers rate you 1-5 stars after each trip. You need to maintain at least a 4.0 rating to stay active." },
      { question: "My account has been suspended. What do I do?", answer: "Contact OnWay rider support through the app or visit a Walk-In Support Center with your NID." },
    ]
  },
  {
    category: "Safety",
    icon: AlertTriangle,
    questions: [
      { question: "What should I do if a passenger misbehaves?", answer: "End the trip safely and report the passenger immediately through the app under 'Report an Issue'." },
    ]
  },
];

export default function RiderHelpCenter() {
  const [openFaq, setOpenFaq] = useState(null);
  const [query, setQuery] = useState("");
  const toggle = (id) => setOpenFaq(openFaq === id ? null : id);
  const allQuestions = riderFaqs.flatMap((s) => s.questions.map((q) => ({ ...q, category: s.category })));
  const filtered = query.trim() ? allQuestions.filter((q) => q.question.toLowerCase().includes(query.toLowerCase()) || q.answer.toLowerCase().includes(query.toLowerCase())) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        tag="Rider Support"
        title="Rider Help Center"
        subtitle="Support and resources for OnWay riders"
        waveFill="#f9fafb"
      />

      {/* Back + Search */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-6">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Help Center
        </Link>
        <div className="relative">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rider help articles..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm text-sm outline-none focus:border-primary transition-all" />
          {query && <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"><X size={18} /></button>}
        </div>
      </div>

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

      {!query && (
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-black text-secondary text-center mb-10 tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {riderFaqs.map((section, si) => (
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
