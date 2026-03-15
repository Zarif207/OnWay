"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
    Send,
    Paperclip,
    Loader2,
    Search as SearchIcon,
    ChevronLeft,
    MessageSquare,
    CheckCheck,
    Compass,
    ShieldCheck,
    Lock
} from "lucide-react";

import { useChat } from "@/hooks/useChat";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CallModal from "@/components/dashboard/CallModal";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";

export default function RiderInboxPage() {
    const { user, isLoading: userLoading } = useCurrentUser();

    const [chats, setChats] = useState([]);
    const [selected, setSelected] = useState(null);
    const [input, setInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [showMobileList, setShowMobileList] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fileInputRef = useRef(null);
    const scrollRef = useRef(null);
    const typingTimeout = useRef(null);

    // Support chat placeholder
    const supportChat = useMemo(() => {
        if (!user?._id) return null;
        return {
            roomId: `support_${user._id}`,
            senderName: "Support Agent",
            type: "support",
            passengerId: null,
            lastMessage: "Chat with support team",
            unreadCount: 0
        };
    }, [user]);

    const roomId = selected?.roomId || null;
    const chatType = selected?.type === "support" ? "support" : "ride";
    const otherUserId = selected?.type === "support" ? null : selected?.passengerId;
    const callTargetUserId = selected?.type === "support" ? "support" : selected?.passengerId;

    const {
        messages,
        sendMessage,
        typingUser,
        sendTyping,
        stopTyping,
        socket,
        markAsRead,
        onlineStatus,
        loading: messagesLoading,
        sendError,
        clearSendError,
        startCall,
        acceptCall,
        endCall,
        incomingCall,
        callActive,
        localStreamRef,
        remoteStreamRef
    } = useChat(roomId, chatType, user?._id, user?.name || "Rider", "rider", otherUserId);

    // Fetch chats
    const fetchChats = useCallback(async () => {
        if (!user?._id) return;
        try {
            const res = await fetch(`${SOCKET_URL}/api/rider/chats/${user._id}`);
            const data = await res.json();
            const rideChats = Array.isArray(data) ? data.map(c => ({ ...c, type: "ride" })) : [];
            setChats(rideChats);
            if (!selected && rideChats.length > 0 && window.innerWidth >= 768) setSelected(rideChats[0]);
        } catch (err) { console.error(err); }
    }, [user, selected]);

    useEffect(() => { fetchChats(); }, [fetchChats]);

    // Socket events
    useEffect(() => {
        if (!socket) return;
        const onReceive = (msg) => { fetchChats(); if (msg.roomId === roomId) markAsRead(); };
        const onUpdate = () => fetchChats();
        socket.on("receiveMessage", onReceive);
        socket.on("riderChatUpdated", onUpdate);
        return () => {
            socket.off("receiveMessage", onReceive);
            socket.off("riderChatUpdated", onUpdate);
        };
    }, [socket, fetchChats, roomId, markAsRead]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, typingUser]);

    useEffect(() => { if (roomId && socket) markAsRead(); }, [roomId, messages.length, socket, markAsRead]);

    // Select chat
    const handleSelect = (c) => { setSelected(c); setShowMobileList(false); markAsRead(); };

    // Send message
    const handleSend = (text = input, fileUrl = null, type = "text") => {
        if ((!text.trim() && !fileUrl) || !roomId) return;
        sendMessage(text, fileUrl, type);
        setInput("");
        stopTyping();
    };

    // Typing
    const onInputChange = (val) => {
        setInput(val);
        sendTyping();
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => stopTyping(), 2000);
    };

    // File upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "onway_preset");
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
            const data = await res.json();
            if (data.secure_url) handleSend("", data.secure_url, "image");
        } catch (err) { console.error(err); }
        finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
    };

    // Filter chats
    const filteredChats = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        let filtered = chats.filter(c => c.senderName?.toLowerCase().includes(query));
        if (supportChat && (supportChat.senderName.toLowerCase().includes(query) || !query)) filtered = [supportChat, ...filtered];
        return filtered;
    }, [chats, searchTerm, supportChat]);

    // Loading & auth
    if (userLoading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F8F9FD] text-emerald-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Initializing Rider Inbox...</p>
        </div>
    );

    if (!user) return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <Lock size={40} className="mb-4 text-red-500" />
            <p className="text-sm font-bold">Authentication Required</p>
        </div>
    );

    return (
        <div className="flex h-screen text-gray-700 font-sans overflow-hidden p-4">
            <div className="max-w-425 w-full mx-auto bg-white md:rounded-[2.5rem] flex overflow-hidden border border-gray-100 relative h-full">

                {/* SIDEBAR */}
                <aside className={`${showMobileList ? "flex" : "hidden md:flex"} w-full md:w-50 lg:w-87.5 flex-col border-r border-gray-50 shrink-0 h-full`}>
                    <div className="p-8 space-y-6">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Rider Inbox</h1>
                            <p className="text-emerald-600 text-[10px] font-black tracking-[0.3em] uppercase">Passenger Messages & Support</p>
                        </div>
                        <div className="relative">
                            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" placeholder="Search chat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-100 rounded-[1.8rem] py-4 pl-14 pr-8 text-sm outline-none focus:border-emerald-500 shadow-sm font-bold" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-8">
                        {filteredChats.length === 0 ? (
                            <div className="p-16 text-center opacity-30">
                                <Compass size={48} className="mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase">No active chats</p>
                            </div>
                        ) : (
                            filteredChats.map((c) => {
                                const isSupport = c.type === "support";
                                return (
                                    <button key={c.roomId} onClick={() => handleSelect(c)} className={`w-full p-5 mb-2 flex items-center gap-4 rounded-[2.2rem] transition-all relative ${selected?.roomId === c.roomId ? "bg-white shadow-lg border-emerald-50" : "hover:bg-emerald-50/50"}`}>
                                        <div className="relative shrink-0">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black uppercase ${isSupport ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600"}`}>
                                                {isSupport ? "S" : c.senderName?.[0]}
                                            </div>
                                            {!isSupport && onlineStatus[c.passengerId] === "online" && <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white animate-pulse" />}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black truncate uppercase text-sm">{c.senderName}</h4>
                                                {c.lastMessageTime && <span className="text-[10px] text-gray-400 font-bold">{new Date(c.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
                                            </div>
                                            <p className={`text-xs truncate font-bold ${c.unreadCount > 0 ? "text-emerald-600" : "text-gray-400"}`}>{c.lastMessage || "No messages yet"}</p>
                                        </div>
                                        {c.unreadCount > 0 && <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{c.unreadCount}</span>}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* CHAT AREA */}
                <main className={`${!showMobileList || !selected ? "flex" : "hidden md:flex"} flex-1 flex-col bg-white relative h-full`}>
                    {selected ? (
                        <>
                            {/* HEADER */}
                            <header className="h-24 px-8 border-b border-gray-50 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setShowMobileList(true)} className="md:hidden p-2"><ChevronLeft /></button>
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center font-black text-emerald-600 border border-emerald-100 uppercase">{selected.senderName?.[0]}</div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tighter text-gray-900 uppercase italic">{selected.senderName}</h3>
                                        {selected.type !== "support" && <span className="text-[9px] font-black tracking-widest text-emerald-500 uppercase">{onlineStatus[selected.passengerId] === "online" ? "Online" : "Offline"}</span>}
                                    </div>
                                </div>
                                <div className="ml-auto flex gap-2">
                                    <button onClick={() => startCall(callTargetUserId, { video: true })} className="bg-emerald-600 text-white p-1 rounded-xl text-[8px] font-black uppercase tracking-wider">📹 Video </button>
                                    <button onClick={() => startCall(callTargetUserId, { video: false })} className="bg-gray-500 text-white p-1 rounded-xl text-[8px] font-black uppercase tracking-wider">🎧 Audio </button>
                                </div>
                            </header>

                            {/* MESSAGES */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-[#FAFAFF]/40">
                                {messagesLoading && messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full opacity-50">
                                        <Loader2 className="animate-spin text-emerald-500" />
                                    </div>
                                ) : (
                                    messages.map((m, i) => (
                                        <div key={m._id || i} className={`flex ${m.senderId === user._id ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[80%] p-5 rounded-4xl shadow-sm ${m.senderId === user._id ? "bg-emerald-600 text-white rounded-tr-none" : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"}`}>
                                                {m.messageType === "image" ? <img src={m.fileUrl} className="rounded-xl max-h-60 object-cover" /> : <p className="font-bold text-sm">{m.message}</p>}
                                                <div className="mt-2 flex items-center gap-2 justify-end opacity-60 text-[9px] font-black uppercase">
                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    {m.senderId === user._id && <CheckCheck size={12} className={m.isRead ? "text-emerald-300" : "text-white/50"} />}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {typingUser && <div className="text-[10px] font-black text-emerald-600 animate-pulse uppercase tracking-widest">{selected.type === "support" ? "Support" : "Passenger"} typing...</div>}

                                {/* INCOMING CALL */}
                                {incomingCall && (
                                    <div className="fixed bottom-10 right-10 bg-white shadow-2xl rounded-2xl p-6 border border-gray-100 z-50">
                                        <h3 className="font-black text-sm uppercase mb-4">Incoming Call</h3>
                                        <div className="flex gap-3">
                                            <button onClick={acceptCall} className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold">Accept</button>
                                            <button onClick={endCall} className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold">Reject</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* INPUT */}
                            <footer className="p-6 border-t border-gray-50">
                                {sendError && (
                                    <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center justify-between text-xs font-bold">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={16} /> Send failed
                                        </div>
                                        <button onClick={clearSendError} className="px-3 py-1 bg-red-100 rounded-xl font-black text-[10px]">Dismiss</button>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-[2.5rem] border border-gray-100">
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-4 text-gray-400 hover:text-emerald-500">{isUploading ? <Loader2 size={22} className="animate-spin" /> : <Paperclip size={22} />}</button>
                                    <input value={input} onChange={(e) => onInputChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Type a message..." className="flex-1 bg-transparent py-3 outline-none font-bold" />
                                    <button onClick={() => handleSend()} disabled={!input.trim() && !isUploading} className="bg-emerald-600 text-white p-4 rounded-full disabled:bg-gray-200 shadow-lg"><Send size={20} /></button>
                                </div>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30">
                            <MessageSquare size={80} className="mb-6" />
                            <h3 className="text-2xl font-black uppercase tracking-widest">Select a chat</h3>
                        </div>
                    )}
                </main>
            </div>

            {/* CALL MODAL */}
            <CallModal
                callActive={callActive}
                localStreamRef={localStreamRef}
                remoteStreamRef={remoteStreamRef}
                endCall={endCall}
            />

        </div>
    );
}