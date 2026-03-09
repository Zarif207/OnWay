"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";

const RiderChat = ({ rideId, user }) => {
  const {
    messages,
    sendMessage,
    typing,
    sendTyping,
    stopTyping,
    loading
  } = useChat(rideId, "ride");

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  /* Auto Scroll */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  /* Typing Control */
  const handleTyping = (e) => {
    setInput(e.target.value);

    if (!isTyping) {
      sendTyping();
      setIsTyping(true);
    }
  };

  const handleBlur = () => {
    stopTyping();
    setIsTyping(false);
  };

  /* Send Message */
  const handleSend = () => {
    if (!input.trim()) return;

    sendMessage(
      user._id,
      user.name,
      user.role || "passenger",
      input
    );

    setInput("");
    stopTyping();
    setIsTyping(false);
  };

  /* Enter Key Support */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col transition-all duration-300">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <h3 className="text-white font-bold text-sm tracking-tight">
          Rider Chat
        </h3>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">
            Live
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="h-72 overflow-y-auto mb-4 space-y-3 pr-1 scroll-smooth custom-scrollbar flex flex-col"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] text-white italic">
              Loading messages...
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                m.senderId === user._id
                  ? "items-end"
                  : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-[13px] shadow-sm ${
                  m.senderId === user._id
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white/10 text-gray-200 rounded-tl-none border border-white/5"
                }`}
              >
                <p className="text-[9px] opacity-50 mb-1 uppercase tracking-tight font-bold">
                  {m.senderId === user._id ? "You" : m.senderName}
                </p>

                <p className="leading-relaxed">{m.message}</p>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typing && (
          <div className="flex items-center gap-2 text-[10px] text-blue-400 ml-1">
            <div className="flex gap-0.5">
              <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>

            <span className="italic">Rider is typing...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 items-center bg-white/5 p-1 rounded-xl border border-white/10 focus-within:border-blue-500/50 transition-all">
        <input
          value={input}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onChange={handleTyping}
          className="bg-transparent text-white text-xs rounded-lg flex-grow p-2.5 outline-none placeholder:text-gray-500"
          placeholder="Message your rider..."
        />

        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className={`p-2.5 rounded-lg transition-all duration-300 ${
            input.trim()
              ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
              : "bg-gray-700/50 text-gray-500 opacity-50"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RiderChat;