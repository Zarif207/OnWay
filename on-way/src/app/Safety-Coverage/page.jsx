"use client"
import React, { useEffect } from 'react';
import { ShieldCheck, HeartPulse, HardHat, Car, Smartphone, CheckCircle2, ShieldAlert } from 'lucide-react';
import AOS from 'aos';

const coverageDetails = [
    {
        title: "Accidental Medical Expense",
        desc: "Financial coverage for immediate medical assistance in case of any accident.",
        icon: <HeartPulse className="text-secondary" size={32} />,
        limit: "Up to 50,000 TK"
    },
    {
        title: "Permanent Disability",
        desc: "Special benefits for both riders and drivers in cases of accident-related permanent disability.",
        icon: <ShieldCheck className="text-accent" size={32} />,
        limit: "Up to 2,00,000 TK"
    },
    {
        title: "Ride Monitoring",
        desc: "Every trip is monitored 24/7 from our control room.",
        icon: <Smartphone className="text-blue-400" size={32} />,
        limit: "Live Tracking"
    }
];

const OnWaySafetyCoverage = () => {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    return (
        <section className="py-20 bg-base-100 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4">
                
                {/* --- UNIQUE SECTION HEADER START --- */}
                <div className="relative mb-20 text-center md:text-left" data-aos="fade-right">
                    {/* Background Watermark */}
                    <span className="absolute -top-12 left-0 text-[6rem] md:text-[10rem] font-black text-primary opacity-[0.03] select-none pointer-events-none hidden md:block uppercase">
                        Protection
                    </span>

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
                        {/* Main Bold Title */}
                        <div className="shrink-0">
                            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none flex flex-col md:flex-row">
                                <span className="text-primary">On</span>
                                <span className="text-accent md:ml-2 relative">
                                    Way
                                    <span className="absolute bottom-2 left-0 w-full h-3 bg-secondary/40 -z-10 rounded-full"></span>
                                </span>
                            </h2>
                        </div>

                        {/* Vertical Accent Line */}
                        <div className="hidden md:block h-20 w-2 bg-secondary rounded-full transform -skew-x-12"></div>

                        {/* Heading Text & Desc */}
                        <div className="max-w-xl">
                            <h3 className="text-2xl md:text-3xl font-bold text-primary flex items-center justify-center md:justify-start gap-3 uppercase tracking-wider">
                                <ShieldAlert className="text-accent animate-pulse" /> Safety Coverage
                            </h3>
                            <p className="mt-3 text-gray-500 font-medium leading-relaxed italic">
                               We provide special safety measures to make each of your journeys secure.
                                <span className="text-primary font-bold block md:inline md:ml-1">OnWay means maximum safety</span>
                            </p>
                        </div>
                    </div>
                    {/* Bottom Gradient Line */}
                    <div className="mt-8 h-1.5 w-full max-w-sm bg-linear-to-r from-accent via-secondary to-transparent rounded-full mx-auto md:mx-0"></div>
                </div>
                {/* --- UNIQUE SECTION HEADER END --- */}

                {/* Coverage Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
                    {coverageDetails.map((item, index) => (
                        <div 
                            key={index}
                            className="relative group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-accent/20 transition-all duration-500 hover:-translate-y-2"
                            data-aos="fade-up"
                            data-aos-delay={index * 150}
                        >
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                            
                            <div className="mb-6 inline-block p-5 bg-primary rounded-3xl shadow-lg group-hover:rotate-6 transition-transform">
                                {item.icon}
                            </div>
                            
                            <h3 className="text-primary text-2xl font-bold mb-3 tracking-tight">{item.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                {item.desc}
                            </p>
                            
                            <div className="flex items-center justify-between pt-5 border-t border-dashed border-gray-200">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-accent" />
                                    <span className="text-primary font-extrabold text-sm uppercase tracking-tighter">Coverage Amount</span>
                                </div>
                                <span className="bg-secondary/20 text-primary px-3 py-1 rounded-lg font-black text-xs">
                                    {item.limit}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Banner Section */}
                <div className="bg-primary rounded-[4rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-primary/30">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12">
                        <HardHat size={200} />
                    </div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
                        <div data-aos="fade-right">
                            <h3 className="text-4xl md:text-5xl font-black mb-8 italic leading-tight">
                             Why is our safety<br />
                                <span className="text-secondary uppercase not-italic">the best? </span>
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    "Verified and trained drivers are ensured.",
                                    "In-app SOS emergency button feature.",
                                    "Keep your family updated with live location.",
                                    "Safety gear and hygiene kits are mandatory."
                                ].map((list, i) => (
                                    <li key={i} className="flex items-center gap-4 group">
                                        <div className="bg-accent group-hover:bg-secondary transition-colors rounded-xl p-2 shrink-0 shadow-lg shadow-accent/20">
                                            <CheckCircle2 size={18} className="text-white group-hover:text-primary" />
                                        </div>
                                        <span className="text-gray-300 font-semibold text-lg">{list}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="flex justify-center" data-aos="zoom-in">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-accent blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 md:p-14 rounded-[3.5rem] text-center transform transition-transform group-hover:scale-105">
                                    <div className="bg-secondary w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12 shadow-xl shadow-secondary/20">
                                        <Car size={45} className="text-primary -rotate-12" />
                                    </div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mb-2">Confidence of</p>
                                    <h4 className="text-5xl md:text-6xl font-black text-white mb-2">500K+</h4>
                                    <p className="text-accent font-bold text-sm tracking-widest uppercase">Safe Journeys</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OnWaySafetyCoverage;