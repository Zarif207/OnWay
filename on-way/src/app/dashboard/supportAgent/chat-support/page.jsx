"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
    const typingTimeout = useRef(null);

    const roomId = selectedChat?.roomId || null;

    const {
        messages,
        sendMessage,
        typingUser,
        sendTyping,
        stopTyping,
        socket,
        markAsRead,
    } = useChat(roomId, "support", agentUser?._id, "OnWay Support", "support");

    const baseUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";

    // ================= FETCH SESSIONS =================

    const fetchSessions = useCallback(async () => {
        try {
            const res = await fetch(`${baseUrl}/api/support/sessions`);

            if (!res.ok) throw new Error("Session fetch failed");

            const data = await res.json();

            setSessions(data || []);
        } catch (err) {
            console.error("Session fetch error:", err);
        }
    }, [baseUrl]);

    // ================= SELECT CHAT =================

    const handleSelectChat = (session) => {
        const chat = {
            roomId: session.roomId || session._id,
            name: session.senderName,
            passengerId: session.passengerId,
        };

        setSelectedChat(chat);
    };

    // ================= SOCKET LISTENER =================

    useEffect(() => {
        fetchSessions();

        if (!socket) return;

        const handleReceive = (msg) => {
            fetchSessions();

            if (msg.roomId === roomId) {
                markAsRead();
            }
        };

        socket.on("receiveMessage", handleReceive);
        socket.on("supportSessionUpdated", fetchSessions);

        return () => {
            socket.off("receiveMessage", handleReceive);
            socket.off("supportSessionUpdated", fetchSessions);
        };
    }, [socket, roomId, fetchSessions, markAsRead]);

    // ================= AUTO SCROLL =================

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, typingUser]);

    // ================= SEND MESSAGE =================

    const handleSend = () => {
        if (!input.trim() || !roomId) return;

        sendMessage(input);
        setInput("");
        stopTyping();
    };

    // ENTER KEY SEND
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    // ================= FILE UPLOAD =================

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append(
            "upload_preset",
            process.env.NEXT_PUBLIC_CLOUDINARY_PRESET
        );

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            );

            const data = await res.json();

            if (data.secure_url) {
                sendMessage("", data.secure_url, "image");
            }
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setIsUploading(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // ================= TYPING =================

    const handleTyping = (value) => {
        setInput(value);

        sendTyping();

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        typingTimeout.current = setTimeout(() => {
            stopTyping();
        }, 1500);
    };

    // ================= SEARCH =================

    const filteredSessions = useMemo(() => {
        const query = searchQuery.toLowerCase();

        return sessions.filter(
            (s) =>
                s.senderName?.toLowerCase().includes(query) ||
                s.passengerId?.toLowerCase().includes(query)
        );
    }, [sessions, searchQuery]);

    return (
        <div className="flex h-screen bg-[#F8F9FD] p-4">
            <div className="max-w-[1400px] w-full mx-auto bg-white rounded-3xl shadow-lg flex overflow-hidden">

                {/* SIDEBAR */}

                <div className="w-80 border-r">

                    <div className="p-6">

                        <h2 className="text-xl font-bold mb-4">OnWay Support</h2>

                        <input
                            placeholder="Search..."
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        />

                    </div>

                    <div className="overflow-y-auto">

                        {filteredSessions.map((session) => (

                            <div
                                key={session._id}
                                onClick={() => handleSelectChat(session)}
                                className="p-3 cursor-pointer hover:bg-gray-100"
                            >

                                <h4 className="font-semibold">{session.senderName}</h4>

                                <p className="text-sm text-gray-500 truncate">
                                    {session.lastMessage}
                                </p>

                            </div>

                        ))}

                        {filteredSessions.length === 0 && (
                            <div className="p-4 text-center text-gray-400 text-sm">
                                No chats found
                            </div>
                        )}

                    </div>

                </div>

                {/* CHAT AREA */}

                <div className="flex-1 flex flex-col">

                    {selectedChat ? (

                        <>

                            <div className="p-4 border-b font-bold flex justify-between">

                                {selectedChat.name}

                            </div>

                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 space-y-4"
                            >

                                {messages.map((m) => (

                                    <div
                                        key={m._id}
                                        className={`flex ${m.senderRole === "support"
                                            ? "justify-end"
                                            : "justify-start"
                                            }`}
                                    >

                                        <div className="bg-gray-100 p-3 rounded-lg max-w-xs">

                                            {m.messageType === "image" ? (

                                                <img
                                                    src={m.fileUrl}
                                                    className="max-h-60 rounded-lg"
                                                />

                                            ) : (

                                                m.message

                                            )}

                                        </div>

                                    </div>

                                ))}

                                {typingUser && (
                                    <div className="text-sm text-gray-400">
                                        {typingUser} typing...
                                    </div>
                                )}

                            </div>

                            <div className="p-4 border-t flex gap-2 items-center">

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    hidden
                                    onChange={handleFileUpload}
                                />

                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="p-2"
                                >
                                    <Paperclip size={18} />
                                </button>

                                <input
                                    value={input}
                                    onChange={(e) => handleTyping(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type message..."
                                    className="flex-1 border rounded-lg px-3 py-2"
                                />

                                <button
                                    onClick={handleSend}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-1"
                                >

                                    {isUploading ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <Send size={18} />
                                    )}

                                </button>

                            </div>

                        </>

                    ) : (

                        <div className="flex-1 flex items-center justify-center text-gray-400">

                            Select a chat

                        </div>

                    )}

                </div>

            </div>
        </div>
    );
}