/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
import ScrollProgress from "../components/ScrollProgress";

const AboutUs = () => {
  const [showTeam, setShowTeam] = useState(false);

  const team = [
    {
      name: "Md Zubaear Hasan",
      role: "Co-Founder & CEO",
      quote: "OnWay was born from a simple frustration — getting around Dhaka shouldn't be this hard. We set out to build something that puts people first: fair prices, safe rides, and drivers who are treated with respect. That mission hasn't changed.",
      avatar: "ZH",
    },
    {
      name: "Minhaj Islam",
      role: "Co-Founder & COO",
      quote: "Every day I wake up thinking about how we can make the lives of our drivers better. When drivers thrive, passengers get better service — it's that simple.",
      avatar: "MI",
    },
    {
      name: "Zarif Hasan",
      role: "Co-Founder & CTO",
      quote: "We're not just building an app — we're building infrastructure for Bangladesh's future. Every line of code we write brings us closer to a smarter, safer city.",
      avatar: "ZH",
    },
    {
      name: "Shourov Hasan",
      role: "Co-Founder & CPO",
      quote: "Good design is invisible. Our goal is that every passenger feels like OnWay just works — no confusion, no friction, just a ride when you need it.",
      avatar: "SH",
    },
    {
      name: "Ishteak Ahmed",
      role: "Co-Founder & CMO",
      quote: "Bangladesh deserves a world-class ride-sharing platform built by Bangladeshis. We're proving that every single day.",
      avatar: "IA",
    },
  ];
  return (
    <ScrollProgress>
      <div className="bg-white text-gray-900 font-sans">

        {/* 1. HERO — full-width image with "About us" pill */}
        <section className="relative h-[70vh] overflow-hidden">
          <img
            src="/onway.png"
            alt="OnWay Bangladesh"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-10 left-10">
            <span className="bg-[#2FCA71] text-white text-sm font-bold px-5 py-2 rounded-full">
              About us
            </span>
          </div>
        </section>

        {/* 2. MISSION STATEMENT */}
        <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black leading-tight text-[#0a1628]">
              We reimagine the way the world moves for the better.
            </h2>
          </div>
          <div>
            <p className="text-gray-500 text-lg leading-relaxed">
              Movement is at the heart of what we do. At OnWay, we connect people and places across Bangladesh — making every journey safer, smarter, and more accessible. We believe that when people move freely, communities thrive.
            </p>
            <p className="text-gray-500 text-lg leading-relaxed mt-4">
              From Dhaka&apos;s busy streets to cities beyond, OnWay is building the infrastructure for the future of mobility &mdash; one ride at a time.
            </p>
          </div>
        </section>

        {/* 3. CEO LETTER — dark bg, image left, text right */}
        <section className="bg-[#0a1628] text-white">
          <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="relative h-80 md:h-auto overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop"
                alt="CEO"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-10 md:p-16 flex flex-col justify-center">
              <h3 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                A letter from our <br />
                <span className="text-[#2FCA71]">CEO</span>
              </h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                &ldquo;OnWay was born from a simple frustration &mdash; getting around Dhaka shouldn&apos;t be this hard. We set out to build something that puts people first: fair prices, safe rides, and drivers who are treated with respect. That mission hasn&apos;t changed.&rdquo;
              </p>
              <button
                onClick={() => setShowTeam(true)}
                className="self-start bg-[#2FCA71] text-white font-bold px-6 py-3 rounded-full hover:bg-[#25a85e] transition-colors">
                Read more
              </button>
            </div>
          </div>
        </section>

        {/* 4. SUSTAINABILITY + RIDERS BEYOND — alternating image/text rows */}
        <section className="max-w-7xl mx-auto px-6 py-20 space-y-24">

          {/* Row 1 — image left, text right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="overflow-hidden rounded-2xl h-72">
              <img
                src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop"
                alt="Sustainability"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div>
              <h3 className="text-3xl font-black text-[#0a1628] mb-4">Sustainability</h3>
              <p className="text-gray-500 leading-relaxed">
                We&apos;re committed to reducing our carbon footprint. OnWay is actively investing in electric vehicle partnerships and carbon-offset programs to make every ride greener. Our goal: net-zero emissions by 2030.
              </p>
              
            </div>
          </div>

          {/* Row 2 — text left, image right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-black text-[#0a1628] mb-4">Riders, and beyond</h3>
              <p className="text-gray-500 leading-relaxed">
                OnWay isn&apos;t just for passengers. We&apos;re building an ecosystem where drivers earn fairly, businesses move goods efficiently, and cities become more connected. Our platform empowers thousands of earners across Bangladesh.
              </p>
              
            </div>
            <div className="overflow-hidden rounded-2xl h-72">
              <img
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop"
                alt="Riders"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

        </section>

        {/* 5. SAFETY — icon + text block */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-black text-[#0a1628] mb-4">Your safety drives us</h3>
              <p className="text-gray-500 leading-relaxed mb-4">
                Every feature we build starts with one question: does this make our riders and drivers safer? From real-time GPS tracking to emergency SOS, safety is never an afterthought at OnWay.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Our drivers go through rigorous background checks, vehicle inspections, and ongoing training — so you can ride with confidence.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-40 h-40 bg-[#2FCA71]/10 rounded-3xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-[#2FCA71]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* 6. COMPANY INFO — 3 image cards */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <h3 className="text-3xl font-black text-[#0a1628] mb-10">Company info</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop",
                title: "Our Offices",
                desc: "Headquartered in Dhaka with teams across Bangladesh.",
              },
              {
                img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop",
                title: "Our Team",
                desc: "500+ passionate people building the future of mobility.",
              },
              {
                img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop",
                title: "Our Culture",
                desc: "Diverse, inclusive, and driven by impact.",
              },
            ].map((card, i) => (
              <div key={i} className="group overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-black text-[#0a1628] text-lg mb-2">{card.title}</h4>
                  <p className="text-gray-500 text-sm">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. KEEP UP WITH THE LATEST */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="text-3xl font-black text-[#0a1628] mb-10">Keep up with the latest</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { tag: "Newsroom", title: "OnWay expands to Chittagong and Sylhet", date: "March 2026" },
                { tag: "Blog", title: "How OnWay is making rides safer with AI", date: "February 2026" },
                { tag: "Press", title: "OnWay raises Series A to accelerate growth", date: "January 2026" },
              ].map((post, i) => (
                <a key={i} href="/blog" className="block border-t-2 border-[#2FCA71] pt-6 hover:opacity-70 transition-opacity cursor-pointer">
                  <span className="text-[#2FCA71] text-xs font-bold uppercase tracking-widest">{post.tag}</span>
                  <h4 className="font-black text-[#0a1628] text-lg mt-2 mb-3 leading-snug">{post.title}</h4>
                  <p className="text-gray-400 text-sm">{post.date}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 8. CTA — "Come reimagine with us" */}
        <section className="bg-[#0a1628] py-24 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Come reimagine <br />
                <span className="text-[#2FCA71]">with us</span>
              </h2>
              <a
                href="/earn-with-onway"
                className="inline-block mt-8 bg-[#2FCA71] text-white font-bold px-8 py-4 rounded-full hover:bg-[#25a85e] transition-colors"
              >
                Join OnWay
              </a>
            </div>
            <div className="text-[10rem] select-none">🌍</div>
          </div>
        </section>

      </div>

      {/* TEAM MODAL */}
      {showTeam && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" onClick={() => setShowTeam(false)}>
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 md:p-12" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-[#2FCA71] text-sm font-bold uppercase tracking-widest mb-1">The Founders</p>
                <h3 className="text-3xl font-black text-[#0a1628]">We built this together</h3>
              </div>
              <button onClick={() => setShowTeam(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600 font-bold text-lg">✕</button>
            </div>

            <div className="space-y-6">
              {team.map((member, i) => (
                <div key={i} className="flex gap-5 p-6 rounded-2xl bg-gray-50 hover:bg-[#2FCA71]/5 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-[#2FCA71] flex items-center justify-center text-white font-black text-sm shrink-0">
                    {member.avatar}
                  </div>
                  <div>
                    <p className="font-black text-[#0a1628]">{member.name}</p>
                    <p className="text-[#2FCA71] text-xs font-bold uppercase tracking-wider mb-3">{member.role}</p>
                    <p className="text-gray-500 leading-relaxed text-sm">&ldquo;{member.quote}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </ScrollProgress>
  );
};

export default AboutUs;
