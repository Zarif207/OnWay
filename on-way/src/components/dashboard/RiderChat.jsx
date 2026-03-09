"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";

const RiderChat = ({ rideId, user }) => {
  const {
    messages,
    sendMessage,
    typingUser, // useChat update onujayi typingUser hobe
    sendTyping,
    stopTyping,
    loading,
    onlineStatus,
    markAsRead
  } = useChat(rideId, "ride", user._id, user.name, user.role);

  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, typingUser]);

  // Click korle auto seen hoye jabe
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

  // Dummy Image Upload logic (Team ke bolben Cloudinary implement korte)
  const handleImageClick = () => fileInputRef.current.click();
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Logic: Upload to Cloudinary -> Get URL -> sendMessage
      console.log("Uploading file...", file);
      // handleSend("", "https://your-cloudinary-link.com", "image");
    }
  };

  return (
    <div 
      onClick={handleChatClick}
      className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div>
          <h3 className="text-white font-bold text-sm tracking-tight">OnWay Messenger</h3>
          <p className="text-[10px] text-gray-400 capitalize">Ride ID: #{rideId.slice(-6)}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${onlineStatus[user.role === 'rider' ? 'passengerId' : 'riderId'] === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
          <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">
            {onlineStatus[user.role === 'rider' ? 'passengerId' : 'riderId'] === 'online' ? "Online" : "Away"}
          </span>
        </div>
      </div>

      {/* Messages Body */}
      <div ref={scrollRef} className="h-72 overflow-y-auto mb-4 space-y-3 pr-1 custom-scrollbar flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-[10px] text-white italic">Syncing chats...</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.senderId === user._id ? "items-end" : "items-start"}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] shadow-sm ${
                  m.senderId === user._id
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-white/10 text-gray-200 rounded-tl-none border border-white/5"
                }`}>
                
                {m.senderId !== user._id && (
                  <p className="text-[9px] opacity-50 mb-1 uppercase tracking-tight font-bold">
                    {m.senderName}
                  </p>
                )}
                
                {/* Image Message Support */}
                {m.messageType === "image" ? (
                  <img src={m.fileUrl} alt="sent" className="rounded-lg mb-1 max-h-40 object-cover" />
                ) : m.messageType === "voice" ? (
                  <div className="flex items-center gap-2 py-1">
                     <span className="text-lg">🎤</span>
                     <div className="w-24 h-1 bg-white/30 rounded-full"></div>
                  </div>
                ) : (
                  <p className="leading-relaxed">{m.message}</p>
                )}
              </div>

              {/* Message Status */}
              {m.senderId === user._id && (
                <div className="flex items-center gap-1 mt-1 mr-1">
                  <span className="text-[9px] text-blue-400 font-medium italic">
                    {m.isRead ? "Seen" : "Sent"}
                  </span>
                  {m.isRead && <span className="text-[8px]">✔️</span>}
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typingUser && (
          <div className="flex items-center gap-2 text-[10px] text-blue-400 ml-1">
            <div className="flex gap-0.5">
              <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="italic">{typingUser} is typing...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2 items-center bg-white/5 p-1 rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-all">
        {/* Attachment Button */}
        <button onClick={handleImageClick} className="ml-2 p-1 text-gray-400 hover:text-blue-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={onFileChange} accept="image/*" />

        <input
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          onBlur={stopTyping}
          className="bg-transparent text-white text-xs rounded-lg flex-grow p-2.5 outline-none placeholder:text-gray-500"
          placeholder="Type a message..."
        />

        <button 
          onClick={() => handleSend()} 
          disabled={!input.trim()} 
          className="p-2.5 bg-blue-600 text-white rounded-xl disabled:opacity-50 disabled:bg-gray-700/50 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RiderChat;