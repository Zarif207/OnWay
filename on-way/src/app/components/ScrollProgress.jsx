"use client";
import { useEffect, useState, useRef } from "react";

const ScrollProgress = ({ children }) => {
    const [progress, setProgress] = useState(0);
    const [scrolling, setScrolling] = useState(false);
    const scrollTimeout = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const currentPosition = window.scrollY;
            const percent = totalHeight > 0 ? (currentPosition / totalHeight) * 100 : 0;
            setProgress(percent);

            setScrolling(true);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                setScrolling(false);
            }, 500);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <>
            <div
                onClick={scrollToTop}
                className="fixed bottom-14 left-4 z-9999 cursor-pointer group scale-90 hover:scale-100 transition-transform active:scale-95"
            >
                <svg height="45" width="45" className="drop-shadow-xl">
                    <circle stroke="#e5e7eb" fill="#fff" strokeWidth="4" r="18" cx="22.5" cy="22.5" />
                    <circle
                        stroke="#2cbe6b"
                        fill="transparent"
                        strokeWidth="4"
                        strokeDasharray="113"
                        style={{
                            strokeDashoffset: 113 - (progress / 100) * 113,
                            transition: "stroke-dashoffset 0.1s linear",
                            transform: "rotate(-90deg)",
                            transformOrigin: "22.5px 22.5px",
                        }}
                        r="18" cx="22.5" cy="22.5"
                    />
                    <text x="50%" y="58%" textAnchor="middle" fontSize="12px" fontWeight="bold" fill="#0a1f3d">
                        {scrolling ? `${Math.round(progress)}` : "▲"}
                    </text>
                </svg>
            </div>
            {children}
        </>
    );
};

export default ScrollProgress;