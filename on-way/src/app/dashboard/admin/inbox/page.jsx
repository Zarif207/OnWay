"use client";
import toast from "react-hot-toast";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
    MessageSquare, Send, Paperclip, Loader2,
    Search as SearchIcon, ChevronLeft, CheckCheck,
    Compass, ShieldCheck, Lock, Phone, Video,
    LayoutDashboard, Users, Car, Headphones,
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useRequireRole } from "@/hooks/useAuth";
import CallModal from "@/components/dashboard/CallModal";

const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:4002";

// ── Tab config ───────────────────────────────────────────────
// Passenger → support chat (chatType: "support", passengerId: set)
// Rider     → support chat (chatType: "support", riderId: set)
// Support   → admin chat   (chatType: "admin")
const TABS = [
    { key: "passengers", label: "Passengers", icon: Users, color: "emerald" },
    { key: "riders", label: "Riders", icon: Car, color: "blue" },
    { key: "support", label: "Support", icon: Headphones, color: "purple" },
];

const TAB_COLOR = {
    passengers: { bg: "bg-emerald-50", text: "text-emerald-600", active: "bg-emerald-600", badge: "bg-emerald-600", mine: "bg-gray-900 text-white" },
    riders: { bg: "bg-blue-50", text: "text-blue-600", active: "bg-blue-600", badge: "bg-blue-600", mine: "bg-gray-900 text-white" },
    support: { bg: "bg-purple-50", text: "text-purple-600", active: "bg-purple-600", badge: "bg-purple-600", mine: "bg-gray-900 text-white" },
};

export default function AdminDashboard() {
    const { user: adminUser, isLoading: authLoading } = useRequireRole("admin");

    const [activeTab, setActiveTab] = useState("passengers");
    const [sessions, setSessions] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [input, setInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [showMobileList, setShowMobileList] = useState(true);
    const [stats, setStats] = useState(null);

    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeout = useRef(null);
    const tc = TAB_COLOR[activeTab];

    // ── roomId ───────────────────────────────────────────────────
    const roomId = useMemo(() => selectedChat?.roomId || null, [selectedChat]);

    // ── chatType — support tab = "admin" (admin ↔ support agent) ─
    const chatType = useMemo(() => {
        if (activeTab === "support") return "admin";
        return "support";
    }, [activeTab]);

    // ── otherUserId for calls ────────────────────────────────────
    const otherUserId = useMemo(() => {
        if (!selectedChat) return null;
        if (activeTab === "passengers") return selectedChat.passengerId || null;
        if (activeTab === "riders") return selectedChat.riderId || null;
        if (activeTab === "support") return selectedChat.senderId || null;
        return null;
    }, [activeTab, selectedChat]);

    // ── useChat ──────────────────────────────────────────────────
    const {
        messages, sendMessage, typingUser, sendTyping, stopTyping,
        socket, markAsRead, onlineStatus, loading: messagesLoading,
        sendError, clearSendError, callError, clearCallError,
        startCall, acceptCall, endCall,
        incomingCall, callActive, calling,
        localStreamRef, remoteStreamRef,
    } = useChat(
        roomId, chatType,
        adminUser?._id || adminUser?.id,
        adminUser?.name || "Admin",
        "admin",
        otherUserId
    );

    // ── Fetch sessions by tab ────────────────────────────────────
    const fetchSessions = useCallback(async () => {
        try {
            let url = "";
            // Passengers tab → passenger support sessions
            if (activeTab === "passengers")
                url = `${CHAT_URL}/api/support/sessions`;
            // Riders tab → rider support sessions
            else if (activeTab === "riders")
                url = `${CHAT_URL}/api/rider/support-sessions`;
            // Support tab → support agent ↔ admin chats
            else if (activeTab === "support")
                url = `${CHAT_URL}/api/admin/support-chats`;

            const res = await fetch(url);
            const data = await res.json();
            setSessions(Array.isArray(data) ? data : []);
        } catch (err) { console.error("Fetch sessions error:", err); }
    }, [activeTab]);

    // ── Fetch stats ──────────────────────────────────────────────
    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch(`${CHAT_URL}/api/admin/stats`);
            const data = await res.json();
            setStats(data);
        } catch (err) { console.error("Stats error:", err); }
    }, []);

    useEffect(() => { fetchSessions(); fetchStats(); }, [fetchSessions, fetchStats]);

    // ── Tab switch — clear ────────────────────────────────────────
    useEffect(() => {
        setSelectedChat(null);
        setShowMobileList(true);
        setSearchQuery("");
        setSessions([]);
    }, [activeTab]);

    // ── Socket events ────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;
        const onUpdate = () => { fetchSessions(); fetchStats(); };
        socket.on("adminNotification", onUpdate);
        socket.on("adminSessionUpdated", onUpdate);
        socket.on("supportSessionUpdated", onUpdate);
        socket.on("receiveMessage", onUpdate);
        return () => {
            socket.off("adminNotification", onUpdate);
            socket.off("adminSessionUpdated", onUpdate);
            socket.off("supportSessionUpdated", onUpdate);
            socket.off("receiveMessage", onUpdate);
        };
    }, [socket, fetchSessions, fetchStats]);

    // ── Mark read ────────────────────────────────────────────────
    useEffect(() => {
        if (!roomId || !socket) return;
        markAsRead();
        const t = setTimeout(() => fetchSessions(), 300);
        return () => clearTimeout(t);
    }, [roomId, socket, messages.length, markAsRead, fetchSessions]);

    // ── Auto scroll ──────────────────────────────────────────────
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, typingUser]);

    // ── Toast on call error ──────────────────────────────────────
    useEffect(() => {
        if (!callError) return;
        toast.error(callError, {
            duration: 4000,
            style: { background: "#1f2937", color: "#f9fafb", fontWeight: "700", borderRadius: "16px", fontSize: "13px" },
        });
        clearCallError();
    }, [callError, clearCallError]);

    // ── Select chat ──────────────────────────────────────────────
    const handleSelect = (s) => {
        setSelectedChat({
            roomId: s.roomId,
            name: s.senderName || "Unknown",
            passengerId: s.passengerId || null,
            riderId: s.riderId || null,
            senderId: s.senderId || null,
            chatType: s.chatType || "support",
        });
        setShowMobileList(false);
    };

    // ── Send ─────────────────────────────────────────────────────
    const handleSend = async (text = input, fileUrl = null, type = "text") => {
        if ((!text.trim() && !fileUrl) || !roomId) return;
        await sendMessage(text, fileUrl, type);
        setInput("");
        stopTyping();
    };

    const onInputChange = (val) => {
        setInput(val);
        sendTyping();
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => stopTyping(), 2000);
    };

    // ── File upload ──────────────────────────────────────────────
    const handleFileUpload = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        setIsUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "onway_preset");
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
            const data = await res.json();
            if (data.secure_url) handleSend("", data.secure_url, "image");
        } catch (err) { console.error("Upload failed:", err); }
        finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
    };

    // ── Filtered sessions ────────────────────────────────────────
    const filteredSessions = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return sessions.filter(s =>
            (s.senderName || "").toLowerCase().includes(q) ||
            (s.passengerId || "").toLowerCase().includes(q) ||
            (s.riderId || "").toLowerCase().includes(q)
        );
    }, [sessions, searchQuery]);

    // ── Online id for session list ───────────────────────────────
    const getOnlineId = (s) => {
        if (activeTab === "passengers") return s.passengerId;
        if (activeTab === "riders") return s.riderId;
        return s.senderId;
    };

    if (authLoading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F8F9FD] text-emerald-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Loading Admin Dashboard...</p>
        </div>
    );

    if (!adminUser) return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <Lock size={40} className="mb-4 text-red-500" />
            <p className="text-sm font-bold">Admin Access Required</p>
        </div>
    );

    // ════════════════════════════════════════════════════════════
    return (
        <div className="flex h-screen text-gray-700 font-sans overflow-hidden p-4">
            <div className="max-w-425 w-full mx-auto bg-white md:rounded-[2.5rem] flex overflow-hidden border border-gray-100 relative h-full">

                {/* ══ SIDEBAR ═══════════════════════════════════════════ */}
                <aside className={`${showMobileList ? "flex" : "hidden md:flex"} w-full md:w-50 lg:w-87.5 flex-col border-r border-gray-50 shrink-0 h-full`}>
                    <div className="p-8 space-y-5">

                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center shrink-0">
                                <LayoutDashboard size={18} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Admin</h1>
                                <p className="text-gray-400 text-[10px] font-black tracking-[0.3em] uppercase">Control Panel</p>
                            </div>
                        </div>

                        {/* ── 3 Tabs ── */}
                        <div className="flex gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-100">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                        className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all text-[9px] font-black uppercase tracking-wider
                                            ${activeTab === tab.key
                                                ? TAB_COLOR[tab.key].active + " text-white shadow-sm"
                                                : "text-gray-400 hover:text-gray-600"}`}>
                                        <Icon size={13} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="text" placeholder="Search..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-gray-100 rounded-[1.8rem] py-3.5 pl-12 pr-6 text-sm outline-none focus:border-emerald-500 shadow-sm font-bold" />
                        </div>
                    </div>

                    {/* Session list */}
                    <div className="flex-1 overflow-y-auto px-4 pb-8">
                        {filteredSessions.length === 0 ? (
                            <div className="p-16 text-center opacity-30">
                                <Compass size={48} className="mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase">No sessions</p>
                            </div>
                        ) : filteredSessions.map((s) => {
                            const isActive = roomId === s.roomId;
                            const onlineId = getOnlineId(s);
                            return (
                                <button key={s._id || s.roomId} onClick={() => handleSelect(s)}
                                    className={`w-full p-5 mb-2 flex items-center gap-4 rounded-[2.2rem] transition-all
                                        ${isActive ? "bg-white shadow-lg border border-gray-100" : "hover:bg-gray-50"}`}>
                                    <div className="relative shrink-0">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black uppercase ${tc.bg} ${tc.text}`}>
                                            {(s.senderName || "?")[0]}
                                        </div>
                                        {onlineStatus?.[onlineId] === "online" && (
                                            <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-4 border-white animate-pulse ${tc.badge}`} />
                                        )}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="font-black truncate uppercase text-sm">{s.senderName || "Unknown"}</h4>
                                            {s.lastMessageTime && (
                                                <span className="text-[10px] text-gray-400 font-bold shrink-0">
                                                    {new Date(s.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs truncate font-bold ${s.unreadCount > 0 ? tc.text : "text-gray-400"}`}>
                                            {s.lastMessage || "No messages yet"}
                                        </p>
                                    </div>
                                    {s.unreadCount > 0 && (
                                        <span className={`text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${tc.badge}`}>
                                            {s.unreadCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* ══ CHAT AREA ═════════════════════════════════════════ */}
                <main className={`${!showMobileList || !selectedChat ? "flex" : "hidden md:flex"} flex-1 flex-col bg-white relative h-full`}>
                    {selectedChat ? (
                        <>
                            {/* HEADER */}
                            <header className="h-24 px-8 border-b border-gray-50 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4 min-w-0">
                                    <button onClick={() => setShowMobileList(true)} className="md:hidden p-2 shrink-0">
                                        <ChevronLeft />
                                    </button>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black uppercase shrink-0 ${tc.bg} ${tc.text}`}>
                                        {selectedChat.name?.[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-black tracking-tighter text-gray-900 uppercase italic truncate">
                                            {selectedChat.name}
                                        </h3>
                                        <span className={`text-[9px] font-black tracking-widest uppercase
                                            ${onlineStatus?.[otherUserId] === "online" ? "text-emerald-500" : "text-gray-400"}`}>
                                            {onlineStatus?.[otherUserId] === "online" ? "● Online" : "○ Offline"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => startCall(otherUserId, { video: true, audio: true })}
                                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors">
                                        <Video size={14} /> Video
                                    </button>
                                    <button onClick={() => startCall(otherUserId, { video: false, audio: true })}
                                        className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors">
                                        <Phone size={14} /> Audio
                                    </button>
                                </div>
                            </header>

                            {/* MESSAGES */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-4 bg-[#FAFAFF]/40">
                                {messagesLoading && messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full opacity-50">
                                        <Loader2 className="animate-spin text-emerald-500" />
                                        <p className="text-[10px] mt-2 font-bold uppercase">Syncing...</p>
                                    </div>
                                ) : messages.length > 0 ? (
                                    messages.map((m, i) => {
                                        const adminId = String(adminUser?._id || adminUser?.id);
                                        const isMine = m.senderId === adminId || m.senderRole === "admin";

                                        // Sender label — who sent this message
                                        const senderLabel =
                                            m.senderRole === "support" ? "Support Agent" :
                                                m.senderRole === "rider" ? "Rider" :
                                                    m.senderRole === "passenger" ? "Passenger" : null;

                                        return (
                                            <div key={m._id || i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                                <div className="max-w-[80%] flex flex-col gap-1">
                                                    {!isMine && senderLabel && (
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 ${tc.text}`}>
                                                            {senderLabel}
                                                        </span>
                                                    )}
                                                    <div className={`p-5 rounded-4xl shadow-sm
                                                        ${isMine
                                                            ? "bg-gray-900 text-white rounded-tr-none"
                                                            : `${tc.bg} border border-gray-100 text-gray-700 rounded-tl-none`}`}>
                                                        {m.messageType === "image" ? (
                                                            <img src={m.fileUrl} alt="attachment" className="rounded-xl max-h-60 object-cover" />
                                                        ) : (
                                                            <p className="font-bold text-sm leading-relaxed">{m.message}</p>
                                                        )}
                                                        <div className="mt-2 flex items-center gap-2 justify-end opacity-60 text-[9px] font-black uppercase">
                                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                            {isMine && <CheckCheck size={12} className={m.isRead ? "text-emerald-400" : "text-white/50"} />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                                        <Lock size={40} className="mb-4" />
                                        <p className="text-xs font-black uppercase">No messages yet</p>
                                    </div>
                                )}
                                {typingUser && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-100 rounded-4xl rounded-tl-none px-5 py-3 shadow-sm">
                                            <p className={`text-[10px] font-black animate-pulse uppercase tracking-widest ${tc.text}`}>
                                                {typingUser} typing...
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* INPUT */}
                            <footer className="p-6 border-t border-gray-50 shrink-0">
                                {sendError && (
                                    <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center justify-between text-xs font-bold">
                                        <div className="flex items-center gap-2"><ShieldCheck size={16} /> Send failed</div>
                                        <button onClick={clearSendError} className="px-3 py-1 bg-red-100 rounded-xl font-black text-[10px]">Dismiss</button>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-[2.5rem] border border-gray-100 focus-within:bg-white transition-all">
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                                        className="p-4 text-gray-400 hover:text-gray-600 transition-colors">
                                        {isUploading ? <Loader2 size={22} className="animate-spin" /> : <Paperclip size={22} />}
                                    </button>
                                    <input value={input} onChange={(e) => onInputChange(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                        placeholder={
                                            activeTab === "support" ? "Reply to support agent..." :
                                                activeTab === "riders" ? "Reply to rider..." :
                                                    "Reply to passenger..."
                                        }
                                        className="flex-1 bg-transparent py-3 outline-none font-bold text-gray-800" />
                                    <button onClick={() => handleSend()} disabled={!input.trim() && !isUploading}
                                        className="bg-gray-900 hover:bg-gray-700 text-white p-4 rounded-full disabled:bg-gray-200 shadow-lg transition-colors">
                                        <Send size={20} />
                                    </button>
                                </div>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30">
                            <MessageSquare size={80} className="mb-6" />
                            <h3 className="text-2xl font-black uppercase tracking-widest">Select a session</h3>
                            <p className="text-sm font-bold mt-2 uppercase tracking-wider opacity-60">
                                {activeTab === "passengers" && "Passenger support messages"}
                                {activeTab === "riders" && "Rider support messages"}
                                {activeTab === "support" && "Support agent messages"}
                            </p>
                        </div>
                    )}
                </main>
            </div>

            {/* Incoming call */}
            {incomingCall && !callActive && (
                <div className="fixed bottom-8 right-8 bg-white shadow-2xl rounded-3xl p-6 border border-gray-100 z-998 min-w-65">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-lg">
                            {incomingCall.callType === "audio" ? "🎧" : "📹"}
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                Incoming {incomingCall.callType === "audio" ? "Voice" : "Video"} Call
                            </p>
                            <h4 className="font-black text-sm uppercase text-gray-900">
                                {selectedChat?.name || "Unknown"}
                            </h4>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={acceptCall}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors">
                            Accept
                        </button>
                        <button onClick={endCall}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors">
                            Reject
                        </button>
                    </div>
                </div>
            )}

            <CallModal
                callActive={callActive}
                calling={calling}
                localStreamRef={localStreamRef}
                remoteStreamRef={remoteStreamRef}
                endCall={endCall}
                callerName={selectedChat?.name || "Admin"}
                callType={incomingCall?.callType || "video"}
            />
        </div>
    );
}