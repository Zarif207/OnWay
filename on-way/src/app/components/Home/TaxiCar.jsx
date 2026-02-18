"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function TaxiCar() {
  const carRef = useRef(null);

  useEffect(() => {
    const car = carRef.current;
    if (!car) return;

    // Create infinite loop animation
    const tl = gsap.timeline({ repeat: -1 });
    
    // Start from left (off-screen)
    gsap.set(car, { x: "-150%", y: 0 });
    
    // Animate across the screen
    tl.to(car, {
      x: "150%",
      duration: 20,
      ease: "none",
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={carRef}
      className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2"
      style={{ willChange: "transform" }}
    >
      <svg
        width="450"
        height="220"
        viewBox="0 0 450 220"
        className="w-full max-w-[300px] h-auto drop-shadow-2xl sm:max-w-[400px] lg:max-w-[450px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Taxi Body - Yellow with gradient effect */}
        <defs>
          <linearGradient id="taxiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
        </defs>
        
        {/* Main Body */}
        <rect x="90" y="110" width="270" height="90" rx="10" fill="url(#taxiGradient)" />
        
        {/* Taxi Roof */}
        <path
          d="M 110 110 L 130 50 L 320 50 L 340 110 Z"
          fill="url(#taxiGradient)"
        />
        
        {/* Windows with reflection */}
        <rect x="140" y="65" width="70" height="35" rx="5" fill="#1a1a1a" opacity="0.4" />
        <rect x="140" y="65" width="70" height="12" rx="5" fill="#fff" opacity="0.2" />
        
        <rect x="240" y="65" width="70" height="35" rx="5" fill="#1a1a1a" opacity="0.4" />
        <rect x="240" y="65" width="70" height="12" rx="5" fill="#fff" opacity="0.2" />
        
        {/* TAXI Sign on Roof */}
        <rect x="160" y="35" width="120" height="25" rx="3" fill="#000" />
        <text
          x="220"
          y="53"
          textAnchor="middle"
          fill="#FFD700"
          fontSize="16"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          TAXI
        </text>
        
        {/* Checkered Pattern on Side */}
        <g transform="translate(200, 130)">
          {/* Checkered squares */}
          <rect x="0" y="0" width="25" height="25" fill="#000" />
          <rect x="25" y="25" width="25" height="25" fill="#000" />
          <rect x="50" y="0" width="25" height="25" fill="#000" />
          <rect x="75" y="25" width="25" height="25" fill="#000" />
        </g>
        
        {/* TAXI Text on Side */}
        <text
          x="300"
          y="155"
          fill="#000"
          fontSize="28"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          letterSpacing="2"
        >
          TAXI
        </text>
        
        {/* Wheels with detail */}
        <g>
          {/* Front Wheel */}
          <circle cx="140" cy="200" r="22" fill="#2a2a2a" />
          <circle cx="140" cy="200" r="18" fill="#1a1a1a" />
          <circle cx="140" cy="200" r="14" fill="#333" />
          <circle cx="140" cy="200" r="8" fill="#4a4a4a" />
          <circle cx="140" cy="200" r="4" fill="#666" />
          
          {/* Back Wheel */}
          <circle cx="310" cy="200" r="22" fill="#2a2a2a" />
          <circle cx="310" cy="200" r="18" fill="#1a1a1a" />
          <circle cx="310" cy="200" r="14" fill="#333" />
          <circle cx="310" cy="200" r="8" fill="#4a4a4a" />
          <circle cx="310" cy="200" r="4" fill="#666" />
        </g>
        
        {/* Headlights */}
        <circle cx="360" cy="140" r="10" fill="#fff" opacity="0.9" />
        <circle cx="360" cy="140" r="7" fill="#FFD700" />
        <circle cx="360" cy="140" r="4" fill="#fff" />
        
        {/* Grille */}
        <rect x="360" y="115" width="25" height="35" fill="#1a1a1a" rx="2" />
        <line x1="365" y1="120" x2="365" y2="145" stroke="#333" strokeWidth="2" />
        <line x1="370" y1="120" x2="370" y2="145" stroke="#333" strokeWidth="2" />
        <line x1="375" y1="120" x2="375" y2="145" stroke="#333" strokeWidth="2" />
        <line x1="380" y1="120" x2="380" y2="145" stroke="#333" strokeWidth="2" />
        
        {/* Side mirrors */}
        <rect x="85" y="75" width="8" height="15" rx="2" fill="#FFD700" />
        <rect x="357" y="75" width="8" height="15" rx="2" fill="#FFD700" />
        
        {/* Door handles */}
        <rect x="190" y="135" width="30" height="4" rx="2" fill="#333" />
        <rect x="250" y="135" width="30" height="4" rx="2" fill="#333" />
      </svg>
    </div>
  );
}

