"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Scale, Eye, HelpCircle, ArrowRightCircle, Download, FileSignature, AlertCircle } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';



const Terms = () => {
    const [activeTab, setActiveTab] = useState("acceptance");
    const [isDownloading, setIsDownloading] = useState(false);
    const pdfRef = useRef();
    

    useEffect(() => {
        AOS.init({ duration: 800 });
    }, []);

    // ... termsData  ...
    const termsData = [
        {
            id: "acceptance",
            title: "Acceptance of Terms",
            icon: <ShieldCheck size={20} />,
            details: [
                "By using the OnWay app or website, you are deemed to have accepted all our terms and conditions",
                "We reserve the right to modify or revise these terms at any time without prior notice.",
                "If you do not agree with any of our terms, please refrain from using our services."
            ]
        },
        {
            id: "eligibility",
            title: "User Eligibility",
            icon: <HelpCircle size={20} />,
            details: [
                "Users must be at least 18 years old in accordance with the laws of Bangladesh.",
                "Drivers are required to hold a valid driving license approved by the BRTA (Bangladesh Road Transport Authority)",
                "All information provided in the app (name, photo, NID) must be accurate and truthful. Providing false information may result in permanent account termination."
            ]
        },
        {
            id: "conduct",
            title: "User Conduct",
            icon: <Scale size={20} />,
            details: [
                "Both riders and drivers must show respect to each other. Any kind of inappropriate behavior is not acceptable.",
                "Drivers must comply with traffic laws. Verified complaints of overspeeding or reckless driving will result in legal action.",
                "At the end of the trip, accurate information must be provided when giving ratings and reviews."
            ]
        },
        {
            id: "privacy",
            title: "Data & Privacy",
            icon: <Eye size={20} />,
            details: [
                "For safety and accurate fare calculation, we track your live location.",
                "Your personal information or contact number is never sold or shared with any third party.",
                "Trip records and payment history are stored solely for service improvement and legal purposes."
            ]
        }
    ];

    return (
        <section className="min-h-screen bg-[#f9fafb] py-16 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header Area */}
                <div className="text-center mb-16" data-aos="fade-down">
                    <div className="inline-flex items-center gap-2 bg-[#303841] text-[#FFF200] px-4 py-2 rounded-full mb-6 shadow-lg">
                        <FileSignature size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Official Policy</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-[#303841] italic uppercase tracking-tighter leading-tight">
                        Terms of <span className="text-[#23b440]">Service</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Side Navigation */}
                    <div className="lg:col-span-4 space-y-3" data-aos="fade-right">
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100">
                            <h3 className="text-[#303841] font-black text-sm uppercase tracking-widest mb-6 px-4">Categories</h3>
                            <nav className="flex flex-col gap-2">
                                {termsData.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 group ${activeTab === tab.id
                                            ? "bg-[#303841] text-white shadow-xl shadow-[#303841]/30 translate-x-2"
                                            : "bg-transparent text-gray-500 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className={`${activeTab === tab.id ? "text-[#FFF200]" : "text-[#23b440]"}`}>
                                            {tab.icon}
                                        </div>
                                        {tab.title}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Right Side: Content Area */}
                    <div className="lg:col-span-8" data-aos="fade-left">
                        <div ref={pdfRef} className="bg-white min-h-[550px] p-8 md:p-14 rounded-[3.5rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFF200]/10 rounded-bl-[10rem] -z-0"></div>

                            {termsData.map((content) => (
                                activeTab === content.id && (
                                    <div key={content.id} className="relative z-10">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="p-4 bg-gray-100 rounded-2xl text-[#303841]">
                                                {content.icon}
                                            </div>
                                            <h2 className="text-3xl md:text-4xl font-black text-[#303841] uppercase italic tracking-tight">
                                                {content.title}
                                            </h2>
                                        </div>

                                        <div className="space-y-6">
                                            {content.details.map((point, idx) => (
                                                <div key={idx} className="flex gap-4 group">
                                                    <div className="mt-1.5 shrink-0 w-5 h-5 rounded-full bg-[#23b440]/20 flex items-center justify-center">
                                                        <div className="w-2 h-2 rounded-full bg-[#23b440]"></div>
                                                    </div>
                                                    <p className="text-gray-600 text-lg leading-relaxed font-medium">
                                                        {point}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-10 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                                            <AlertCircle className="text-amber-500 shrink-0 mt-1" />
                                            <p className="text-sm text-amber-800 font-semibold italic">
                                                Note: Violation of these terms grants OnWay the right to take legal action.
                                            </p>
                                        </div>

                                        {/* Button Section - pdfRef */}
                                        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4">
                                            <a
                                                href="/Terms.pdf"
                                                download
                                                onClick={() => setIsDownloading(true)}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isDownloading
                                                        ? "bg-gray-400 cursor-not-allowed"
                                                        : "bg-[#303841] text-white hover:bg-[#23b440] hover:scale-105"
                                                    }`}
                                            >
                                                <Download size={18} />
                                                {isDownloading ? "Generating PDF..." : "Download Full PDF"}
                                            </a>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Terms;