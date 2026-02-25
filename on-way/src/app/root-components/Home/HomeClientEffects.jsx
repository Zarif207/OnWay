"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import AOS from "aos";

export default function HomeClientEffects() {
  useEffect(() => {
    // AOS (Animate On Scroll)
    AOS.init({
      duration: 650,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
    });

    // Lenis smooth scrolling
    const lenis = new Lenis({
      smoothWheel: true,
      syncTouch: true,
      lerp: 0.085,
    });

    let rafId = 0;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const onResize = () => AOS.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}



