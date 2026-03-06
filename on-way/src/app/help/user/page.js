"use client";

import { useState } from "react";

export default function UserHelpCenter() {
  const [openFaq, setOpenFaq] = useState(null);

  const userFaqs = [
    {
      question: "How do I create an account on OnWay?",
      answer: "Download the OnWay app, tap 'Sign Up', enter your phone number or email, verify with OTP, and complete your profile with basic information."
    },
    {
      question: "How do I book a ride?",
      answer: "Open the app, enter your pickup and destination locations, choose your ride type (economy, premium, etc.), confirm the fare, and tap 'Book Now'. A driver will be assigned within minutes."
    },
    {
      question: "Can I schedule a ride in advance?",
      answer: "Yes! When booking, select 'Schedule Ride' and choose your preferred date and time. The driver will arrive at your scheduled time."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept credit/debit cards, mobile wallets (bKash, Nagad, Rocket), and cash payments. You can add your preferred payment method in Settings."
    },
    {
      question: "How do I track my ride in real-time?",
      answer: "Once your ride is confirmed, you'll see the driver's location on the map in real-time. You can also see their estimated arrival time."
    },
    {
      question: "Can I cancel a ride after booking?",
      answer: "Yes, you can cancel before the driver arrives. Cancellation fees may apply if you cancel after the driver has started moving towards your location."
    },
    {
      question: "How do I contact my driver?",
      answer: "After booking, you'll see a 'Call Driver' or 'Message Driver' button in the app. Your number remains private through our secure system."
    },
    {
      question: "What should I do if I left something in the vehicle?",
      answer: "Go to 'My Rides', select the trip, and tap 'Report Lost Item'. Provide details and we'll help you connect with the driver to retrieve it."
    },
    {
      question: "How do I rate my ride experience?",
      answer: "After each ride, you'll be prompted to rate your driver (1-5 stars) and provide optional feedback. This helps us maintain quality service."
    },
    {
      question: "Is my personal information safe?",
      answer: "Yes, we use industry-standard encryption to protect your data. Your payment information is securely stored and never shared with drivers."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-gray-900 via-gray-800 to-black text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">User Help Center</h1>
          <p className="text-lg text-gray-300 mb-8">
            Everything you need to know about using OnWay as a passenger
          </p>
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for help..."
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
          Quick Help Topics
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="text-4xl mb-4">🚗</div>
            <h3 className="text-xl font-bold mb-2">Booking Rides</h3>
            <p className="text-gray-600">Learn how to book, schedule, and manage your rides</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold mb-2">Payments</h3>
            <p className="text-gray-600">Payment methods, receipts, and billing questions</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-bold mb-2">Account</h3>
            <p className="text-gray-600">Manage your profile, settings, and preferences</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {userFaqs.map((faq, index) => (
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
            Still Need Help?
          </h2>
          <p className="text-gray-600 mb-8">
            Our support team is here for you 24/7
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition font-medium">
              Live Chat
            </button>
            <button className="bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 transition font-medium">
              Email Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
