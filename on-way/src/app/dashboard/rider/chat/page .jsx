"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import RiderChat from "@/components/dashboard/RiderChat";
import SupportChat from "@/components/dashboard/SupportChat";
import {
    User,
    Headset,
    MessageSquare,
    Search,
    ChevronRight,
    Circle,
    Bell,
    ShieldAlert,
    Clock
} from "lucide-react";

const SupportAgentDashboard = () => {
    const { user, isLoading } = useCurrentUser();
    const [activeChatId, setActiveChatId] = useState("chat_1");
    const [viewMode, setViewMode] = useState("passenger");

    const [activeTickets] = useState([
        {
            id: "chat_1",
            name: "Shourav Hasan",
            lastMsg: "I can't find my rider.",
            time: "2m ago",
            status: "active",
            type: "passenger",
            avatar: "S"
        },
        {
            id: "chat_2",
            name: "Ariful Islam",
            lastMsg: "Payment issue on last ride",
            time: "15m ago",
            status: "idle",
            type: "passenger",
            avatar: "A"
        }
    ]);

    if (isLoading) return (
        <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-40px)] bg-[#050505] text-white overflow-hidden rounded-3xl border border-white/5 shadow-2xl mx-4 my-4">

            {/* --- Left Sidebar: Ticket List --- */}
            <div className="w-full md:w-85 border-r border-white/10 flex flex-col bg-[#0d0d0d]">
                <div className="p-6 pb-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold tracking-tight">Support Inbox</h2>
                        <div className="relative">
                            <Bell size={18} className="text-gray-400 cursor-pointer hover:text-white transition-all" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or ticket ID..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-blue-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex px-6 gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 mb-2">
                    <button className="text-blue-500 border-b border-blue-500 pb-1">All Tickets</button>
                    <button className="hover:text-white transition-colors">Emergency</button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
                    {activeTickets.map((ticket) => (
                        <button
                            key={ticket.id}
                            onClick={() => {
                                setActiveChatId(ticket.id);
                                setViewMode("passenger");
                            }}
                            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${activeChatId === ticket.id
                                ? "bg-blue-600/10 border border-blue-500/20 shadow-inner"
                                : "hover:bg-white/5 border border-transparent"
                                }`}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center text-sm font-bold border border-white/10">
                                    {ticket.avatar}
                                </div>
                                {ticket.status === "active" && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0d0d0d] rounded-full"></span>
                                )}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm font-bold truncate">{ticket.name}</p>
                                    <span className="text-[9px] text-gray-500 shrink-0">{ticket.time}</span>
                                </div>
                                <p className="text-[11px] text-gray-400 truncate opacity-70 italic">"{ticket.lastMsg}"</p>
                            </div>
                        </button>
                    ))}

                    {/* Admin/Supervisor Support Chat */}
                    <button
                        onClick={() => setViewMode("admin")}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all mt-4 border-t border-white/5 ${viewMode === "admin" ? "bg-green-600/10 border-green-500/20" : "hover:bg-white/5"
                            }`}
                    >
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 border border-green-500/20">
                            <ShieldAlert size={20} />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-sm font-bold">Internal Support</p>
                            <p className="text-[10px] text-green-500/60 font-medium italic">Supervisor Online</p>
                        </div>
                    </button>
                </div>

                {/* Agent Profile Footer */}
                <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 p-0.5">
                            <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-xs font-black">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-white leading-none mb-1">{user?.name}</p>
                            <div className="flex items-center gap-1">
                                <Circle size={8} className="fill-green-500 text-green-500 animate-pulse" />
                                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Support Expert</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Dashboard View --- */}
            <div className="flex-1 flex flex-col relative bg-[#080808]">

                {/* Dashboard Header */}
                <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${viewMode === 'passenger' ? 'bg-blue-500/10 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-green-500/10 text-green-500'}`}>
                            {viewMode === 'passenger' ? <MessageSquare size={22} /> : <Headset size={22} />}
                        </div>
                        <div>
                            <h3 className="text-base font-bold tracking-tight">
                                {viewMode === 'passenger' ? `Assisting: ${activeTickets.find(t => t.id === activeChatId)?.name}` : "Manager / Supervisor Desk"}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                <span className="flex items-center gap-1 uppercase font-bold tracking-widest"><Clock size={10} /> Response Goal: 1m 30s</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="hidden sm:flex px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-bold transition-all border border-white/5">
                            Transfer Ticket
                        </button>
                        <button className="px-4 py-2 rounded-xl bg-red-600/20 text-red-500 text-[11px] font-bold hover:bg-red-600 hover:text-white transition-all border border-red-500/20">
                            Mark as Resolved
                        </button>
                    </div>
                </div>

                {/* Support Conversation Window */}
                <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
                    {/* Background Decor */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

                    <div className="w-full max-w-3xl h-full flex items-center justify-center relative z-10">
                        {viewMode === "passenger" ? (
                            <RiderChat rideId={activeChatId} user={user} />
                        ) : (
                            <SupportChat passengerId={user._id} user={user} />
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SupportAgentDashboard;