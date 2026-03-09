"use client";

import { useState, useEffect } from "react";
import RiderChat from "@/components/dashboard/RiderChat";
import SupportChat from "@/components/dashboard/SupportChat";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { MessageSquare, LifeBuoy, ShieldCheck, Clock } from "lucide-react";

const API_URL2 = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const Chat = () => {

    const { user, isLoading } = useCurrentUser();

    const [activeTab, setActiveTab] = useState("rider");
    const [activeRide, setActiveRide] = useState(null);
    const [loadingRide, setLoadingRide] = useState(true);

    // =========================
    // FETCH USER ACTIVE RIDE
    // =========================

    useEffect(() => {
        if (!user?._id) return;

        const fetchRide = async () => {
            let data; // try-এর বাইরে ডিক্লেয়ার করা
            try {
                const res = await fetch(`${API_URL2}/passenger/${user._id}`);
                data = await res.json();

                console.log(data.ride); // এখানে console.log ঠিক আছে

                if (data?.ride) {
                    setActiveRide(data.ride);
                }

            } catch (err) {
                console.error("Ride fetch error:", err);
            } finally {
                setLoadingRide(false);
                console.log(data);
                console.log(user._id);
            }
        };

        fetchRide();
    }, [user]);

    // =========================
    // LOADING
    // =========================

    if (isLoading || loadingRide) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm animate-pulse">
                    Loading Chat System...
                </p>
            </div>
        );
    }

    // =========================
    // NOT LOGGED IN
    // =========================

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <ShieldCheck size={40} className="text-red-500" />
                <h2 className="text-white text-xl font-bold mt-3">
                    Access Denied
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                    Please login to access the chat system.
                </p>
            </div>
        );
    }

    return (

        <div className="max-w-5xl mx-auto p-4 md:p-8">

            {/* HEADER */}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">
                    Message Center
                </h1>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                    <Clock size={14} /> Real-time communication
                </p>
            </div>

            {/* TABS */}

            <div className="flex bg-white/5 p-1.5 rounded-xl border border-white/10 mb-8 max-w-md">

                <button
                    onClick={() => setActiveTab("rider")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition ${activeTab === "rider"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400"
                        }`}
                >
                    <MessageSquare size={18} />
                    Rider Chat
                </button>

                <button
                    onClick={() => setActiveTab("support")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition ${activeTab === "support"
                        ? "bg-green-600 text-white"
                        : "text-gray-400"
                        }`}
                >
                    <LifeBuoy size={18} />
                    Support
                </button>

            </div>

            {/* CHAT CONTAINER */}

            <div className="flex justify-center">

                {activeTab === "rider" ? (

                    activeRide?._id ? (

                        <RiderChat
                            rideId={activeRide._id}
                            user={user}
                        />

                    ) : (

                        <div className="text-center p-10 bg-white/5 rounded-xl border border-dashed border-white/10">

                            <MessageSquare className="mx-auto text-gray-500 mb-3" />

                            <p className="text-gray-400 text-sm">
                                No active ride found
                            </p>

                        </div>

                    )

                ) : (

                    <SupportChat
                        passengerId={user._id}
                        user={user}
                    />

                )}

            </div>

        </div>

    );

};

export default Chat;