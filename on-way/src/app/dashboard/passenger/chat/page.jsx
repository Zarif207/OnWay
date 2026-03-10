"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Send,
    Paperclip,
    Loader2,
    MessageSquare,
    Clock,
    ShieldCheck,
    Image as ImageIcon,
    Compass,
    Search,
    ChevronLeft,
    Headphones,
    User,
    Wifi,
    Zap,
    Lock,
    CheckCheck
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";

export default function PassengerChatPage() {
    const { user, isLoading: userLoading } = useCurrentUser();
    const [activeTab, setActiveTab] = useState("rider");
    const [riderChats, setRiderChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loadingChats, setLoadingChats] = useState(false);
    const [input, setInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [showMobileList, setShowMobileList] = useState(true);

    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeout = useRef(null);

    const fetchPassengerChats = useCallback(async () => {
        if (!user?._id) return;
        try {
            setLoadingChats(true);
            const res = await fetch(`${SOCKET_URL}/api/passenger/chats/${user._id}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setRiderChats(data);
                if (!selectedChat && data.length > 0) {
                    setSelectedChat(data[0]);
                }
            }
        } catch (err) {
            console.error("Fetch chats error:", err);
        } finally {
            setLoadingChats(false);
        }
    }, [user, selectedChat]);

    useEffect(() => {
        if (activeTab === "rider") {
            fetchPassengerChats();
        }
    }, [activeTab, fetchPassengerChats]);

    const chatType = activeTab === "rider" ? "ride" : "support";

    const roomId = activeTab === "support"
        ? (user?._id ? `support_${user._id}` : null)
        : (selectedChat?.roomId || null);

    const otherUserId = activeTab === "rider" ? selectedChat?.riderId : null;

    const {
        messages,
        sendMessage,
        typingUser,
        sendTyping,
        stopTyping,
        markAsRead,
        onlineStatus,
        loading: messagesLoading,
        sendError,
        clearSendError,
        socket
    } = useChat(
        roomId,
        chatType,
        user?._id,
        user?.name || "Passenger",
        "passenger",
        otherUserId
    );

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, typingUser]);

    useEffect(() => {
        if (roomId && socket) {
            markAsRead();
        }
    }, [roomId, messages.length, socket, markAsRead]);

    useEffect(() => {
        if (!socket) return;
        const handleListUpdate = () => fetchPassengerChats();
        socket.on("riderChatUpdated", handleListUpdate);
        return () => socket.off("riderChatUpdated", handleListUpdate);
    }, [socket, fetchPassengerChats]);

    const handleSend = (text = input, fileUrl = null, type = "text") => {
        if ((!text.trim() && !fileUrl) || !roomId) return;
        sendMessage(text, fileUrl, type);
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
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dqvn08h9r"}/image/upload`,
                { method: "POST", body: formData }
            );

            const data = await res.json();
            if (data.secure_url) {
                handleSend("", data.secure_url, "image");
            }
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const onInputChange = (val) => {
        setInput(val);
        sendTyping();
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => stopTyping(), 2000);
    };

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        setShowMobileList(false);
    };

    if (userLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-[#030303]">
                <div className="relative">
                    <div className="w-20 h-20 border-[3px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.1)]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={24} className="text-blue-500 animate-pulse" />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-white text-sm font-black tracking-[0.4em] uppercase mb-1">OnWay Systems</p>
                    <p className="text-blue-500/50 text-[10px] font-bold tracking-[0.2em] uppercase underline-offset-4 underline decoration-blue-500/20">Establishing Uplink</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-[#030303]">
                <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] mb-8 flex items-center justify-center border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)] transition-transform hover:scale-105 duration-500">
                    <Lock size={40} className="text-red-500" />
                </div>
                <h2 className="text-white text-5xl font-black mb-4 tracking-tighter italic uppercase">Access Denied</h2>
                <div className="flex items-center gap-2 mb-8">
                    <div className="h-[1px] w-8 bg-red-500/20"></div>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Encryption Violation</p>
                    <div className="h-[1px] w-8 bg-red-500/20"></div>
                </div>
                <p className="text-gray-400 text-sm max-w-xs font-medium leading-relaxed uppercase tracking-widest bg-white/5 py-3 px-6 rounded-2xl border border-white/5">Please authenticate to access this secure node.</p>
            </div>
        );
    }

    const isOnline = activeTab === "rider"
        ? onlineStatus[otherUserId] === "online"
        : true;

    return (
        <div className="min-h-screen h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col relative selection:bg-blue-500/30">
            {/* AMBIENT BACKGROUND ELEMENTS */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className={`absolute top-[-20%] right-[-10%] w-[70%] h-[70%] blur-[120px] rounded-full transition-colors duration-1000 ${activeTab === 'rider' ? 'bg-blue-600/10' : 'bg-emerald-600/10'}`}></div>
                <div className={`absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] blur-[120px] rounded-full transition-colors duration-1000 ${activeTab === 'rider' ? 'bg-blue-900/10' : 'bg-emerald-900/10'}`}></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <div className="max-w-[1700px] mx-auto w-full h-full flex-1 flex flex-col z-10 relative p-4 md:p-6 lg:p-10 overflow-hidden">

                {/* PREMIUM HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-6">
                    <div className="group cursor-default">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(37,99,235,0.3)] transition-all group-hover:shadow-[0_8px_40px_rgba(37,99,235,0.45)] group-hover:scale-105 duration-500">
                                <MessageSquare size={24} className="text-white fill-white/10" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">Comm-Link</h1>
                                <p className="text-blue-500 text-[10px] font-black tracking-[0.5em] uppercase mt-1 transition-all group-hover:tracking-[0.6em] duration-700">Central Interface</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-400/80 bg-blue-400/5 px-4 py-1.5 rounded-full border border-blue-400/10 backdrop-blur-md">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                                SECURE NODE: {user.name?.split(' ')[0].toUpperCase()}
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-gray-600 text-[10px] font-black tracking-widest uppercase opacity-40">
                                <ShieldCheck size={12} />
                                <span>AES-256 E2E</span>
                            </div>
                        </div>
                    </div>

                    {/* INTERFACE TABS */}
                    <div className="flex p-1.5 bg-[#111]/80 backdrop-blur-2xl rounded-[1.5rem] border border-white/5 shadow-2xl self-start">
                        <button
                            onClick={() => { setActiveTab("rider"); setShowMobileList(true); }}
                            className={`flex items-center gap-2 md:gap-3 py-3 px-6 md:px-8 rounded-2xl text-[10px] md:text-[11px] font-black transition-all duration-500 uppercase tracking-widest relative overflow-hidden group ${activeTab === "rider"
                                ? "bg-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] scale-100"
                                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                }`}
                        >
                            <User size={16} className={activeTab === "rider" ? "fill-white/20" : ""} />
                            <span className="relative z-10">Pilot Channel</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab("support"); setShowMobileList(false); }}
                            className={`flex items-center gap-2 md:gap-3 py-3 px-6 md:px-8 rounded-2xl text-[10px] md:text-[11px] font-black transition-all duration-500 uppercase tracking-widest relative overflow-hidden group ${activeTab === "support"
                                ? "bg-emerald-600 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] scale-100"
                                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                }`}
                        >
                            <Headphones size={16} className={activeTab === "support" ? "fill-white/20" : ""} />
                            <span className="relative z-10">Concierge Desk</span>
                        </button>
                    </div>
                </header>

                {/* MAIN COMMAND INTERFACE */}
                <div className="flex-1 border border-white/10 rounded-[40px] md:rounded-[60px] shadow-[0_80px_150px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex backdrop-blur-[60px] bg-[#080808]/40 relative min-h-0">

                    {/* CHAT THREADS SIDEBAR */}
                    {activeTab === "rider" && (
                        <aside className={`${showMobileList ? "flex" : "hidden md:flex"} w-full md:w-[380px] flex-col border-r border-white/5 bg-[#0a0a0a]/80 shrink-0`}>
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-blue-500/80">Active Transmissions</h2>
                                    <div className="flex items-center gap-1.5 opacity-30">
                                        <Wifi size={14} />
                                        <span className="text-[9px] font-black tracking-widest uppercase">Live</span>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-all duration-300" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Scan identifiers..."
                                        className="w-full bg-white/[0.04] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm outline-none focus:border-blue-500/30 focus:bg-white/[0.06] transition-all placeholder:text-gray-700 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">
                                {loadingChats ? (
                                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                                        <Loader2 className="animate-spin text-blue-500/30" size={32} />
                                        <p className="text-[9px] font-black tracking-[0.3em] text-gray-700 uppercase">Indexing</p>
                                    </div>
                                ) : riderChats.length === 0 ? (
                                    <div className="p-12 text-center space-y-6">
                                        <div className="w-16 h-16 bg-white/[0.02] rounded-[2rem] mx-auto flex items-center justify-center border border-white/5">
                                            <Compass size={28} className="text-gray-800" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 leading-relaxed">No signals found within parameters.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {riderChats.map((chat) => (
                                            <button
                                                key={chat.roomId}
                                                onClick={() => handleSelectChat(chat)}
                                                className={`w-full p-5 flex items-center gap-5 rounded-[2rem] transition-all duration-500 group relative ${selectedChat?.roomId === chat.roomId
                                                    ? "bg-gradient-to-br from-blue-600 to-blue-700 shadow-[0_15px_40px_-5px_rgba(37,99,235,0.25)] scale-[1.02] z-10"
                                                    : "hover:bg-white/[0.04] border border-transparent"
                                                    }`}
                                            >
                                                <div className="relative shrink-0">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border-2 transition-all duration-700 group-hover:rotate-6 ${selectedChat?.roomId === chat.roomId
                                                        ? "bg-white/20 border-white/30 text-white"
                                                        : "bg-[#111] border-white/5 text-gray-600"
                                                        }`}>
                                                        {chat.senderName?.[0] || "?"}
                                                    </div>
                                                    {onlineStatus[chat.riderId] === "online" && (
                                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3.5px] border-[#0a0a0a] shadow-[0_0_15px_rgba(16,185,129,0.5)] z-20"></span>
                                                    )}
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-base font-black truncate uppercase tracking-tight ${selectedChat?.roomId === chat.roomId ? "text-white" : "text-gray-300"}`}>
                                                            {chat.senderName || "Unit Alpha"}
                                                        </span>
                                                        {chat.unreadCount > 0 && (
                                                            <span className="bg-white text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xl">
                                                                {chat.unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-[11px] truncate font-medium ${selectedChat?.roomId === chat.roomId ? "text-blue-100/60" : "text-gray-600"}`}>
                                                        {chat.lastMessage || "Establish peer link..."}
                                                    </p>
                                                </div>
                                                {selectedChat?.roomId === chat.roomId && (
                                                    <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-10 bg-white rounded-full"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </aside>
                    )}

                    {/* CHANNEL CONTENT */}
                    <main className={`${(activeTab === "rider" && showMobileList) ? "hidden md:flex" : "flex"} flex-1 flex-col min-w-0 bg-[#080808]/60 relative`}>

                        {/* CHANNEL NAVIGATION BOX/HEADER */}
                        <div className="h-24 md:h-28 px-6 md:px-12 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.03] to-transparent shrink-0 backdrop-blur-3xl z-30">
                            <div className="flex items-center gap-4 md:gap-6 min-w-0">
                                {activeTab === "rider" && (
                                    <button
                                        onClick={() => setShowMobileList(true)}
                                        className="md:hidden p-3 hover:bg-white/5 rounded-2xl transition-all active:scale-90 border border-white/5"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                )}
                                <div className="relative shrink-0 group">
                                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-3xl flex items-center justify-center font-black text-xl border-2 transition-all duration-700 shadow-2xl ${activeTab === "rider"
                                        ? "bg-blue-600/10 border-blue-500/20 text-blue-400 group-hover:scale-105"
                                        : "bg-emerald-600/10 border-emerald-500/20 text-emerald-400 group-hover:scale-105"
                                        }`}>
                                        {activeTab === "rider" ? (selectedChat?.senderName?.[0] || "?") : <Headphones size={28} className="fill-emerald-500/10" />}
                                    </div>
                                    <div className={`absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 border-[4px] md:border-[5px] border-[#080808] rounded-full transition-all duration-500 ${isOnline ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.7)]" : "bg-gray-800"}`}></div>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg md:text-3xl font-black tracking-tighter text-white uppercase italic truncate">
                                        {activeTab === "rider" ? (selectedChat ? selectedChat.senderName : "SYSTEM OFFLINE") : "Concierge Specialist"}
                                    </h3>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <span className={`text-[8px] md:text-[10px] font-black tracking-[0.3em] uppercase transition-colors duration-500 ${isOnline ? "text-emerald-500" : "text-gray-700"}`}>
                                            {isOnline ? "Link Synchronized" : "Connection Severed"}
                                        </span>
                                        <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                                        <span className="text-[8px] md:text-[10px] text-gray-500/50 font-black tracking-widest uppercase truncate">
                                            {activeTab === "rider" ? `VECT-ID: ${selectedChat?.riderId?.slice(-10).toUpperCase() || "---"}` : "24/7 Global Liaison"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden lg:flex items-center gap-6 opacity-20">
                                <Clock size={20} className="hover:opacity-100 transition-opacity cursor-help" />
                                <Lock size={20} className="hover:opacity-100 transition-opacity cursor-help" />
                            </div>
                        </div>

                        {/* MESSAGES FLOW */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-14 py-8 md:py-12 space-y-10 custom-scrollbar relative z-20">
                            {activeTab === "rider" && !selectedChat ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-12 space-y-8">
                                    <div className="w-24 h-24 md:w-32 md:h-32 bg-[#111] rounded-[3rem] flex items-center justify-center border border-white/5 relative group">
                                        <div className="absolute inset-4 rounded-[2rem] border-2 border-dashed border-white/5 animate-[spin_20s_linear_infinite]"></div>
                                        <Compass size={56} className="text-gray-900" />
                                        <Zap size={24} className="text-blue-500/20 absolute bottom-0 right-0 animate-bounce" />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-xl md:text-3xl font-black uppercase tracking-[0.2em] text-white/50 italic">Bridge Pending</h4>
                                        <p className="text-[10px] md:text-xs text-blue-500/40 font-black uppercase tracking-[0.4em] max-w-sm mx-auto leading-loose">Select an available node from the transponder list to begin encrypted field communication.</p>
                                    </div>
                                </div>
                            ) : messagesLoading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-8 grayscale animate-pulse">
                                    <div className="w-16 h-16 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                                    <span className="text-[10px] md:text-[12px] font-black tracking-[0.5em] uppercase text-gray-700">Reconstructing History</span>
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-10 pb-4">
                                    {messages.map((m, i) => (
                                        <div key={m._id || i} className={`flex ${m.senderId === user._id ? "justify-end" : "justify-start"}`}>
                                            <div className="flex flex-col space-y-2 max-w-[85%] md:max-w-[70%]">
                                                <div className={`p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-sm md:text-base shadow-2xl transition-all duration-500 ${m.senderId === user._id
                                                    ? (activeTab === "rider" ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none border border-white/10" : "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-tr-none border border-white/10")
                                                    : "bg-[#121212] text-gray-200 rounded-tl-none border border-white/5 backdrop-blur-xl"
                                                    }`}>
                                                    {m.messageType === "image" ? (
                                                        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 shadow-2xl">
                                                            <img src={m.fileUrl} alt="attachment" className="w-full h-auto max-h-[500px] object-cover hover:scale-105 transition-transform duration-1000" />
                                                        </div>
                                                    ) : (
                                                        <p className="font-bold leading-relaxed tracking-tight">{m.message}</p>
                                                    )}

                                                    <div className={`absolute -bottom-6 flex items-center gap-4 transition-opacity duration-500 ${m.senderId === user._id ? "right-4 flex-row-reverse" : "left-4"}`}>
                                                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest tabular-nums">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {m.senderId === user._id && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-800">{m.isRead ? "Verified" : "Syncing"}</span>
                                                                <CheckCheck size={12} className={m.isRead ? "text-blue-500" : "text-gray-800"} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {typingUser && (
                                        <div className="flex items-center gap-5 bg-white/[0.03] border border-white/5 w-fit px-8 py-4 rounded-[2rem] animate-in slide-in-from-left-6 duration-700 backdrop-blur-md">
                                            <div className="flex gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                                            </div>
                                            <span className="text-[11px] font-black text-blue-500/80 uppercase tracking-[0.4em] italic">Inbound response</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* SIGNAL INPUT SYSTEM */}
                        {roomId && (
                            <div className="p-8 md:p-14 border-t border-white/5 bg-gradient-to-t from-[#050505] to-transparent relative z-40">
                                <div className="max-w-[1100px] mx-auto flex items-center gap-4 bg-[#111] p-3 md:p-4 rounded-[3rem] border border-white/10 focus-within:border-blue-500/30 transition-all duration-700 shadow-2xl relative">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-4 md:p-6 text-gray-500 hover:text-white hover:bg-white/5 rounded-3xl transition-all duration-500"
                                        disabled={isUploading}
                                    >
                                        {isUploading ? <Loader2 size={24} className="animate-spin text-blue-500" /> : <Paperclip size={24} className="rotate-45" />}
                                    </button>

                                    <input
                                        value={input}
                                        onChange={(e) => onInputChange(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                        placeholder={activeTab === "rider" ? "Transmit signal..." : "Dispatch request..."}
                                        className="flex-1 bg-transparent text-lg md:text-xl py-4 px-4 outline-none placeholder:text-gray-800 font-extrabold tracking-tight text-white/90"
                                    />

                                    <button
                                        onClick={() => handleSend()}
                                        disabled={(!input.trim() && !isUploading) || isUploading}
                                        className={`w-16 h-16 md:w-20 md:h-20 rounded-[2.2rem] flex items-center justify-center transition-all duration-700 active:scale-90 disabled:opacity-5 shadow-2xl ${activeTab === "rider"
                                            ? "bg-blue-600 shadow-blue-600/20 hover:shadow-blue-600/40"
                                            : "bg-emerald-600 shadow-emerald-600/20 hover:shadow-emerald-600/40"
                                            }`}
                                    >
                                        <Send size={24} className="text-white fill-white/10" />
                                    </button>
                                </div>

                                {sendError && (
                                    <div className="mt-8 max-w-[800px] mx-auto p-4 md:p-6 bg-red-500/10 text-red-500 rounded-[2rem] border border-red-500/20 flex items-center justify-between text-[11px] font-black tracking-[0.4em] uppercase animate-in slide-in-from-bottom-8 duration-700">
                                        <div className="flex items-center gap-4 px-4">
                                            <ShieldCheck size={24} />
                                            <span>Telemetry Link Failed</span>
                                        </div>
                                        <button onClick={clearSendError} className="px-8 py-3 bg-red-500/20 rounded-2xl hover:bg-red-500/30 transition-all font-black border border-red-500/10">Retry Link</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.03); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.08); }
            `}</style>
        </div>
    );
}