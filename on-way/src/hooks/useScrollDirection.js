"use client";

import { useState, useEffect } from "react";

export function useScrollDirection() {
    const [scrollDirection, setScrollDirection] = useState("up");
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        let requestRunning = false;

        const updateScrollDirection = () => {
            const scrollY = window.pageYOffset;

            if (Math.abs(scrollY - lastScrollY) < 10) {
                requestRunning = false;
                return;
            }

            const direction = scrollY > lastScrollY ? "down" : "up";

            if (direction !== scrollDirection && (scrollY > 10 || scrollY < 10)) {
                setScrollDirection(direction);
            }

            setLastScrollY(scrollY > 0 ? scrollY : 0);
            requestRunning = false;
        };

        const onScroll = () => {
            if (!requestRunning) {
                window.requestAnimationFrame(updateScrollDirection);
                requestRunning = true;
            }
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [scrollDirection, lastScrollY]);

    return scrollDirection;
}
