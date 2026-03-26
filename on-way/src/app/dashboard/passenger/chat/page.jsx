"use client";
import toast from "react-hot-toast";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
    MessageSquare, Send, Paperclip, Loader2,
    Search as SearchIcon, ChevronLeft, Compass,
    CheckCheck, ShieldCheck, Lock, Phone, Video,
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CallModal from "@/components/dashboard/CallModal";

const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:4002";

export default function PassengerChatPage() {
    const { user, isLoading: userLoading } = useCurrentUser();

    const [riderChats, setRiderChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingChats, setLoadingChats] = useState(false);
    const [input, setInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [showMobileList, setShowMobileList] = useState(true);

    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTm = useRef(null);

    // ── Support chat entry ───────────────────────────────────────
    const supportChat = useMemo(() => {
        if (!user?._id) return null;
        return {
            roomId: `support_${user._id}`,
            senderName: "Support Agent",
            riderId: null,
            type: "support",
            lastMessage: "Chat with support team",
            unreadCount: 0,
        };
    }, [user?._id]);

    // ── Fetch ride chats ─────────────────────────────────────────
    const fetchPassengerChats = useCallback(async () => {
        if (!user?._id) return;
        try {
            setLoadingChats(true);
            const res = await fetch(`${CHAT_URL}/api/passenger/chats/${user._id}`);
            const data = await res.json();
            if (Array.isArray(data)) setRiderChats(data.map(c => ({ ...c, type: "ride" })));
        } catch (err) {
            console.error("Fetch chats error:", err);
        } finally {
            setLoadingChats(false);
        }
    }, [user?._id]);

    useEffect(() => { fetchPassengerChats(); }, [fetchPassengerChats]);

    // ── Filtered list ────────────────────────────────────────────
    const filteredChats = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        let list = riderChats;
        if (q) list = list.filter(c => (c.senderName || "").toLowerCase().includes(q));
        if (supportChat && (!q || "support agent".includes(q))) list = [supportChat, ...list];
        return list;
    }, [riderChats, searchQuery, supportChat]);

    // ── Derived values ───────────────────────────────────────────
    const roomId = selectedChat?.roomId || null;
    const chatType = selectedChat?.type === "support" ? "support" : "ride";
    const otherUserId = selectedChat?.type === "support" ? null : selectedChat?.riderId;
    const callTargetId = selectedChat?.type === "support" ? "support" : selectedChat?.riderId;

    // ── useChat ──────────────────────────────────────────────────
    const {
        messages, sendMessage, typingUser, sendTyping, stopTyping,
        markAsRead, onlineStatus, loading: messagesLoading,
        sendError, clearSendError,
        callError, clearCallError, socket,
        startCall, acceptCall, endCall,
        incomingCall, callActive, calling,   // ✅ calling নেওয়া হয়েছে
        localStreamRef, remoteStreamRef,
    } = useChat(roomId, chatType, user?._id, user?.name || "Passenger", "passenger", otherUserId);

    // ── Auto scroll ──────────────────────────────────────────────
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, typingUser]);

    // ── Mark as read ─────────────────────────────────────────────
    useEffect(() => {
        if (roomId && socket) markAsRead();
    }, [roomId, messages.length, socket, markAsRead]);

    // ✅ Call error toast
    useEffect(() => {
        if (!callError) return;
        toast.error(callError, {
            duration: 4000,
            style: {
                background: "#1f2937",
                color: "#f9fafb",
                fontWeight: "700",
                borderRadius: "16px",
                fontSize: "13px",
            },
        });
        clearCallError();
    }, [callError, clearCallError]);

    // ── Refresh list on socket event ─────────────────────────────
    useEffect(() => {
        if (!socket) return;
        socket.on("riderChatUpdated", fetchPassengerChats);
        return () => socket.off("riderChatUpdated", fetchPassengerChats);
    }, [socket, fetchPassengerChats]);

    // ── Send ─────────────────────────────────────────────────────
    const handleSend = (text = input, fileUrl = null, type = "text") => {
        if ((!text.trim() && !fileUrl) || !roomId) return;
        sendMessage(text, fileUrl, type);
        setInput("");
        stopTyping();
    };

    const onInputChange = (val) => {
        setInput(val);
        sendTyping();
        if (typingTm.current) clearTimeout(typingTm.current);
        typingTm.current = setTimeout(() => stopTyping(), 2000);
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
        } catch (err) { console.error("Upload failed", err); }
        finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
    };

    // ── Guards ───────────────────────────────────────────────────
    if (userLoading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F8F9FD] text-emerald-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Loading Passenger Node...</p>
        </div>
    );
    if (!user) return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <Lock size={40} className="mb-4 text-red-500" />
            <p className="text-sm font-bold">Authentication Required</p>
        </div>
    );

    // ════════════════════════════════════════════════════════════
    return (
        <div className="flex h-screen text-gray-700 font-sans overflow-hidden p-4">
            <div className="max-w-425 w-full mx-auto bg-white md:rounded-[2.5rem] flex overflow-hidden border border-gray-100 relative h-full">

                {/* ══ SIDEBAR ══ */}
                <aside className={`${showMobileList ? "flex" : "hidden md:flex"} w-full md:w-50 lg:w-87.5 flex-col border-r border-gray-50 shrink-0 h-full`}>
                    <div className="p-8 space-y-6">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Passenger Chat</h1>
                            <p className="text-emerald-600 text-[10px] font-black tracking-[0.3em] uppercase">Communication</p>
                        </div>
                        <div className="relative">
                            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" placeholder="Search chat..." value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-gray-100 rounded-[1.8rem] py-4 pl-14 pr-8 text-sm outline-none focus:border-emerald-500 shadow-sm font-bold" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-8">
                        {loadingChats ? (
                            <div className="flex items-center justify-center p-20">
                                <Loader2 className="animate-spin text-emerald-500" />
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <div className="p-16 text-center opacity-30">
                                <Compass size={48} className="mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase">No chats</p>
                            </div>
                        ) : filteredChats.map(chat => (
                            <button key={chat.roomId}
                                onClick={() => { setSelectedChat(chat); setShowMobileList(false); }}
                                className={`w-full p-5 mb-2 flex items-center gap-4 rounded-[2.2rem] transition-all
                                    ${roomId === chat.roomId ? "bg-white shadow-lg border border-emerald-50" : "hover:bg-emerald-50/50"}`}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black uppercase shrink-0
                                    ${chat.type === "support" ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600"}`}>
                                    {chat.type === "support" ? "S" : chat.senderName?.[0]}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-black truncate uppercase text-sm">{chat.senderName}</h4>
                                        {chat.lastMessageTime && (
                                            <span className="text-[10px] text-gray-400 font-bold shrink-0">
                                                {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs truncate font-bold ${chat.unreadCount > 0 ? "text-emerald-600" : "text-gray-400"}`}>
                                        {chat.lastMessage || "No messages yet"}
                                    </p>
                                </div>
                                {chat.unreadCount > 0 && (
                                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                                        {chat.unreadCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* ══ CHAT AREA ══ */}
                <main className={`${!showMobileList ? "flex" : "hidden md:flex"} flex-1 flex-col h-full`}>
                    {!selectedChat ? (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                            <MessageSquare size={60} className="mb-6" />
                            <h3 className="text-xl font-black uppercase">Select a Chat</h3>
                        </div>
                    ) : (
                        <>
                            {/* HEADER */}
                            <header className="h-24 px-8 border-b border-gray-50 flex items-center gap-4 shrink-0">
                                <button onClick={() => setShowMobileList(true)} className="md:hidden p-2">
                                    <ChevronLeft />
                                </button>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0
                                    ${selectedChat.type === "support" ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600"}`}>
                                    {selectedChat.senderName?.[0] || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-black uppercase truncate">{selectedChat.senderName}</h3>
                                    {selectedChat.type !== "support" && (
                                        <span className={`text-[9px] font-black tracking-widest uppercase
                                            ${onlineStatus[selectedChat.riderId] === "online" ? "text-emerald-500" : "text-gray-400"}`}>
                                            {onlineStatus[selectedChat.riderId] === "online" ? "● Online" : "○ Offline"}
                                        </span>
                                    )}
                                </div>
                                {/* ✅ Video & Audio call */}
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => startCall(callTargetId, { video: true, audio: true })}
                                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors">
                                        <Video size={14} /> Video
                                    </button>
                                    <button
                                        onClick={() => startCall(callTargetId, { video: false, audio: true })}
                                        className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors">
                                        <Phone size={14} /> Audio
                                    </button>
                                </div>
                            </header>

                            {/* MESSAGES */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-4 bg-[#FAFAFF]/40">
                                {messagesLoading && messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full opacity-50">
                                        <Loader2 className="animate-spin text-emerald-500" />
                                    </div>
                                ) : (
                                    messages.map((m, i) => (
                                        <div key={m._id || i}
                                            className={`flex ${m.senderId === String(user._id) ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[80%] p-5 rounded-4xl shadow-sm
                                                ${m.senderId === String(user._id)
                                                    ? "bg-emerald-600 text-white rounded-tr-none"
                                                    : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"}`}>
                                                {m.messageType === "image"
                                                    ? <img src={m.fileUrl} alt="attachment" className="rounded-xl max-h-60 object-cover" />
                                                    : <p className="font-bold text-sm leading-relaxed">{m.message}</p>}
                                                <div className="mt-2 flex items-center gap-2 justify-end opacity-60 text-[9px] font-black uppercase">
                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    {m.senderId === String(user._id) && (
                                                        <CheckCheck size={12} className={m.isRead ? "text-emerald-300" : "text-white/50"} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {typingUser && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-100 rounded-4xl rounded-tl-none px-5 py-3 shadow-sm">
                                            <p className="text-[10px] font-black text-emerald-600 animate-pulse uppercase tracking-widest">
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
                                        <button onClick={clearSendError} className="px-3 py-1 bg-red-100 rounded-xl text-[10px]">Dismiss</button>
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
                                        placeholder="Type a message..."
                                        className="flex-1 bg-transparent py-3 outline-none font-bold text-gray-800" />
                                    <button onClick={() => handleSend()} disabled={!input.trim() && !isUploading}
                                        className="bg-emerald-600 text-white p-4 rounded-full disabled:bg-gray-200 shadow-lg hover:bg-emerald-700 transition-colors">
                                        <Send size={20} />
                                    </button>
                                </div>
                            </footer>
                        </>
                    )}
                </main>
            </div>

            {/* ✅ Incoming call notification */}
            {incomingCall && !callActive && (
                <div className="fixed bottom-8 right-8 bg-white shadow-2xl rounded-3xl p-6 border border-gray-100 z-[998] min-w-[260px]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
                            {incomingCall.callType === "audio" ? "🎧" : "📹"}
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                Incoming {incomingCall.callType === "audio" ? "Voice" : "Video"} Call
                            </p>
                            <h4 className="font-black text-sm uppercase text-gray-900">
                                {selectedChat?.senderName || "Unknown"}
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

            {/* ✅ CallModal — calling prop যোগ করা হয়েছে */}
            <CallModal
                callActive={callActive}
                calling={calling}
                localStreamRef={localStreamRef}
                remoteStreamRef={remoteStreamRef}
                endCall={endCall}
                callerName={incomingCall?.fromUserName || selectedChat?.senderName || "Rider"}
                callType={incomingCall?.callType || "video"}
            />
        </div>
    );
}