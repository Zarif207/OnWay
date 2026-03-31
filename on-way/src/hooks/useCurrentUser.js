"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

export const useCurrentUser = () => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserData = useCallback(async () => {
        if (status === "loading") return;
        if (status === "authenticated" && session?.user?.email) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passenger/find?email=${session.user.email}&t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (error) {
                console.error("Error loading user data:", error);
            } finally {
                setIsLoading(false);
            }
        } else if (status === "unauthenticated") {
            setUser(null);
            setIsLoading(false);
        }
    }, [session?.user?.email, status]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // Re-fetch when profile is updated from any dashboard
    useEffect(() => {
        const handler = () => fetchUserData();
        window.addEventListener("profile:updated", handler);
        return () => window.removeEventListener("profile:updated", handler);
    }, [fetchUserData]);

    return { user, isLoading, status, refetch: fetchUserData };
};
