"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Scale,
  Eye,
  HelpCircle,
  FileSignature,
  AlertCircle,
  Download,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const Terms = () => {
  const [activeTab, setActiveTab] = useState("acceptance");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
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

  return (
    <section className="min-h-screen bg-[#f2f2f2] py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-14" data-aos="fade-down">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-3">
            Legal Center
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900">
            Terms of Service
          </h1>
          <p className="mt-4 text-gray-600 max-w-2xl">
            Please read these terms carefully before using our platform.
            Your access to and use of the service is conditioned upon your
            acceptance of these terms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Sidebar */}
          <div className="lg:col-span-4" data-aos="fade-right">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
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
                        ? "bg-gray-100 text-black font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-gray-500">{tab.icon}</span>
                    {tab.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-8" data-aos="fade-left">
            <div className="bg-white border border-gray-200 rounded-xl p-10 min-h-[500px]">

              {termsData.map(
                (content) =>
                  activeTab === content.id && (
                    <div key={content.id}>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="text-gray-600">
                          {content.icon}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                          {content.title}
                        </h2>
                      </div>

                      <div className="space-y-5">
                        {content.details.map((point, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="w-2 h-2 mt-2 rounded-full bg-gray-400"></div>
                            <p className="text-gray-700 text-base leading-7">
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Note Box */}
                      <div className="mt-10 p-5 bg-gray-50 border border-gray-200 rounded-md flex gap-3">
                        <AlertCircle
                          size={18}
                          className="text-gray-500 mt-1"
                        />
                        <p className="text-sm text-gray-600">
                          Violation of these terms may result in account
                          suspension or legal action.
                        </p>
                      </div>

                      {/* Download Button */}
                      <div className="mt-10 pt-6 border-t border-gray-200">
                        <a
                          href="/Terms.pdf"
                          download
                          onClick={() => setIsDownloading(true)}
                          className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-md transition ${
                            isDownloading
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-black text-white hover:bg-gray-800"
                          }`}
                        >
                          <Download size={16} />
                          {isDownloading
                            ? "Generating PDF..."
                            : "Download Full Terms (PDF)"}
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