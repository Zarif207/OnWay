"use client";
import toast from "react-hot-toast";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
    MessageSquare, Send, Paperclip, CheckCheck,
    Loader2, Search as SearchIcon, ChevronLeft,
    ShieldCheck, Lock, Compass, Phone, Video,
    ShieldAlert, Users, Car,
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useRequireRole } from "@/hooks/useAuth";
import CallModal from "@/components/dashboard/CallModal";
import SupportLoading from "../SupportLoading";

const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:4002";

const TABS = [
    { key: "passengers", label: "Passengers", icon: Users },
    { key: "riders", label: "Riders", icon: Car },
    { key: "admin", label: "Admin", icon: ShieldAlert },
];

// ─── Tab-এর রঙ ──────────────────────────────────────────────
const TAB_STYLE = {
    passengers: {
        active: "bg-emerald-600 text-white",
        avatar: "bg-emerald-50 text-emerald-600",
        dot: "bg-emerald-500",
        unread: "bg-emerald-600",
        bubble: "bg-white border border-gray-100 text-gray-700",
        mine: "bg-emerald-600 text-white",
    },
    riders: {
        active: "bg-blue-600 text-white",
        avatar: "bg-blue-50 text-blue-600",
        dot: "bg-blue-500",
        unread: "bg-blue-600",
        bubble: "bg-blue-50 border border-blue-100 text-gray-700",
        mine: "bg-emerald-600 text-white",
    },
    admin: {
        active: "bg-gray-900 text-white",
        avatar: "bg-gray-100 text-gray-700",
        dot: "bg-gray-400",
        unread: "bg-gray-900",
        bubble: "bg-gray-900 text-white",
        mine: "bg-emerald-600 text-white",
    },
};

export default function ChatSupportPage() {
    const { user: agentUser, isLoading: authLoading } = useRequireRole("supportAgent");

    const [activeTab, setActiveTab] = useState("passengers");
    const [passengerSessions, setPassengerSessions] = useState([]);
    const [riderSessions, setRiderSessions] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [input, setInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [showMobileList, setShowMobileList] = useState(true);

    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeout = useRef(null);
    const ts = TAB_STYLE[activeTab];

    // ── Admin room ───────────────────────────────────────────────
    const adminRoomId = useMemo(() => {
        const id = agentUser?._id || agentUser?.id;
        return id ? `admin_support_${id}` : null;
    }, [agentUser]);

    // ════════════════════════════════════════════════════════════
    // ✅ KEY FIX: roomId, chatType, otherUserId — tab দেখে সঠিকভাবে
    // ════════════════════════════════════════════════════════════
    const roomId = useMemo(() => {
        if (activeTab === "admin") return adminRoomId;
        if (!selectedChat) return null;
        return selectedChat.roomId || null;
    }, [activeTab, selectedChat, adminRoomId]);

    // ✅ chatType — rider support chat = "support" (ride নয়!), admin = "admin"
    const chatType = useMemo(() => {
        if (activeTab === "admin") return "admin";
        return "support"; // passengers & riders উভয়ই "support" chatType
    }, [activeTab]);

    // ✅ otherUserId — riders tab-এ riderId, passengers tab-এ passengerId
    const otherUserId = useMemo(() => {
        if (activeTab === "admin") return "admin";
        if (activeTab === "riders") return selectedChat?.riderId || null;
        return selectedChat?.passengerId || null;
    }, [activeTab, selectedChat]);

    const activeName = activeTab === "admin"
        ? "Admin"
        : selectedChat?.name || null;

    const callTarget = activeTab === "admin"
        ? "admin"
        : activeTab === "riders"
            ? selectedChat?.riderId || null
            : selectedChat?.passengerId || null;

    // ✅ chatSubRole — support agent কার সাথে কথা বলছে
    const chatSubRole = activeTab === "riders" ? "rider"
        : activeTab === "passengers" ? "passenger"
            : null;

    // ── useChat — role="support" কিন্তু chatType tab দেখে ──────
    const {
        messages, sendMessage, typingUser, sendTyping, stopTyping,
        socket, markAsRead, onlineStatus, loading: messagesLoading,
        sendError, clearSendError, callError, clearCallError,
        startCall, acceptCall, endCall,
        incomingCall, callActive, calling,
        localStreamRef, remoteStreamRef,
    } = useChat(
        roomId,
        chatType,
        agentUser?._id || agentUser?.id,
        agentUser?.name || "Support Agent",
        "support",
        otherUserId,
        chatSubRole   // ✅ "rider" | "passenger" | null
    );

    // ── Fetch passenger support sessions ─────────────────────────
    const fetchPassengerSessions = useCallback(async () => {
        try {
            const res = await fetch(`${CHAT_URL}/api/support/sessions`);
            const data = await res.json();
            setPassengerSessions(Array.isArray(data) ? data : []);
        } catch (err) { console.error("Passenger sessions error:", err); }
    }, []);

    // ── Fetch rider support sessions (rider tab) ────────────────
    // ✅ Rider যখন support-কে message দেয় সেগুলো দেখাবে
    const fetchRiderSessions = useCallback(async () => {
        try {
            const res = await fetch(`${CHAT_URL}/api/rider/support-sessions`);
            const data = await res.json();
            setRiderSessions(Array.isArray(data) ? data : []);
        } catch (err) { console.error("Rider sessions error:", err); }
    }, []);

    useEffect(() => {
        fetchPassengerSessions();
        fetchRiderSessions();
    }, [fetchPassengerSessions, fetchRiderSessions]);

    // ── Tab switch — clear selection ─────────────────────────────
    useEffect(() => {
        setSelectedChat(null);
        setInput("");
        setSearchQuery("");
    }, [activeTab]);

    // ── Socket events ────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;
        const upd = () => {
            fetchPassengerSessions();
            fetchRiderSessions();
        };
        socket.on("receiveMessage", upd);
        socket.on("supportSessionUpdated", upd);
        socket.on("riderChatUpdated", upd);
        return () => {
            socket.off("receiveMessage", upd);
            socket.off("supportSessionUpdated", upd);
            socket.off("riderChatUpdated", upd);
        };
    }, [socket, fetchPassengerSessions, fetchRiderSessions]);

    // ── Mark read ────────────────────────────────────────────────
    useEffect(() => {
        if (!roomId || !socket) return;
        markAsRead();
        const t = setTimeout(() => {
            fetchPassengerSessions();
            fetchRiderSessions();
        }, 300);
        return () => clearTimeout(t);
    }, [roomId, socket, messages.length, markAsRead,
        fetchPassengerSessions, fetchRiderSessions]);

    // ── Auto scroll ──────────────────────────────────────────────
    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight, behavior: "smooth"
        });
    }, [messages, typingUser]);

    // ── Toast on call error ──────────────────────────────────────
    useEffect(() => {
        if (!callError) return;
        toast.error(callError, {
            duration: 4000,
            style: {
                background: "#1f2937", color: "#f9fafb",
                fontWeight: "700", borderRadius: "16px", fontSize: "13px"
            },
        });
        clearCallError();
    }, [callError, clearCallError]);

    // ── Select chat ──────────────────────────────────────────────
    const handleSelectChat = (s) => {
        if (activeTab === "passengers") {
            setSelectedChat({
                roomId: s.roomId || `support_${s.passengerId}`,
                name: s.senderName || "Passenger",
                passengerId: s.passengerId || null,
                riderId: null,
            });
        } else if (activeTab === "riders") {
            // ✅ Rider support session — riderId দিয়ে track করো
            setSelectedChat({
                roomId: s.roomId,
                name: s.senderName || "Rider",
                passengerId: null,
                riderId: s.riderId || null,
            });
        }
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
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: "POST", body: fd }
            );
            const data = await res.json();
            if (data.secure_url) handleSend("", data.secure_url, "image");
        } catch (err) { console.error("Upload failed:", err); }
        finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
    };

    // ── Current list based on tab ────────────────────────────────
    const currentList = activeTab === "riders" ? riderSessions : passengerSessions;
    const filteredList = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return currentList.filter(s =>
            (s.senderName || "").toLowerCase().includes(q) ||
            (s.passengerId || "").toLowerCase().includes(q) ||
            (s.riderId || "").toLowerCase().includes(q)
        );
    }, [currentList, searchQuery]);

    const showChat = activeTab === "admin" || !!selectedChat;

    if (authLoading) return <SupportLoading />;

    // ════════════════════════════════════════════════════════════
    return (
        <div className="flex h-screen text-gray-700 font-sans overflow-hidden p-4">
            <div className="max-w-425 w-full mx-auto bg-white md:rounded-[2.5rem] flex overflow-hidden border border-gray-100 relative h-full">

                {/* ══ SIDEBAR ═══════════════════════════════════════════ */}
                <aside className={`${showMobileList ? "flex" : "hidden md:flex"} w-full md:w-50 lg:w-87.5 flex-col border-r border-gray-50 shrink-0 h-full`}>
                    <div className="p-8 space-y-5">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Support</h1>
                            <p className="text-emerald-600 text-[10px] font-black tracking-[0.3em] uppercase">Live Response Node</p>
                        </div>

                        {/* ── 3 Tabs ── */}
                        <div className="flex gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-100">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                        className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all
                                            ${activeTab === tab.key
                                                ? TAB_STYLE[tab.key].active + " shadow-sm"
                                                : "text-gray-400 hover:text-gray-600"}`}>
                                        <Icon size={13} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search — passenger & rider tab only */}
                        {activeTab !== "admin" && (
                            <div className="relative">
                                <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text"
                                    placeholder={activeTab === "riders" ? "Search rides..." : "Search passengers..."}
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-gray-100 rounded-[1.8rem] py-4 pl-14 pr-8 text-sm outline-none focus:border-emerald-500 shadow-sm font-bold" />
                            </div>
                        )}
                    </div>

                    {/* ── Session List ── */}
                    <div className="flex-1 overflow-y-auto px-4 pb-8">

                        {/* PASSENGERS or RIDERS list */}
                        {activeTab !== "admin" && (
                            filteredList.length === 0 ? (
                                <div className="p-16 text-center opacity-30">
                                    <Compass size={48} className="mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase">
                                        {activeTab === "riders" ? "No ride chats" : "No sessions"}
                                    </p>
                                </div>
                            ) : filteredList.map((s) => {
                                const isActive = roomId === s.roomId;
                                const onlineId = activeTab === "riders"
                                    ? s.riderId || s.passengerId
                                    : s.passengerId;
                                return (
                                    <button key={s._id || s.roomId} onClick={() => handleSelectChat(s)}
                                        className={`w-full p-5 mb-2 flex items-center gap-4 rounded-[2.2rem] transition-all
                                            ${isActive ? "bg-white shadow-lg border border-gray-100" : "hover:bg-gray-50"}`}>
                                        <div className="relative shrink-0">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black border-2 border-white uppercase ${ts.avatar}`}>
                                                {(s.senderName || "?")[0]}
                                            </div>
                                            {onlineStatus?.[onlineId] === "online" && (
                                                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-4 border-white animate-pulse ${ts.dot}`} />
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-black truncate uppercase text-sm">
                                                    {s.senderName || "Unknown"}
                                                </h4>
                                                {s.lastMessageTime && (
                                                    <span className="text-[10px] text-gray-400 font-bold shrink-0">
                                                        {new Date(s.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-xs truncate font-bold ${s.unreadCount > 0 ? "text-emerald-600" : "text-gray-400"}`}>
                                                {s.lastMessage || "No messages yet"}
                                            </p>
                                        </div>
                                        {s.unreadCount > 0 && (
                                            <span className={`text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${ts.unread}`}>
                                                {s.unreadCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}

                        {/* ADMIN card */}
                        {activeTab === "admin" && (
                            <div className="px-2 pt-2 space-y-4">
                                <button onClick={() => setShowMobileList(false)}
                                    className="w-full p-5 flex items-center gap-4 rounded-[2.2rem] bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center shrink-0 relative">
                                        <ShieldAlert size={22} className="text-white" />
                                        <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-4 border-white
                                            ${onlineStatus?.["admin"] === "online" ? "bg-emerald-500" : "bg-gray-300"}`} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-black uppercase text-sm text-gray-900">Admin</h4>
                                        <p className={`text-[10px] font-black uppercase tracking-wider
                                            ${onlineStatus?.["admin"] === "online" ? "text-emerald-500" : "text-gray-400"}`}>
                                            {onlineStatus?.["admin"] === "online" ? "● Online" : "○ Offline"}
                                        </p>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                                            <Video size={14} className="text-emerald-600" />
                                        </div>
                                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                                            <Phone size={14} className="text-gray-600" />
                                        </div>
                                    </div>
                                </button>
                                <div className="border-t border-gray-50 pt-4 space-y-3 px-1">
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">What you can do</p>
                                    {["Send text messages to admin", "Start video or audio call", "Share images & files"].map((tip, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                                <span className="text-[9px] font-black text-gray-500">{i + 1}</span>
                                            </div>
                                            <p className="text-xs font-bold text-gray-400">{tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* ══ CHAT AREA ═════════════════════════════════════════ */}
                <main className={`${!showMobileList || showChat ? "flex" : "hidden md:flex"} flex-1 flex-col bg-white relative h-full`}>
                    {showChat ? (
                        <>
                            {/* HEADER */}
                            <header className="h-24 px-8 border-b border-gray-50 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4 min-w-0">
                                    <button onClick={() => setShowMobileList(true)} className="md:hidden p-2 shrink-0">
                                        <ChevronLeft />
                                    </button>
                                    {activeTab === "admin" ? (
                                        <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center shrink-0">
                                            <ShieldAlert size={20} className="text-white" />
                                        </div>
                                    ) : (
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black uppercase shrink-0 ${ts.avatar}`}>
                                            {activeName?.[0] || "?"}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-black tracking-tighter text-gray-900 uppercase italic truncate">
                                            {activeName}
                                        </h3>
                                        {/* ✅ Rider tab-এ দুজনেরই online status দেখাও */}
                                        {activeTab === "riders" ? (
                                            <div className="flex gap-3">
                                                <span className={`text-[9px] font-black tracking-widest uppercase
                                                    ${onlineStatus?.[selectedChat?.riderId] === "online" ? "text-blue-500" : "text-gray-400"}`}>
                                                    Rider {onlineStatus?.[selectedChat?.riderId] === "online" ? "● Online" : "○ Offline"}
                                                </span>
                                                <span className={`text-[9px] font-black tracking-widest uppercase
                                                    ${onlineStatus?.[selectedChat?.passengerId] === "online" ? "text-emerald-500" : "text-gray-400"}`}>
                                                    Passenger {onlineStatus?.[selectedChat?.passengerId] === "online" ? "● Online" : "○ Offline"}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className={`text-[9px] font-black tracking-widest uppercase
                                                ${onlineStatus?.[callTarget] === "online" ? "text-emerald-500" : "text-gray-400"}`}>
                                                {onlineStatus?.[callTarget] === "online" ? "● Online" : "○ Offline"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => startCall(callTarget, { video: true, audio: true })}
                                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors">
                                        <Video size={14} /> Video
                                    </button>
                                    <button onClick={() => startCall(callTarget, { video: false, audio: true })}
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
                                        const agentId = String(agentUser?._id || agentUser?.id);
                                        const isMine = m.senderId === agentId || m.senderRole === "support";

                                        // ✅ Rider tab-এ sender label দেখাও
                                        const senderLabel = activeTab === "riders"
                                            ? m.senderRole === "rider"
                                                ? "Rider"
                                                : m.senderRole === "passenger"
                                                    ? "Passenger"
                                                    : null
                                            : null;

                                        // ✅ Rider tab-এ message bubble রঙ sender দেখে
                                        const bubbleClass = isMine
                                            ? ts.mine + " rounded-tr-none"
                                            : activeTab === "riders" && m.senderRole === "rider"
                                                ? "bg-blue-600 text-white rounded-tl-none"
                                                : activeTab === "riders" && m.senderRole === "passenger"
                                                    ? "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
                                                    : activeTab === "admin"
                                                        ? "bg-gray-900 text-white rounded-tl-none"
                                                        : "bg-white border border-gray-100 text-gray-700 rounded-tl-none";

                                        return (
                                            <div key={m._id || i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                                <div className="max-w-[80%] flex flex-col gap-1">
                                                    {/* Sender label — শুধু Riders tab-এ */}
                                                    {!isMine && senderLabel && (
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2
                                                            ${m.senderRole === "rider" ? "text-blue-600" : "text-emerald-600"}`}>
                                                            {senderLabel}
                                                        </span>
                                                    )}
                                                    <div className={`p-5 rounded-4xl shadow-sm ${bubbleClass}`}>
                                                        {m.messageType === "image" ? (
                                                            <img src={m.fileUrl} alt="attachment" className="rounded-xl max-h-60 object-cover" />
                                                        ) : (
                                                            <p className="font-bold text-sm leading-relaxed">{m.message}</p>
                                                        )}
                                                        <div className="mt-2 flex items-center gap-2 justify-end opacity-60 text-[9px] font-black uppercase">
                                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                            {isMine && <CheckCheck size={12} className={m.isRead ? "text-emerald-300" : "text-white/50"} />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                                        <Lock size={40} className="mb-4" />
                                        <p className="text-xs font-black uppercase">
                                            {activeTab === "admin" ? "Start conversation with admin"
                                                : activeTab === "riders" ? "Select a ride to view chat"
                                                    : "No communication established"}
                                        </p>
                                    </div>
                                )}
                                {typingUser && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-100 rounded-4xl rounded-tl-none px-5 py-3 shadow-sm">
                                            <p className="text-[10px] font-black text-emerald-600 animate-pulse uppercase tracking-widest">
                                                {activeTab === "admin" ? "Admin" : typingUser} typing...
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
                                        className="p-4 text-gray-400 hover:text-emerald-500 transition-colors">
                                        {isUploading ? <Loader2 size={22} className="animate-spin" /> : <Paperclip size={22} />}
                                    </button>
                                    <input value={input} onChange={(e) => onInputChange(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                        placeholder={
                                            activeTab === "admin" ? "Message admin..." :
                                                activeTab === "riders" ? "Monitor ride chat..." :
                                                    "Reply to passenger..."
                                        }
                                        className="flex-1 bg-transparent py-3 outline-none font-bold text-gray-800" />
                                    <button onClick={() => handleSend()} disabled={!input.trim() && !isUploading}
                                        className={`text-white p-4 rounded-full disabled:bg-gray-200 shadow-lg transition-colors
                                            ${activeTab === "admin" ? "bg-gray-900 hover:bg-gray-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                                        <Send size={20} />
                                    </button>
                                </div>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30">
                            <MessageSquare size={80} className="mb-6" />
                            <h3 className="text-2xl font-black uppercase tracking-widest">Select a channel</h3>
                            <p className="text-sm font-bold mt-2 uppercase tracking-wider opacity-60">
                                {activeTab === "passengers" && "Choose a passenger session"}
                                {activeTab === "riders" && "Choose a ride chat"}
                            </p>
                        </div>
                    )}
                </main>
            </div>

            {/* Incoming call */}
            {incomingCall && !callActive && (
                <div className="fixed bottom-8 right-8 bg-white shadow-2xl rounded-3xl p-6 border border-gray-100 z-[998] min-w-[260px]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-lg">
                            {incomingCall.callType === "audio" ? "🎧" : "📹"}
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                Incoming {incomingCall.callType === "audio" ? "Voice" : "Video"} Call
                            </p>
                            <h4 className="font-black text-sm uppercase text-gray-900">
                                {activeTab === "admin" ? "Admin" : selectedChat?.name || "User"}
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
                callerName={incomingCall?.fromUserName || activeName || "User"}
                callType={incomingCall?.callType || "video"}
            />
        </div>
    );
}