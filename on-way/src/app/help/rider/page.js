"use client";

import { useState } from "react";

export default function RiderHelpCenter() {
  const [openFaq, setOpenFaq] = useState(null);

  const riderFaqs = [
    {
      question: "How do I become an OnWay driver?",
      answer: "Visit our driver registration page, submit required documents (license, vehicle registration, insurance), pass background verification, and complete driver training. Approval typically takes 2-3 business days."
    },
    {
      question: "What are the vehicle requirements?",
      answer: "Your vehicle must be 2015 or newer, pass safety inspection, have valid insurance and registration, be in good condition, and seat at least 4 passengers."
    },
    {
      question: "How do I get paid?",
      answer: "Earnings are automatically transferred to your bank account weekly. You can also cash out instantly (fees may apply) through the app's 'Earnings' section."
    },
    {
      question: "What percentage does OnWay take?",
      answer: "OnWay takes a 20% service fee from each ride. You keep 80% of the fare plus 100% of tips. Promotions and bonuses are added on top."
    },
    {
      question: "Can I choose which rides to accept?",
      answer: "Yes, you can see ride details (pickup location, destination, estimated fare) before accepting. However, maintaining a high acceptance rate helps you get more ride requests."
    },
    {
      question: "How does the rating system work?",
      answer: "Passengers rate you after each ride (1-5 stars). Maintain a 4.5+ rating to stay active. Low ratings may result in warnings or account deactivation."
    },
    {
      question: "What if a passenger damages my vehicle?",
      answer: "Report it immediately through the app with photos. OnWay's insurance covers damages caused by passengers. You may also charge a cleaning fee for messes."
    },
    {
      question: "Can I drive for multiple platforms?",
      answer: "Yes, you can drive for other ride-sharing platforms. However, you cannot have multiple apps running simultaneously while on an OnWay trip."
    },
    {
      question: "How do I handle difficult passengers?",
      answer: "Stay professional and calm. If you feel unsafe, you can end the trip and report the passenger. OnWay has zero tolerance for harassment or threatening behavior."
    },
    {
      question: "What are the peak hours for earning?",
      answer: "Peak hours are typically 7-9 AM, 5-8 PM on weekdays, and Friday/Saturday nights. During these times, surge pricing increases your earnings."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Rider Help Center</h1>
          <p className="text-lg text-gray-300 mb-8">
            Support and resources for OnWay drivers
          </p>
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search driver help..."
              className="w-full px-6 py-4 rounded-full bg-gray-900 text-white text-lg border-2 border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-500 transition font-medium">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Driver Resources
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Earnings</h3>
            <p className="text-gray-600">Payment schedules, bonuses, and cash out options</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="text-4xl mb-4">🚗</div>
            <h3 className="text-xl font-bold mb-2">Vehicle Requirements</h3>
            <p className="text-gray-600">Standards, inspections, and maintenance tips</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold mb-2">Ratings & Reviews</h3>
            <p className="text-gray-600">How ratings work and tips to improve</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {riderFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </h3>
                <span className="text-2xl text-gray-400">
                  {openFaq === index ? "−" : "+"}
                </span>
              </button>
              {openFaq === index && (
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Driver Support
          </h2>
          <p className="text-gray-600 mb-8">
            Dedicated support for our driver partners
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition font-medium">
              Driver Chat
            </button>
            <button className="bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 transition font-medium">
              Emergency Hotline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
