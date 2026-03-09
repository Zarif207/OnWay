"use client";
import React, { useState } from "react";
import { MessageSquare, Send, User, Clock } from "lucide-react";

export default function ChatSupportPage() {
  const [chats, setChats] = useState([
    { id: 1, user: "Alice Cooper", message: "I need help with my payment", time: "Just now", unread: 2 },
    { id: 2, user: "Bob Martin", message: "Where is my driver?", time: "5 mins ago", unread: 1 },
    { id: 3, user: "Carol White", message: "Thank you for your help!", time: "10 mins ago", unread: 0 },
  ]);

  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="text-green-500" />
          Chat Support
        </h1>
        <p className="text-gray-600 mt-2">Provide real-time support to users</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: "600px" }}>
        <div className="flex h-full">
          {/* Chat List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 bg-gray-50 border-b">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="divide-y divide-gray-200">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedChat?.id === chat.id ? "bg-green-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {chat.user.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{chat.user}</h4>
                        <p className="text-sm text-gray-600 truncate">{chat.message}</p>
                      </div>
                    </div>
                    {chat.unread > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{chat.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 bg-gray-50 border-b flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedChat.user.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{selectedChat.user}</h3>
                    <p className="text-sm text-green-600">Online</p>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="bg-white p-3 rounded-lg shadow max-w-xs">
                        <p className="text-sm text-gray-800">{selectedChat.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{selectedChat.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2">
                      <Send size={18} />
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
