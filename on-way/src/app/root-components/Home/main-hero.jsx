"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * MainHero Component (V14 - Ultra-Premium Smoothness)
 * 
 * Performance Architecture:
 * 1. Seek-Throttling: Only talks to the GPU when the playhead significantly moves.
 * 2. Unified Timeline: Synchronizes zoom depth (800%) with scrubbing depth.
 * 3. Decoder Handshake: Play/pause sequence to prime the rendering pipeline.
 */
const MainHero = () => {
    const containerRef = useRef(null);
    const sectionRef = useRef(null);
    const videoRef = useRef(null);
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        const container = containerRef.current;
        if (!video || !container) return;

        // Optimized video config
        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;
        video.load();

        let targetTime = 0;
        let actualTime = 0;
        const lerpFactor = 0.08;
        let videoDuration = 0;
        let lastSeekTime = -1;

        /**
         * Optimized Frame Engine
         * Implements "Delta Gating" - only seeks if movement > 0.001s.
         * This prevents decoder thrashing and significantly increases FPS.
         */
        const updateFrame = () => {
            actualTime += (targetTime - actualTime) * lerpFactor;

            if (videoDuration > 0 && video.readyState >= 2) {
                // Throttle: Don't seek if the difference is imperceptible
                if (Math.abs(actualTime - lastSeekTime) > 0.001) {
                    const safeTime = Math.max(0, Math.min(actualTime, videoDuration - 0.05));
                    video.currentTime = safeTime;
                    lastSeekTime = safeTime;
                }
            }
        };

        const initScene = async () => {
            // Hardware Handshake: Wake decoders for scrubbing
            try {
                await video.play();
                video.pause();
            } catch (e) {
                console.warn("Video decoder handshake skipped/blocked");
            }

            videoDuration = video.duration;
            if (!videoDuration || videoDuration === Infinity) return;

            // 1. MASTER PIN & SCRUB (800% Depth)
            const masterST = ScrollTrigger.create({
                trigger: container,
                start: "top top",
                end: "+=800% top",
                pin: true,
                scrub: true,
                anticipatePin: 1,
                onUpdate: (self) => {
                    targetTime = videoDuration * self.progress;

                    // Trigger Overlay at 6s/75% mark
                    if (self.progress >= 0.75) {
                        setShowOverlay(true);
                    } else {
                        setShowOverlay(false);
                    }
                },
            });

            // 2. SYNCHRONIZED CINEMATIC ZOOM
            // Unified end boundary (800%) with master scrubbing for zero jitter
            gsap.fromTo(video,
                { scale: 1.1 },
                {
                    scale: 1.25,
                    scrollTrigger: {
                        trigger: container,
                        start: "top top",
                        end: "+=800% top", // Synced with master depth
                        scrub: true
                    }
                }
            );

            // 3. EXIT TRANSFORMATION
            gsap.to(sectionRef.current, {
                opacity: 0,
                y: -100,
                filter: "blur(40px)",
                scrollTrigger: {
                    trigger: container,
                    start: "top -720%", // Final 10%
                    end: "top -800%",
                    scrub: true,
                },
            });

            gsap.ticker.add(updateFrame);
            return masterST;
        };

        let st;
        let isStarted = false;
        const prepare = () => {
            if (video.readyState >= 1 && !isStarted) {
                isStarted = true;
                initScene().then(res => st = res);
            }
        };

        // Multi-event listener for cross-browser safety
        video.addEventListener("loadedmetadata", prepare);
        video.addEventListener("canplay", prepare);
        if (video.readyState >= 2) prepare();

        return () => {
            gsap.ticker.remove(updateFrame);
            ScrollTrigger.getAll().forEach((t) => t.kill());
            if (st) st.kill();
            video.removeEventListener("loadedmetadata", prepare);
            video.removeEventListener("canplay", prepare);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full bg-[#050505] overflow-hidden">
            <section
                ref={sectionRef}
                className="relative h-screen w-full flex items-center justify-center will-change-transform"
            >
                {/* BACKDROP ENGINE: scale-110 matched in GSAP baseline */}
                <video
                    ref={videoRef}
                    src="/volvo.mp4"
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover scale-[1.1] pointer-events-none opacity-90"
                />

                {/* CINEMATIC OVERLAYS */}
                <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 z-10 pointer-events-none" />

                {/* DUAL-COLUMN OVERLAY */}
                <div className="relative z-20 w-full max-w-7xl px-8 lg:px-12">
                    <AnimatePresence>
                        {showOverlay && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="grid md:grid-cols-2 gap-12 items-end"
                            >
                                <motion.div
                                    initial={{ x: -60, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 1, delay: 0.2, ease: "circOut" }}
                                    className="flex flex-col gap-6"
                                >
                                    <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none italic drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                                        OnWay<span className="text-green-500 not-italic">.</span>
                                    </h1>
                                    <p className="text-white/60 text-lg md:text-xl font-bold max-w-md leading-relaxed">
                                        Wherever You’re Going,<br /> We’re Already On The Way.
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ x: 60, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 1, delay: 0.4, ease: "circOut" }}
                                    className="flex flex-col gap-8 md:items-end text-right"
                                >
                                    <div className="flex flex-col gap-2">
                                        <span className="text-green-500 text-6xl font-black italic">01</span>
                                        <p className="text-white/40 text-xs uppercase tracking-[0.5em] font-bold">
                                            Premium Standards
                                        </p>
                                    </div>
                                    <div className="h-[1px] w-24 bg-white/20 ml-auto" />
                                    <p className="text-white/40 text-sm max-w-[280px] leading-loose">
                                        Experience the future of mobility with our dedicated concierge services and cinematic journeys.
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* SCROLL PROMPT */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="flex flex-col items-center gap-3"
                    >
                        <div className="w-[1.5px] h-12 bg-white/20 overflow-hidden relative">
                            <motion.div
                                animate={{ y: [-48, 48] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-full h-8 bg-white/60 absolute top-0"
                            />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
                            Story
                        </span>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default MainHero;