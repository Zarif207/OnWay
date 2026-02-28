"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export const useCurrentRider = () => {
    const { data: session, status } = useSession();
    const [rider, setRider] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRiderData = async () => {
            // Loading state maintain korar jonno
            if (status === "loading") return;

            if (status === "authenticated" && session?.user?.email) {
                try {
                    // API endpoint-ti ekhane 'rider'-er jonno change kora hoyeche
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rider`);
                    
                    if (!res.ok) {
                        throw new Error("Failed to fetch rider data");
                    }
                    
                    const data = await res.json();
                    setRider(data);
                } catch (error) {
                    console.error("Error loading rider data:", error);
                } finally {
                    setIsLoading(false);
                }
            } else if (status === "unauthenticated") {
                setIsLoading(false);
            }
        };

        fetchRiderData();
    }, [session, status]);

    return { rider, isLoading, status };
};