import React, { useState, useEffect, useRef } from 'react';
import { useChat } from "@/hooks/useChat";

const SupportChat = ({ passengerId, user }) => {
    const roomId = `support_${passengerId}`;
    const { messages, sendMessage, typing, sendTyping, stopTyping, loading } = useChat(roomId, "support");
    const [input, setInput] = useState("");
    const scrollRef = useRef(null);

    // ✅ Auto-scroll to bottom logic
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, typing]);

    const handleSend = () => {
        if (input.trim()) {
            sendMessage(user._id, user.name, "passenger", input);
            setInput("");
            stopTyping();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        } else {
            sendTyping();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-[#1a1a1a]/85 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-2xl w-85 flex flex-col transition-all duration-300">
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1a1a1a] rounded-full animate-pulse"></span>
                    </div>
                    <div>
                        <h3 className="text-white text-sm font-bold tracking-wide">OnWay Support</h3>
                        <p className="text-[10px] text-green-500/80 font-medium">Online | 24/7 Assistance</p>
                    </div>
                </div>

                {/* Chat Messages Body */}
                <div 
                    ref={scrollRef}
                    className="h-80 overflow-y-auto mb-4 space-y-4 px-1 scroll-smooth custom-scrollbar"
                >
                    {loading ? (
                        <div className="flex justify-center items-center h-full text-gray-500 text-xs">
                            Loading history...
                        </div>
                    ) : (
                        messages.map((m, i) => (
                            <div key={i} className={`flex flex-col ${m.senderRole === 'support' ? "items-start" : "items-end"}`}>
                                <div className={`p-3 max-w-[85%] rounded-2xl text-sm leading-relaxed shadow-sm ${
                                    m.senderRole === 'support' 
                                    ? "bg-white/10 text-gray-200 rounded-tl-none border border-white/5" 
                                    : "bg-green-600 text-white rounded-tr-none shadow-green-900/20"
                                }`}>
                                    <p>{m.message}</p>
                                </div>
                                <span className="text-[9px] text-gray-500 mt-1.5 px-1 font-medium">
                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))
                    )}
                    
                    {typing && (
                        <div className="flex items-center gap-2 text-[10px] text-green-500 font-medium animate-pulse ml-1">
                            <span className="flex gap-1">
                                <span className="w-1 h-1 bg-green-500 rounded-full animate-bounce"></span>
                                <span className="w-1 h-1 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1 h-1 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </span>
                            Agent is typing...
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="relative flex items-center group">
                    <input
                        value={input}
                        onKeyDown={handleKeyDown}
                        onBlur={() => stopTyping()}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full bg-white/5 text-white text-xs rounded-full py-3.5 px-5 pr-12 border border-white/10 outline-none focus:border-green-500/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                        placeholder="Type your message..."
                    />
                    <button 
                        onClick={handleSend} 
                        disabled={!input.trim()}
                        className={`absolute right-1.5 p-2 rounded-full transition-all duration-300 ${
                            input.trim() ? "bg-green-500 text-white shadow-lg shadow-green-500/30 scale-100" : "text-gray-600 scale-90 opacity-50"
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupportChat;