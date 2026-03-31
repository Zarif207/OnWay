"use client";
import { useEffect } from "react";
import AOS from "aos";

export default function HomeClientEffects() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-quad",
      once: true,
      offset: 100,
    });

    // 2. Mouse Spotlighting Logic
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      const elements = document.querySelectorAll(".spotlight-hover, .animated-btn");
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--x", `${x - rect.left}px`);
        el.style.setProperty("--y", `${y - rect.top}px`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return null;
}