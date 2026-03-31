"use client";
import { useEffect } from "react";
import AOS from "aos";
import Lenis from "@studio-freight/lenis";

export default function HomeClientEffects() {
  useEffect(() => {
    // ১. AOS Initialization
    AOS.init({
      duration: 800,
      easing: "ease-out-quad",
      once: true,
      offset: 100,
    });

    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      lerp: 0.1,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // ৩. Mouse Spotlighting Logic
    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      const elements = document.querySelectorAll(".spotlight-hover, .animated-btn");

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--x", `${x - rect.left}px`);
        el.style.setProperty("--y", `${y - rect.top}px`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      lenis.destroy();
    };
  }, []);

  return null;
}