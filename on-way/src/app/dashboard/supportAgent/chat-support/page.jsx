
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
    MessageSquare, Send, Paperclip, CheckCheck,
    Loader2, Search as SearchIcon, ChevronLeft,
    ShieldCheck, Lock, Compass
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useRequireRole } from "@/hooks/useAuth";
import useWebRTCCall from "@/hooks/useCall";
import CallModal from "@/components/dashboard/CallModal";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";

export default function ChatSupportPage() {
    const { user: agentUser, isLoading: authLoading } = useRequireRole("supportAgent");
    const [sessions, setSessions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedChat, setSelectedChat] = useState(null);
    const [input, setInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [showMobileList, setShowMobileList] = useState(true);

    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    const roomId = useMemo(() => {
        if (!selectedChat) return null;
        return selectedChat.roomId || `support_${selectedChat.passengerId}`;
    }, [selectedChat]);

    const {
        messages, sendMessage, typingUser, sendTyping, stopTyping,
        socket, markAsRead, onlineStatus, loading: messagesLoading,
        sendError, clearSendError
    } = useChat(
        roomId, "support", agentUser?.id, agentUser?.name || "Support Agent",
        "support", selectedChat?.passengerId
    );

    const call = useWebRTCCall(agentUser?.id);

    const fetchSessions = useCallback(async () => {
        try {
            const res = await fetch(`${SOCKET_URL}/api/support/sessions`);
            const data = await res.json();
            setSessions(data || []);
        } catch (err) {
            console.error("Session error:", err);
        }
    }, []);

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    useEffect(() => {
        if (!socket) return;
        const handleUpdate = () => fetchSessions();
        socket.on("receiveMessage", handleUpdate);
        socket.on("supportSessionUpdated", handleUpdate);
        return () => {
            socket.off("receiveMessage", handleUpdate);
            socket.off("supportSessionUpdated", handleUpdate);
        };
    }, [socket, fetchSessions]);

    useEffect(() => {
        if (roomId && socket) markAsRead();
    }, [roomId, socket, messages.length, markAsRead]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, typingUser]);

    const handleSelectChat = (session) => {
        setSelectedChat({
            roomId: session.roomId || `support_${session.passengerId}`,
            name: session.senderName,
            passengerId: session.passengerId,
        });
        setShowMobileList(false);
    };

    const handleSend = async (text = input, fileUrl = null, type = "text") => {
        if ((!text.trim() && !fileUrl) || !roomId) return;
        await sendMessage(text, fileUrl, type);
        setInput("");
        stopTyping();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "onway_preset");
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "POST", body: formData
            });
            const data = await res.json();
            if (data.secure_url) handleSend("", data.secure_url, "image");
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setIsUploading(false);
        }
    };

    const filteredSessions = useMemo(() => {
        return sessions.filter(s =>
            s.senderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.passengerId?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [sessions, searchQuery]);

    if (authLoading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F8F9FD] text-emerald-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Initializing Support Matrix...</p>
        </div>
    );

    return (
        <div className="flex h-screen  text-gray-700 font-sans overflow-hidden P-4">
            <div className="max-w-425 w-full mx-auto bg-white md:rounded-[2.5rem] flex overflow-hidden border border-gray-100 relative h-full">

                {/* SIDEBAR */}
                <aside className={`${showMobileList ? "flex" : "hidden md:flex"} w-full md:w-50 lg:w-87.5 flex-col border-r border-gray-50 shrink-0 h-full`}>
                    <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Support Agent</h1>
                                <p className="text-emerald-600 text-[10px] font-black tracking-[0.3em] uppercase">Live Response Node</p>
                            </div>
                        </div>
                        <div className="relative">
                            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text" placeholder="Search passengers..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-gray-100 rounded-[1.8rem] py-4 pl-14 pr-8 text-sm outline-none focus:border-emerald-500 shadow-sm font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-8">
                        {filteredSessions.length === 0 ? (
                            <div className="p-16 text-center opacity-30">
                                <Compass size={48} className="mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase">No active sessions</p>
                            </div>
                        ) : filteredSessions.map((session) => (
                            <button
                                key={session._id} onClick={() => handleSelectChat(session)}
                                className={`w-full p-5 mb-2 flex items-center gap-4 rounded-[2.2rem] transition-all relative ${roomId === (session.roomId || `support_${session.passengerId}`) ? "bg-white shadow-lg border-emerald-50" : "hover:bg-emerald-50/50"}`}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black bg-emerald-50 text-emerald-600 border-2 border-white uppercase">
                                        {(session.senderName || "?")[0]}
                                    </div>
                                    {onlineStatus[session.passengerId] === "online" && <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white animate-pulse" />}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-black truncate uppercase text-sm">{session.senderName || "Unknown"}</h4>
                                        <span className="text-[10px] text-gray-400 font-bold">{session.lastMessageTime && new Date(session.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className={`text-xs truncate font-bold ${session.unreadCount > 0 ? "text-emerald-600" : "text-gray-400"}`}>{session.lastMessage || "No messages yet"}</p>
                                </div>
                                {session.unreadCount > 0 && <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{session.unreadCount}</span>}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* CHAT AREA */}
                <main className={`${(!showMobileList || !selectedChat) ? "flex" : "hidden md:flex"} flex-1 flex-col bg-white relative h-full`}>
                    {selectedChat ? (
                        <>
                            <header className="h-24 px-8 border-b border-gray-50 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setShowMobileList(true)} className="md:hidden p-2"><ChevronLeft /></button>
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center font-black text-emerald-600 border border-emerald-100 uppercase">{selectedChat.name?.[0]}</div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tighter text-gray-900 uppercase italic">{selectedChat.name}</h3>
                                        <span className="text-[9px] font-black tracking-widest text-emerald-500 uppercase">{onlineStatus[selectedChat.passengerId] === "online" ? "Online" : "Offline"}</span>
                                    </div>
                                </div>

                                {/*  Call Button */}
                                <div className="flex gap-2">
                                    <button onClick={() => call.startCall(selectedChat.passengerId)} className="bg-emerald-600 text-white p-1 rounded-xl text-[8px] font-black uppercase tracking-wider">📞 Video </button>
                                    <button onClick={() => call.startCall(selectedChat.passengerId, { video: false })} className="bg-gray-500 text-white p-1 rounded-xl text-[8px] font-black uppercase tracking-wider">🎧 Audio </button>
                                </div>
                            </header>

                            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-[#FAFAFF]/40 custom-scrollbar">
                                {messagesLoading && messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full opacity-50"><Loader2 className="animate-spin text-emerald-500" /><p className="text-[10px] mt-2 font-bold uppercase">Syncing...</p></div>
                                ) : messages.length > 0 ? (
                                    messages.map((m, i) => (
                                        <div key={m._id || i} className={`flex ${m.senderRole === "support" ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[80%] p-5 rounded-4xl shadow-sm ${m.senderRole === "support" ? "bg-emerald-600 text-white rounded-tr-none" : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"}`}>
                                                {m.messageType === "image" ? <img src={m.fileUrl} alt="attachment" className="rounded-xl max-h-60 object-cover" /> : <p className="font-bold text-sm leading-relaxed">{m.message}</p>}
                                                <div className="mt-2 flex items-center gap-2 justify-end opacity-60 text-[9px] font-black uppercase">
                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {m.senderRole === "support" && <CheckCheck size={12} className={m.isRead ? "text-emerald-300" : "text-white/50"} />}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full opacity-20"><Lock size={40} className="mb-4" /><p className="text-xs font-black uppercase">No communication established</p></div>
                                )}
                                {typingUser && <div className="text-[10px] font-black text-emerald-600 animate-pulse uppercase tracking-widest">{typingUser} typing...</div>}
                            </div>

                            <footer className="p-6 border-t border-gray-50">
                                {sendError && (
                                    <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center justify-between text-xs font-bold">
                                        <div className="flex items-center gap-2"><ShieldCheck size={16} /> Send failed</div>
                                        <button onClick={clearSendError} className="px-3 py-1 bg-red-100 rounded-xl font-black text-[10px]">Dismiss</button>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-[2.5rem] border border-gray-100 focus-within:bg-white transition-all">
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-4 text-gray-400 hover:text-emerald-500">
                                        {isUploading ? <Loader2 size={22} className="animate-spin" /> : <Paperclip size={22} />}
                                    </button>
                                    <input
                                        value={input} onChange={(e) => { setInput(e.target.value); sendTyping(); }}
                                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                        placeholder="Type a response..." className="flex-1 bg-transparent py-3 outline-none font-bold text-gray-800"
                                    />
                                    <button onClick={() => handleSend()} disabled={!input.trim() && !isUploading} className="bg-emerald-600 text-white p-4 rounded-full disabled:bg-gray-200 shadow-lg"><Send size={20} /></button>
                                </div>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30">
                            <MessageSquare size={80} className="mb-6" />
                            <h3 className="text-2xl font-black uppercase tracking-widest">Select a channel</h3>
                        </div>
                    )}
                </main>
            </div>

            {/*  Call Modal */}
            <CallModal call={call} />
        </div>
    );
}