"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    MessageSquare,
    Send,
    Search,
    Phone,
    MoreVertical,
    Paperclip,
    CheckCheck,
    Loader2,
} from "lucide-react";
import { useChat } from "@/hooks/useChat";

export default function ChatSupportPage({ agentUser }) {
    const [sessions, setSessions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedChat, setSelectedChat] = useState(null);
    const [input, setInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    // ---------------- Hook ----------------
    const {
        messages,
        sendMessage,
        typingUser,
        sendTyping,
        stopTyping,
        socket,
        markAsRead,
        fetchMessages,
    } = useChat(
        selectedChat?.roomId,
        "support",
        agentUser?._id,
        "OnWay Support",
        "support"
    );

    // ---------------- Fetch Sessions ----------------
    const fetchSessions = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/support/sessions`
            );
            const data = await res.json();
            setSessions(data);
        } catch (err) {
            console.error("Session fetch error:", err);
        }
    };

    // ---------------- Select Chat ----------------
    const handleSelectChat = (session) => {
        setSelectedChat({
            roomId: session._id,
            name: session.senderName,
            passengerId: session.passengerId,
        });
        fetchMessages(session._id);
        setTimeout(() => markAsRead(), 100);
    };

    // ---------------- Socket Listeners ----------------
    useEffect(() => {
        fetchSessions();
        if (!socket) return;

        // Receive messages in real-time
        const handleReceive = (msg) => {
            fetchSessions();
            if (selectedChat?.roomId === msg.roomId) {
                fetchMessages(selectedChat.roomId);
                markAsRead();
            }
        };

        socket.on("receiveMessage", handleReceive);
        socket.on("supportSessionUpdated", fetchSessions);

        return () => {
            socket.off("receiveMessage", handleReceive);
            socket.off("supportSessionUpdated");
        };
    }, [socket, selectedChat?.roomId]);

    // ---------------- Auto Scroll ----------------
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, typingUser]);

    // ---------------- File Upload ----------------
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            );
            const data = await res.json();
            if (data.secure_url) handleSend("", data.secure_url, "image");
        } catch (err) {
            console.error("Upload failed", err);
            alert("Image upload failed");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // ---------------- Send Message ----------------
    // Agent side
    const handleSend = (text = input, fileUrl = null, type = "text") => {
        if (!selectedChat) return;
        sendMessage(text, fileUrl, type);
        setInput("");
        stopTyping();
    };

    // ---------------- Search Filter ----------------
    const filteredSessions = useMemo(() => {
        return sessions.filter(
            (s) =>
                s.senderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.passengerId?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [sessions, searchQuery]);

    return (
        <div className="flex h-screen bg-[#F8F9FD] p-4 lg:p-8">
            <div className="max-w-400 w-full mx-auto bg-white rounded-4xl shadow flex overflow-hidden">

                {/* ================= SIDEBAR ================= */}
                <div className="w-80 lg:w-100 border-r flex flex-col">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold mb-6">OnWay Support</h2>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search conversation..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border"
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                        {filteredSessions.map((session) => (
                            <div
                                key={session._id}
                                onClick={() => handleSelectChat(session)}
                                className={`p-4 rounded-xl cursor-pointer flex gap-4
${selectedChat?.roomId === session._id ? "bg-gray-100" : "hover:bg-gray-50"}`}
                            >
                                <div className="w-12 h-12 rounded-lg bg-green-600 text-white flex items-center justify-center font-bold">
                                    {session.senderName?.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold">{session.senderName || "Passenger"}</h4>
                                    <p className="text-xs text-gray-500 truncate">{session.lastMessage || "Start conversation"}</p>
                                </div>
                                {session.unreadCount > 0 && (
                                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                                        {session.unreadCount}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= CHAT WINDOW ================= */}
                <div className="flex-1 flex flex-col">
                    {selectedChat ? (
                        <>
                            {/* HEADER */}
                            <div className="px-8 py-5 border-b flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{selectedChat.name}</h3>
                                    <p className="text-xs text-green-500">Active</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded"><Phone size={20} /></button>
                                    <button className="p-2 hover:bg-gray-100 rounded"><MoreVertical size={20} /></button>
                                </div>
                            </div>

                            {/* MESSAGES */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.senderRole === "support" ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[70%] p-4 rounded-xl ${m.senderRole === "support" ? "bg-green-600 text-white" : "bg-gray-100"}`}>
                                            {m.messageType === "image" ? (
                                                <img src={m.fileUrl} className="rounded-lg max-h-60" />
                                            ) : (
                                                <p>{m.message}</p>
                                            )}
                                            <div className="text-[10px] mt-1 flex items-center gap-1 justify-end">
                                                <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                {m.senderRole === "support" && (
                                                    <CheckCheck size={14} className={m.isRead ? "text-green-200" : "text-white/60"} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {typingUser && (
                                    <div className="text-xs text-gray-400 flex items-center gap-2">
                                        <Loader2 size={14} className="animate-spin" /> User typing...
                                    </div>
                                )}
                            </div>

                            {/* INPUT */}
                            <div className="p-6 border-t">
                                <div className="flex gap-3">
                                    <button onClick={() => fileInputRef.current.click()} className="p-3 bg-gray-100 rounded-lg">
                                        {isUploading ? <Loader2 className="animate-spin" /> : <Paperclip />}
                                    </button>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    <input
                                        value={input}
                                        onChange={(e) => { setInput(e.target.value); sendTyping(); }}
                                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                        onBlur={stopTyping}
                                        placeholder="Write message..."
                                        className="flex-1 border rounded-lg px-4"
                                    />
                                    <button onClick={() => handleSend()} className="bg-green-600 text-white px-5 rounded-lg">
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <MessageSquare size={40} className="text-gray-300" />
                            <h3 className="mt-4 font-semibold">Support Dashboard</h3>
                            <p className="text-gray-400 text-sm">Select a conversation</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}