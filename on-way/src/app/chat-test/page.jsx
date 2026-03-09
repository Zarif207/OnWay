"use client";

import { useState } from "react";
import RiderChat from "@/components/dashboard/RiderChat";
import SupportChat from "@/components/dashboard/SupportChat";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { MessageSquare, LifeBuoy, ShieldCheck, Clock } from "lucide-react";

const Chat = () => {
    const { user, isLoading } = useCurrentUser();
    const [activeTab, setActiveTab] = useState("rider"); 

    const [activeRide] = useState({
        _id: "69a5f69a18d89b9a3381bbf0",
        riderName: "Karim Ullah",
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
                <p className="text-gray-400 text-sm animate-pulse">Initializing Secure Chat...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                    <ShieldCheck size={40} className="text-red-500" />
                </div>
                <h2 className="text-white text-xl font-bold">Access Denied</h2>
                <p className="text-gray-400 max-w-xs mt-2 text-sm">Please log in to your OnWay account to access the message center.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 relative">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-600 w-2 h-6 rounded-full"></span>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Message Center</h1>
                    </div>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                        <Clock size={14} /> Real-time communication with OnWay network.
                    </p>
                </div>
            </div>

            {/* Custom Navigation Tabs */}
            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 mb-8 max-w-md shadow-2xl backdrop-blur-md">
                <button
                    onClick={() => setActiveTab("rider")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-500 transform ${
                        activeTab === "rider"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-100"
                            : "text-gray-400 hover:text-white hover:bg-white/5 scale-95"
                    }`}
                >
                    <MessageSquare size={18} />
                    Rider Chat
                </button>
                <button
                    onClick={() => setActiveTab("support")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-500 transform ${
                        activeTab === "support"
                            ? "bg-green-600 text-white shadow-lg shadow-green-600/20 scale-100"
                            : "text-gray-400 hover:text-white hover:bg-white/5 scale-95"
                    }`}
                >
                    <LifeBuoy size={18} />
                    OnWay Support
                </button>
            </div>

            {/* Content Container */}
            <div className="grid grid-cols-1 gap-8 items-start">
                <div className="relative min-h-[500px] w-full flex justify-center">
                    {activeTab === "rider" ? (
                        <div className="w-full flex justify-center animate-in fade-in zoom-in-95 duration-300">
                            {activeRide?._id ? (
                                <RiderChat rideId={activeRide._id} user={user} />
                            ) : (
                                <div className="text-center p-16 bg-white/5 rounded-[40px] border border-dashed border-white/10 w-full max-w-sm">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                        <MessageSquare className="text-gray-600" />
                                    </div>
                                    <p className="text-gray-500 italic text-sm">No active ride chat found.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full flex justify-center animate-in fade-in zoom-in-95 duration-300">
                            <SupportChat passengerId={user._id} user={user} />
                        </div>
                    )}
                </div>
            </div>

            {/* Abstract Background Glows */}
            <div className="fixed top-1/4 -left-20 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
            <div className="fixed bottom-1/4 -right-20 w-[300px] h-[300px] bg-green-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        </div>
    );
};

export default Chat;