"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck, Scale, Eye, HelpCircle,
  AlertCircle, Download, Wallet, ShieldAlert,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import PageBanner from "../components/PageBanner";

const Terms = () => {
  const [activeTab, setActiveTab] = useState("acceptance");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Initializing AOS for smooth scroll animations
    AOS.init({ duration: 600 });
  }, []);

  const termsData = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: <ShieldCheck size={18} />,
      details: [
        "By using the OnWay app or website, you agree to comply with and be bound by our terms and conditions.",
        "We reserve the right to update or modify these terms at any time without prior notice.",
        "If you disagree with any part of these terms, please discontinue use of our services.",
      ],
    },
    {
      id: "eligibility",
      title: "User Eligibility",
      icon: <HelpCircle size={18} />,
      details: [
        "Users must be at least 18 years old under the laws of Bangladesh.",
        "Drivers must hold a valid driving license approved by BRTA.",
        "All provided information (name, NID, photo) must be accurate and truthful.",
      ],
    },
    {
      id: "payments",
      title: "Payment & Fares",
      icon: <Wallet size={18} />,
      details: [
        "Fares are calculated based on distance, estimated time, and real-time traffic conditions.",
        "Digital payments (bKash, Nagad, Cards) must be authorized before the ride starts if selected.",
        "A cancellation fee may apply if a ride is cancelled after 3 minutes of booking.",
        "Any disputes regarding fares must be reported within 24 hours of the trip completion.",
      ],
    },
    {
      id: "safety",
      title: "Safety & Insurance",
      icon: <ShieldAlert size={18} />,
      details: [
        "OnWay provides an in-app Emergency SOS button that connects directly to local authorities.",
        "While we facilitate safe transport, users are responsible for their personal belongings.",
        "All registered rides are covered under our basic accident insurance policy as per local regulations.",
        "Any form of harassment, physical or verbal, will lead to an immediate and permanent account ban.",
      ],
    },
    {
      id: "conduct",
      title: "User Conduct",
      icon: <Scale size={18} />,
      details: [
        "Riders and drivers must treat each other with mutual respect.",
        "Drivers must comply with traffic laws at all times.",
        "Accurate ratings and reviews must be provided after each trip.",
      ],
    },
    {
      id: "privacy",
      title: "Data & Privacy",
      icon: <Eye size={18} />,
      details: [
        "Live location tracking is used for safety and accurate fare calculation.",
        "Personal information is never sold or shared with third parties.",
        "Trip and payment records are stored only for service and legal purposes.",
      ],
    },
  ];

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulating a delay for PDF generation
    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  return (
    <section className="min-h-screen bg-[#f4f6f9]">
      <PageBanner
        tag="Legal Center"
        title="Terms of Service"
        subtitle="Please read these terms carefully before using our platform."
        pills={["Acceptance", "Eligibility", "Payments", "Safety", "Conduct", "Privacy"]}
        waveFill="#f4f6f9"
      />
      <div className="max-w-6xl mx-auto px-4 py-16">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-4" data-aos="fade-right">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-10">
              <h3 className="text-sm font-semibold text-gray-800 mb-6 uppercase tracking-wider">
                Overview
              </h3>

              <nav className="flex flex-col gap-2">
                {termsData.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 text-left rounded-md text-sm transition ${
                      activeTab === tab.id
                        ? "bg-gray-100 text-black font-semibold shadow-sm"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className={activeTab === tab.id ? "text-black" : "text-gray-500"}>
                      {tab.icon}
                    </span>
                    {tab.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-8" data-aos="fade-left">
            <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-10 min-h-137.5 shadow-sm">
              {termsData.map(
                (content) =>
                  activeTab === content.id && (
                    <div key={content.id} className="animate-in fade-in duration-500">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
                          {content.icon}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                          {content.title}
                        </h2>
                      </div>

                      <div className="space-y-6">
                        {content.details.map((point, idx) => (
                          <div key={idx} className="flex gap-4">
                            <div className="shrink-0 w-1.5 h-1.5 mt-2.5 rounded-full bg-black"></div>
                            <p className="text-gray-700 text-base leading-relaxed">
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Warning Box */}
                      <div className="mt-12 p-5 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
                        <AlertCircle
                          size={20}
                          className="text-amber-600 mt-0.5 shrink-0"
                        />
                        <p className="text-sm text-amber-800 leading-relaxed">
                          <strong>Note:</strong> Violation of these rules may result in
                          immediate account suspension, permanent banning, or legal
                          action depending on the severity of the case.
                        </p>
                      </div>

                      {/* Download Section */}
                      <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="text-sm text-gray-500">
                          Last Updated: October 2023
                        </p>
                        <a
                          href="/Terms.pdf"
                          download
                          onClick={handleDownload}
                          className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-lg transition-all ${
                            isDownloading
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-black text-white hover:bg-gray-800 active:scale-95"
                          }`}
                        >
                          <Download size={16} />
                          {isDownloading
                            ? "Processing PDF..."
                            : "Download Full PDF"}
                        </a>
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Terms;