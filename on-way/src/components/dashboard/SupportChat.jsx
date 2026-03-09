"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from "@/hooks/useChat";

const SupportChat = ({ passengerId, user }) => {
    const roomId = `support_${passengerId}`;
    const { 
        messages, 
        sendMessage, 
        typingUser, 
        sendTyping, 
        stopTyping, 
        loading, 
        markAsRead 
    } = useChat(roomId, "support", user?._id, user?.name, "passenger");
    
    const [input, setInput] = useState("");
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto scroll logic
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, typingUser]);

    // Chat open thakle auto read hobe
    const handleChatClick = () => {
        markAsRead();
    };

    const handleSend = (text = input, fileUrl = null, type = "text") => {
        if (!text.trim() && !fileUrl) return;
        sendMessage(text, fileUrl, type);
        setInput("");
        stopTyping();
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInput(val);
        if (val.length > 0) {
            sendTyping();
        } else {
            stopTyping();
        }
    };

    // Image upload handler (Triggering hidden input)
    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Logic: Upload file to your storage (Cloudinary) and get URL
            // const url = await uploadToCloudinary(file);
            // handleSend("", url, "image");
            console.log("File selected:", file.name);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50" onClick={handleChatClick}>
            <div className="bg-[#1a1a1a]/95 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-2xl w-80 flex flex-col transition-all duration-300">
                
                {/* Header Section */}
                <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1a1a1a] rounded-full animate-pulse"></span>
                    </div>
                    <div>
                        <h3 className="text-white text-sm font-bold tracking-wide">OnWay Support</h3>
                        <p className="text-[10px] text-green-500 font-medium italic uppercase tracking-tighter">Active | Live Help</p>
                    </div>
                </div>

                {/* Messages Body */}
                <div ref={scrollRef} className="h-80 overflow-y-auto mb-4 space-y-4 px-1 custom-scrollbar flex flex-col">
                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-full gap-2 opacity-40">
                            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[10px] text-white italic">Establishing connection...</p>
                        </div>
                    ) : (
                        messages.map((m, i) => (
                            <div key={i} className={`flex flex-col ${m.senderId === user?._id ? "items-end" : "items-start"}`}>
                                <div className={`p-3 max-w-[85%] rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                                    m.senderId === user?._id 
                                    ? "bg-green-600 text-white rounded-tr-none"
                                    : "bg-white/10 text-gray-200 rounded-tl-none border border-white/5" 
                                }`}>
                                    
                                    {/* Image Logic */}
                                    {m.messageType === 'image' ? (
                                        <img src={m.fileUrl} alt="support" className="rounded-lg max-h-40 object-cover cursor-pointer hover:opacity-90 transition" />
                                    ) : (
                                        <p>{m.message}</p>
                                    )}
                                </div>
                                
                                {/* Status & Time */}
                                <div className="flex items-center gap-1 mt-1 px-1">
                                    <span className="text-[8px] text-gray-500 uppercase">
                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {m.senderId === user?._id && (
                                        <span className={`text-[8px] font-bold ${m.isRead ? "text-green-400" : "text-gray-600"}`}>
                                            • {m.isRead ? "Seen" : "Sent"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    
                    {/* Typing Indicator */}
                    {typingUser && (
                        <div className="flex items-center gap-2 text-[10px] text-green-400 ml-1 bg-white/5 w-fit py-1 px-3 rounded-full border border-white/5">
                            <div className="flex gap-0.5">
                                <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></span>
                                <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                            <span className="italic">{typingUser} is typing...</span>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="relative flex items-center gap-2">
                    {/* Image Upload Button */}
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />

                    <div className="relative flex-grow">
                        <input
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            onBlur={stopTyping}
                            className="w-full bg-white/5 text-white text-xs rounded-full py-3 px-5 pr-12 border border-white/10 outline-none focus:border-green-500/50 transition-all"
                            placeholder="Describe your issue..."
                        />
                        <button 
                            onClick={() => handleSend()} 
                            disabled={!input.trim()}
                            className="absolute right-1.5 top-1.5 p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all active:scale-90 disabled:opacity-30"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportChat;