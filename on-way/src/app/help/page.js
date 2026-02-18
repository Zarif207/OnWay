"use client";

import { useState } from "react";

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const categories = [
    { name: "Getting Started", icon: "🚀", color: "bg-pink-100" },
    { name: "Booking Rides", icon: "🚗", color: "bg-purple-100" },
    { name: "Payments", icon: "💳", color: "bg-blue-100" },
    { name: "Safety", icon: "🛡️", color: "bg-green-100" },
    { name: "Driver Info", icon: "👨‍✈️", color: "bg-yellow-100" },
    { name: "Account", icon: "👤", color: "bg-indigo-100" },
  ];

  const faqs = [
    {
      question: "How do I book a ride on OnWay?",
      category: "Booking Rides",
      answer: "Booking a ride is simple! Open the OnWay app, enter your pickup and destination locations, choose your preferred ride type, and confirm your booking. A nearby driver will be assigned to you within minutes."
    },
    {
      question: "What payment methods are accepted?",
      category: "Payments",
      answer: "We accept credit/debit cards, mobile wallets, and cash payments. You can add your preferred payment method in the app settings."
    },
    {
      question: "How can I track my ride in real time?",
      category: "Booking Rides",
      answer: "Once your ride is confirmed, you can track your driver's location in real-time on the map within the app."
    },
    {
      question: "What safety features does OnWay provide?",
      category: "Safety",
      answer: "OnWay offers SOS emergency button, ride sharing with contacts, driver verification, and 24/7 support for your safety."
    },
    {
      question: "How do I become an OnWay driver?",
      category: "Driver Info",
      answer: "Visit our driver registration page, submit required documents, pass background verification, and start earning!"
    },
    {
      question: "Can I cancel a ride after booking?",
      category: "Booking Rides",
      answer: "Yes, you can cancel a ride before the driver arrives. Cancellation fees may apply based on timing."
    },
    {
      question: "How do I contact customer support?",
      category: "Getting Started",
      answer: "You can reach us via live chat in the app, email at support@onway.com, or call our 24/7 helpline."
    },
    {
      question: "What should I do if I left an item in the vehicle?",
      category: "Getting Started",
      answer: "Contact support immediately with your ride details. We'll help you connect with the driver to retrieve your item."
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-gray-900 via-gray-800 to-black text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-lg text-gray-300 mb-8">
            Find answers to common questions and get the help you need
          </p>
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full px-6 py-4 rounded-full text-gray-900 text-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-500 transition font-medium">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer"
            >
              <div className={`text-4xl mb-3 p-4 rounded-full ${category.color}`}>
                {category.icon}
              </div>
              <p className="text-sm font-medium text-gray-700 text-center">
                {category.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-yellow-600 mt-1">{faq.category}</p>
                </div>
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

      {/* Contact Support Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Still Need Help?
          </h2>
          <p className="text-gray-600 mb-8">
            Our support team is here for you 24/7
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-black font-bold text-lg mb-2">Live Chat</h3>
              <p className="text-gray-600 text-sm mb-4">
                Chat with our support team
              </p>
              <button className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition">
                Start Chat
              </button>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-black font-bold text-lg mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get help via email
                
              </p>
              <button className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition">
                Send Email
              </button>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-black font-bold text-lg mb-2">Call Us</h3>
              <p className="text-gray-600 text-sm mb-4">
                Speak with our team
              </p>
              <button className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition">
                Call Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
