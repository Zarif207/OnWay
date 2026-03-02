"use client";
import { useEffect, useState, useCallback } from "react";

const ScrollProgress = ({ children }) => {
    const [scrollWidth, setScrollWidth] = useState(0);
    const handleScroll = useCallback(() => {
        const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        if (totalHeight > 0) {
            const percentage = (currentScroll / totalHeight) * 100;
            setScrollWidth(Math.min(percentage, 100));
        }
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll);
        handleScroll();
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, [handleScroll]);

    return (
        <>
            <div
                className="fixed top-0 left-0 w-full pointer-events-none"
                style={{
                    zIndex: 99999,
                    height: '4px'
                }}
            >
                <div
                    className="h-full bg-primary transition-all duration-150 rounded-r-full ease-out"
                    style={{
                        width: `${scrollWidth}%`,
                        backgroundColor: '#001820'
                    }}
                ></div>
            </div>
            {/* Page Content */}
            {children}
        </>
    );
};

export default ScrollProgress;