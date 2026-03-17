"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Send, X, MessageCircle } from "lucide-react";

export default function ChatSupport() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, loading]);

    const sendMessage = async () => {
        if (!message.trim() || loading) return;

        const userMessage = { role: "user", text: message };

        setChatHistory(prev => [...prev, userMessage]);
        setMessage("");
        setLoading(true);

        const updatedHistory = [...chatHistory, userMessage];

        const geminiHistory = updatedHistory
            .map(chat => ({
                role: chat.role === "user" ? "user" : "model",
                parts: [{ text: chat.text }]
            }))
            .filter((msg, index) => !(index === 0 && msg.role === "model"));

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/support/chat`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: userMessage.text,
                        history: geminiHistory
                    }),
                }
            );

            const data = await res.json();

            setChatHistory(prev => [
                ...prev,
                { role: "ai", text: data.reply || "No response received." }
            ]);
        } catch (error) {
            setChatHistory(prev => [
                ...prev,
                { role: "ai", text: "I'm having trouble connecting right now." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-100 flex flex-col items-end font-sans">
            {isOpen && (
                <div className="mb-1 w-80 sm:w-90 bg-blue-300/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-120 ">

                    {/* Header */}
                    <div className="bg-cyan-500 p-2 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative w-26 h-10 ">
                                <Image src="/icon2.png" alt="Logo" fill className="object-contain p-1.5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-sm">OnWay Support Agent</h2>
                                <p className="text-[10px] text-cyan-700 font-semibold">Always Active For You</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/10 p-2 rounded-full"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-4 bg-blue-100">

                        {chatHistory.length === 0 && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100  p-2 rounded-2xl rounded-tl-none shadow-sm text-[13px]">
                                    Hello! I am OnWay Assistant. How can I help you?
                                </div>
                            </div>
                        )}

                        {chatHistory.map((chat, index) => (
                            <div
                                key={index}
                                className={`flex ${chat.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[85%] p-2 rounded-2xl text-[13px] shadow-sm ${chat.role === "user"
                                        ? "bg-blue-500 text-white rounded-tr-none"
                                        : "bg-gray-100 text-slate-700  rounded-tl-none"
                                        }`}
                                >
                                    {chat.text}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 p-2 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-.2s]" />
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-.4s]" />
                                </div>
                            </div>
                        )}

                        <div ref={scrollRef} />
                    </div>

                    {/* Input */}
                    <div className="p-2 bg-white">
                        <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="How can we help?"
                                className="flex-1 px-2 py-1 bg-transparent text-[13px] focus:outline-none"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading || !message.trim()}
                                className="bg-blue-500 text-white px-2 rounded-xl hover:bg-blue-600 disabled:bg-slate-300"
                            >
                                <Send className="w-6 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl shadow-2xl bg-blue-500 text-white hover:scale-110 active:scale-95 transition"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
            </button>
        </div>
    );
}