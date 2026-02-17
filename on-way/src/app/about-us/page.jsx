/* eslint-disable @next/next/no-img-element */
import React from "react";

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Ahmed",
      role: "CEO / Visionary",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
    },
    {
      name: "Syeda Doe",
      role: "Operations Ninja",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop",
    },
    {
      name: "Tanvir Hasan",
      role: "Tech Sorcerer",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop",
    },
    {
      name: "Rahat Ali",
      role: "Product Designer",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1887&auto=format&fit=crop",
    },
    {
      name: "Nabila Islam",
      role: "Marketing Head",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1887&auto=format&fit=crop",
    },
    {
      name: "Siam Karim",
      role: "Lead Developer",
      img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1887&auto=format&fit=crop",
    },
  ];

  return (
    <div className="bg-white text-gray-900 font-sans selection:bg-green-500 selection:text-white">
      {/* 1. Hero Section  */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://i.ibb.co.com/35PP69pk/young-women-taking-selfie-car.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Dark Overlay (Text readable) */}
        <div className="absolute inset-0 bg-black/40 z-0"></div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-2xl">
            <span className="text-green-500 font-bold tracking-[0.3em] uppercase mb-4 block">
              Our Vision
            </span>

            <h1 className="text-5xl md:text-7xl font-black mb-6 text-white italic uppercase leading-tight">
              The{" "}
              <span className="bg-green-500 px-2 text-black not-italic">
                Architects
              </span>
              <br />
              Beyond Boundaries.
            </h1>

            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              We aren't just building a ride-sharing infrastructure; we're
              building the future of how Dhaka moves, lives, and grows.
            </p>

            <button className="bg-green-600 text-white px-8 py-3 font-bold uppercase hover:bg-white hover:text-black transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

    {/* 2. Stats Section */}
      <section className="py-12 bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { l: "Active Riders", v: "500K+" },
            { l: "Trips", v: "10M+" },
            { l: "Cities", v: "12" },
            { l: "Rating", v: "4.9/5" },
          ].map((s, i) => (
            <div key={i}>
              <h3 className="text-3xl font-black text-black">{s.v}</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
