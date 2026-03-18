"use client";
import { useEffect, useState, useRef } from "react";

const ScrollProgress = ({ children }) => {
    const [progress, setProgress] = useState(0);
    const [scrolling, setScrolling] = useState(false);
    const scrollTimeout = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop =
                window.scrollY ||
                document.documentElement.scrollTop;

            const scrollHeight =
                document.documentElement.scrollHeight -
                document.documentElement.clientHeight;

            const percent =
                scrollHeight > 0
                    ? (scrollTop / scrollHeight) * 100
                    : 0;

            setProgress(percent);

            // scrolling detect
            setScrolling(true);
            clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                setScrolling(false);
            }, 700);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () =>
            window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const radius = 20;
    const stroke = 4;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference =
        normalizedRadius * 2 * Math.PI;

    const strokeDashoffset =
        circumference - (progress / 100) * circumference;

    return (
        <>
            {/* Floating Circle */}
            <div
                onClick={scrollToTop}
                className="fixed bottom-14 left-4 z-9999 cursor-pointer group"
            >
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="drop-shadow-xl"
                >
                    {/* bg */}
                    <circle
                        stroke="#e5e7eb"
                        fill="#fffcfd"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />

                    {/* progress */}
                    <circle
                        stroke="#2cbe6b"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={`${circumference} ${circumference}`}
                        style={{
                            strokeDashoffset,
                            transition: "stroke-dashoffset .2s linear",
                            transform: "rotate(-90deg)",
                            transformOrigin: "50% 50%",
                        }}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />

                    {/* dynamic text */}
                    <text
                        x="50%"
                        y="60%"
                        textAnchor="middle"
                        fontSize="16px"
                        fontWeight="bold"
                        fill="#001820"
                    >
                        {scrolling ? `${Math.round(progress)}` : "▲"}
                    </text>
                </svg>
            </div>

            {/* Page Content */}
            {children}
        </>
    );
};

export default ScrollProgress;