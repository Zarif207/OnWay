"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const MainHero = () => {
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const init = () => {
      const duration = video.duration;
      if (!duration || duration === Infinity) return;

      // MASTER TIMELINE
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=600%",
          scrub: 1.2, // smooth scrub
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (self.progress >= 0.75) {
              setShowOverlay(true);
            } else {
              setShowOverlay(false);
            }
          },
        },
      });

      // Smooth video scrubbing (no ticker)
      tl.to(video, {
        currentTime: duration,
        ease: "none",
      });

      // Cinematic zoom synced
      tl.to(
        video,
        {
          scale: 1.2,
          ease: "none",
        },
        0
      );

      // Exit animation
      gsap.to(sectionRef.current, {
        opacity: 0,
        y: -80,
        filter: "blur(30px)",
        scrollTrigger: {
          trigger: container,
          start: "top -540%",
          end: "top -600%",
          scrub: true,
        },
      });
    };

    if (video.readyState >= 1) {
      init();
    } else {
      video.addEventListener("loadedmetadata", init);
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black overflow-hidden"
    >
      <section
        ref={sectionRef}
        className="relative h-screen w-full flex items-center justify-center"
      >
        {/* VIDEO */}
        <video
          ref={videoRef}
          src="/volvo.mp4"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover scale-[1.05]"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />

        {/* CONTENT */}
        <div className="relative z-20 w-full max-w-7xl px-8 lg:px-12">
          <AnimatePresence>
            {showOverlay && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-none">
                  OnWay<span className="text-green-500">.</span>
                </h1>

                <p className="mt-6 text-white/70 text-lg md:text-xl font-semibold">
                  Wherever You’re Going, We’re Already On The Way.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SCROLL INDICATOR */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-[2px] h-12 bg-white/20"
          />
        </div>
      </section>
    </div>
  );
};

export default MainHero;