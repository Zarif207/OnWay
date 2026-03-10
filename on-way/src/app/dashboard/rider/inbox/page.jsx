"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
    Send, 
    Paperclip, 
    Loader2, 
    Search, 
    ChevronLeft, 
    MessageSquare, 
    Users, 
    Clock, 
    CheckCheck,
    Wifi,
    Compass,
    ShieldCheck
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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

    const roomId = selected?.roomId || null;
    const { 
        messages, 
        sendMessage, 
        typingUser, 
        sendTyping, 
        stopTyping, 
        socket, 
        markAsRead, 
        onlineStatus,
        sendError, 
        clearSendError 
    } = useChat(
        roomId, 
        "ride", 
        user?.id, 
        user?.name || "Rider", 
        "rider", 
        selected?.passengerId
    );

    const fetchChats = useCallback(async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`${SOCKET_URL}/api/rider/chats/${user.id}`);
            if (!res.ok) throw new Error("Failed to fetch sessions");
            const data = await res.json();
            setChats(data || []);
            
            // Auto-select first chat if none selected and data exists
            if (!selected && data.length > 0) {
                // We don't auto-select on mobile to show the list first
                if (window.innerWidth >= 768) {
                    const first = data[0];
                    setSelected({ 
                        roomId: first.roomId, 
                        name: first.senderName, 
                        passengerId: first.passengerId 
                    });
                }
            }
        } catch (err) {
            console.error("Fetch chats error:", err);
        }
    }, [user, selected]);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    useEffect(() => {
        if (!socket) return;
        
        const onReceive = (msg) => {
            fetchChats();
            if (msg.roomId === roomId) markAsRead();
        };
        
        const onUpdate = () => {
            fetchChats();
        };

        socket.on("receiveMessage", onReceive);
        socket.on("riderChatUpdated", onUpdate);
        
        return () => {
            socket.off("receiveMessage", onReceive);
            socket.off("riderChatUpdated", onUpdate);
        };
    }, [socket, fetchChats, roomId, markAsRead]);

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

    const handleSelect = (c) => {
        setSelected({ 
            roomId: c.roomId, 
            name: c.senderName, 
            passengerId: c.passengerId 
        });
        setShowMobileList(false);
        markAsRead();
    };

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

    const filteredChats = chats.filter(c => 
        c.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.passengerId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (userLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#F8F9FD] text-gray-400">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="text-xs font-bold uppercase tracking-widest">Synchronizing Fleet Comms...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#F8F9FD] text-center p-6">
                <div className="w-16 h-16 bg-red-50 rounded-2xl mb-6 flex items-center justify-center border border-red-100 shadow-sm">
                    <Lock size={28} className="text-red-500" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2 italic">AUTHENTICATION REQUIRED</h2>
                <p className="text-gray-500 text-xs max-w-xs uppercase tracking-wider font-bold">Please login to access the Pilot Command Center.</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F8F9FD] text-gray-700 font-sans overflow-hidden md:p-4 lg:p-6">
            <div className={`max-w-[1600px] w-full mx-auto bg-white rounded-none md:rounded-[2.5rem] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.08)] flex overflow-hidden border border-gray-100 transition-all duration-700 relative h-full`}>
                
                {/* SIDEBAR (PASSENGER LIST) */}
                <aside className={`${showMobileList ? "flex" : "hidden md:flex"} w-full md:w-[380px] flex-col border-r border-gray-50 bg-[#FBFBFF] shrink-0 h-full`}>
                    <div className="p-6 lg:p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">Inbox</h1>
                                <p className="text-blue-600 text-[10px] font-black tracking-[0.3em] uppercase mt-1">Passenger Relay</p>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-30">
                                <Wifi size={14} className="text-emerald-500" />
                                <span className="text-[9px] font-black tracking-widest text-emerald-600">LIVE</span>
                            </div>
                        </div>
                        
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-all duration-300" size={16} />
                            <input 
                                type="text" 
                                placeholder="Filter transmissions..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 text-sm outline-none focus:border-blue-500/30 focus:bg-white shadow-sm transition-all placeholder:text-gray-300 font-bold"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">
                        {filteredChats.length === 0 ? (
                            <div className="p-12 text-center space-y-4 opacity-30">
                                <Compass size={40} className="mx-auto text-gray-400" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No signals detected</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredChats.map((c) => (
                                    <button 
                                        key={c.roomId} 
                                        onClick={() => handleSelect(c)} 
                                        className={`w-full p-4 flex items-center gap-4 rounded-3xl transition-all duration-300 group relative ${
                                            selected?.roomId === c.roomId 
                                                ? "bg-white shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] scale-[1.02] z-10 border border-blue-50" 
                                                : "hover:bg-blue-50/50 border border-transparent"
                                        }`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border-2 transition-all duration-500 group-hover:rotate-3 ${
                                                selected?.roomId === c.roomId 
                                                    ? "bg-blue-600 border-blue-600 text-white" 
                                                    : "bg-white border-gray-100 text-gray-400"
                                            }`}>
                                                {(c.senderName || "?")[0].toUpperCase()}
                                            </div>
                                            {onlineStatus[c.passengerId] === "online" && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3.5px] border-white shadow-[0_0_15px_rgba(16,185,129,0.4)] z-20"></span>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h4 className={`text-sm font-black truncate uppercase tracking-tight ${selected?.roomId === c.roomId ? "text-blue-600" : "text-gray-800"}`}>
                                                    {c.senderName || "Unknown Unit"}
                                                </h4>
                                                <span className="text-[9px] text-gray-400 font-bold tabular-nums">
                                                    {c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center gap-2">
                                                <p className={`text-[11px] truncate font-bold flex-1 ${c.unreadCount > 0 ? "text-blue-500" : "text-gray-400"}`}>
                                                    {c.lastMessage || "Link established..."}
                                                </p>
                                                {c.unreadCount > 0 && (
                                                    <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg">
                                                        {c.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {selected?.roomId === c.roomId && (
                                            <div className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-1.5 h-10 bg-blue-600 rounded-full animate-pulse"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                {/* MAIN CHAT AREA */}
                <main className={`${(!showMobileList || !selected) ? "flex" : "hidden md:flex"} flex-1 flex-col bg-white relative h-full`}>
                    {selected ? (
                        <>
                            {/* CHAT HEADER */}
                            <header className="h-24 md:h-28 px-6 md:px-10 border-b border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-3xl shrink-0 z-30">
                                <div className="flex items-center gap-4 md:gap-5 min-w-0">
                                    <button 
                                        onClick={() => setShowMobileList(true)} 
                                        className="md:hidden p-3 hover:bg-gray-100 rounded-2xl transition-all active:scale-90 border border-gray-200"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div className="relative shrink-0 group">
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-3xl flex items-center justify-center font-black text-xl text-blue-600 border-2 border-blue-100/50 transition-all duration-700 shadow-sm group-hover:scale-105">
                                            {selected.name ? selected.name[0] : "P"}
                                        </div>
                                        <div className={`absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 border-[4px] border-white rounded-full transition-all duration-500 ${onlineStatus[selected.passengerId] === "online" ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-gray-200"}`}></div>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg md:text-2xl font-black tracking-tighter text-gray-900 uppercase italic truncate">{selected.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] md:text-[10px] font-black tracking-[0.2em] uppercase transition-colors duration-500 ${onlineStatus[selected.passengerId] === "online" ? "text-emerald-500" : "text-gray-400"}`}>
                                                {onlineStatus[selected.passengerId] === "online" ? "Link Synchronized" : "Connection Idle"}
                                            </span>
                                            <span className="w-1 h-1 bg-gray-100 rounded-full"></span>
                                            <span className="text-[8px] md:text-[10px] text-gray-400 font-bold tracking-widest uppercase truncate opacity-50">RELAY-ID: {selected.passengerId?.slice(-8).toUpperCase() || "---"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden lg:flex items-center gap-6 opacity-20 hover:opacity-100 transition-opacity">
                                    <ShieldCheck size={20} className="text-gray-400" />
                                    <Clock size={20} className="text-gray-400" />
                                </div>
                            </header>
                            
                            {/* MESSAGES FLOW */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-10 custom-scrollbar bg-[#FAFAFF]/30">
                                {messagesLoading ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4 grayscale animate-pulse">
                                        <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                                        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-400">Syncing Protocol</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col space-y-8 pb-4">
                                        {messages.map((m, i) => (
                                            <div key={m._id || i} className={`flex ${m.senderId === user._id ? "justify-end" : "justify-start"}`}>
                                                <div className="flex flex-col space-y-2 max-w-[85%] md:max-w-[75%] lg:max-w-[65%]">
                                                    <div className={`p-4 md:p-6 rounded-[2rem] text-sm md:text-[15px] shadow-sm transition-all duration-500 ${
                                                        m.senderId === user._id 
                                                            ? "bg-blue-600 text-white rounded-tr-none border border-blue-500 shadow-blue-600/10" 
                                                            : "bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-gray-200/50"
                                                    }`}>
                                                        {m.messageType === "image" ? (
                                                            <div className="relative overflow-hidden rounded-[1.5rem] border border-inherit shadow-2xl">
                                                                <img src={m.fileUrl} alt="Payload" className="w-full h-auto max-h-[400px] object-cover transition-transform duration-1000 hover:scale-105" />
                                                            </div>
                                                        ) : (
                                                            <p className="font-bold leading-relaxed tracking-tight">{m.message}</p>
                                                        )}
                                                        
                                                        <div className={`absolute -bottom-6 flex items-center gap-3 transition-opacity duration-500 ${m.senderId === user._id ? "right-4 flex-row-reverse" : "left-4"}`}>
                                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest tabular-nums italic">
                                                                {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </span>
                                                            {m.senderId === user._id && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-200">{m.isRead ? "Seen" : "Sent"}</span>
                                                                    <CheckCheck size={12} className={m.isRead ? "text-blue-500" : "text-gray-300"} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {typingUser && (
                                            <div className="flex items-center gap-4 bg-blue-50/50 border border-blue-100 w-fit px-6 py-3 rounded-full animate-in slide-in-from-left-6 duration-700">
                                                <div className="flex gap-1.5">
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                                                </div>
                                                <span className="text-[10px] font-black text-blue-600/80 uppercase tracking-[0.3em] italic">Passenger replying</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* INPUT BOX */}
                            <footer className="p-6 md:p-10 border-t border-gray-50 bg-white relative z-40">
                                <div className="max-w-[1000px] mx-auto flex items-center gap-4 bg-gray-50/80 p-3 rounded-[2.5rem] border border-gray-100 focus-within:border-blue-500/20 focus-within:bg-white transition-all duration-500 group">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        accept="image/*"
                                        className="hidden" 
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="p-4 text-gray-400 hover:text-blue-500 hover:bg-white rounded-2xl transition-all duration-300 active:scale-90"
                                    >
                                        {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Paperclip size={24} className="rotate-45" />}
                                    </button>
                                    
                                    <input 
                                        value={input} 
                                        onChange={(e) => onInputChange(e.target.value)} 
                                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                        placeholder="Transmit signal..." 
                                        className="flex-1 bg-transparent text-base md:text-xl py-4 outline-none placeholder:text-gray-300 font-extrabold tracking-tight" 
                                    />
                                    
                                    <button 
                                        onClick={() => handleSend()} 
                                        disabled={(!input.trim() && !isUploading) || isUploading}
                                        className="bg-blue-600 disabled:bg-gray-200 text-white p-5 rounded-3xl transition-all active:scale-90 shadow-xl shadow-blue-600/20 disabled:shadow-none"
                                    >
                                        <Send size={24} className="fill-white/10" />
                                    </button>
                                </div>
                                
                                {sendError && (
                                    <div className="mt-6 max-w-[800px] mx-auto p-4 bg-red-50 text-red-500 rounded-2xl border border-red-100 flex items-center justify-between text-[10px] font-black tracking-[0.3em] uppercase animate-in slide-in-from-bottom-6">
                                        <div className="flex items-center gap-4 px-4">
                                            <ShieldCheck size={18} />
                                            <span>Telemetry Link Failed</span>
                                        </div>
                                        <button onClick={clearSendError} className="px-6 py-2 bg-red-100 rounded-xl hover:bg-red-200 transition-all">Dismiss</button>
                                    </div>
                                )}
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#FAFAFF]/30 space-y-8 animate-in fade-in duration-1000">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[3rem] flex items-center justify-center border border-gray-100 shadow-sm relative group">
                                <div className="absolute inset-4 rounded-[2rem] border-2 border-dashed border-gray-100 animate-[spin_20s_linear_infinite]"></div>
                                <Compass size={56} className="text-gray-200" />
                                <Wifi size={24} className="text-blue-500/10 absolute bottom-0 right-0 animate-bounce" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl md:text-3xl font-black uppercase tracking-[0.2em] text-gray-900/20 italic">Bridge Pending</h3>
                                <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-[0.4em] max-w-sm mx-auto leading-loose italic">Select an available relay node from the terminal to begin encrypted field communication.</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.03); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.08); }
            `}</style>
        </div>
    );
}

