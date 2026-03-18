"use client";
import { useRef } from "react";

export default function AnimatedButton({
    children,
    className = "",
    onClick,
    type = "button",
}) {
    const buttonRef = useRef(null);

    const updatePosition = (e) => {
        const btn = buttonRef.current;
        if (!btn) return;

        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        btn.style.setProperty("--x", `${x}px`);
        btn.style.setProperty("--y", `${y}px`);
    };

    return (
        <button
            ref={buttonRef}
            type={type}
            onMouseEnter={updatePosition}
            onMouseMove={updatePosition}
            onClick={onClick}
            className={`animated-btn relative overflow-hidden bg-secondary text-white hover:bg-primary transition-all duration-300 ease-in-out hover:-translate-y-[1px] hover:shadow-md rounded-lg px-6 py-3 text-sm font-bold tracking-widest ${className}`}
        >
            {/* Button Content */}
            <span className="relative z-10 flex items-center justify-center gap-2 pointer-events-none">
                {children}
            </span>

            {/* Expanding Ripple Circle */}
            <span className="circle pointer-events-none absolute" />
        </button>
    );
}