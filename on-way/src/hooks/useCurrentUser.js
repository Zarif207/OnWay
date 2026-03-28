"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export const useCurrentUser = () => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (status === "loading") return;
            
            if (status === "authenticated" && session?.user?.email) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passenger/find?email=${session.user.email}`);
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
        };

        fetchUserData();
    }, [session?.user?.email, status]);

    return { user, isLoading, status };
};

// "use client";
// import { useSession } from "next-auth/react";

// export const useCurrentUser = () => {
//     const { data: session, status } = useSession();

//     const user = session?.user || null;

//     return { 
//         user, 
//         isLoading: status === "loading", 
//         status 
//     };
// };