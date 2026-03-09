"use client";
import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Search, User, Clock } from "lucide-react";
import { useChat } from "@/hooks/useChat";

export default function ChatSupportPage({ agentUser }) {
    const [sessions, setSessions] = useState([]); 
    const [searchQuery, setSearchQuery] = useState(""); // Search logic
    const [selectedChat, setSelectedChat] = useState(null);
    const [input, setInput] = useState("");
    const scrollRef = useRef(null);

    const { messages, sendMessage, typing, sendTyping, stopTyping, loading } = 
        useChat(selectedChat ? selectedChat.roomId : null, "support");

    // Active sessions fetch kora
    const fetchSessions = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/chat/active-sessions`);
            const data = await res.json();
            setSessions(data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 15000); // 15 sec refresh
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, typing]);

    // ✅ Search Filter Logic
    const filteredSessions = sessions.filter(s => 
        s._id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSend = () => {
        if (input.trim() && selectedChat) {
            sendMessage(agentUser?._id, "OnWay Support", "support", input);
            setInput("");
            stopTyping();
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <MessageSquare className="text-green-500" size={32} />
                        Support Dashboard
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time assistance for OnWay users</p>
                </div>
                <div className="text-right text-[10px] text-gray-400 font-mono">
                    Agent ID: {agentUser?._id || "N/A"}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex h-[750px]">
                
                {/* --- Left: Chat List --- */}
                <div className="w-80 border-r border-gray-50 flex flex-col bg-gray-50/30">
                    <div className="p-5 bg-white border-b border-gray-100">
                        <div className="relative group">
                            <Search className="absolute left-3 top-3 text-gray-400 group-focus-within:text-green-500 transition-colors" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by ID..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 text-sm transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredSessions.length === 0 ? (
                            <div className="p-10 text-center opacity-40">
                                <Search size={40} className="mx-auto mb-2" />
                                <p className="text-xs">No sessions found</p>
                            </div>
                        ) : (
                            filteredSessions.map((session) => (
                                <div
                                    key={session._id}
                                    onClick={() => setSelectedChat({ roomId: session._id })}
                                    className={`p-4 mx-2 my-1 rounded-2xl cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                                        selectedChat?.roomId === session._id 
                                        ? "bg-green-500 text-white shadow-lg shadow-green-500/30" 
                                        : "hover:bg-white hover:shadow-md text-gray-700"
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                                        selectedChat?.roomId === session._id ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
                                    }`}>
                                        {session._id.slice(-1).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <p className="text-xs font-bold truncate">...{session._id.slice(-8)}</p>
                                            <span className={`text-[9px] ${selectedChat?.roomId === session._id ? "text-green-50" : "text-gray-400"}`}>
                                                {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className={`text-[11px] truncate opacity-80 ${selectedChat?.roomId === session._id ? "text-white" : "text-gray-500"}`}>
                                            {session.lastMessage}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- Right: Chat Window --- */}
                <div className="flex-1 flex flex-col bg-white">
                    {selectedChat ? (
                        <>
                            {/* Window Header */}
                            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">
                                            P
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 tracking-tight">{selectedChat.roomId}</h3>
                                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active Connection</p>
                                    </div>
                                </div>
                            </div>

                            {/* Chat History Area */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 bg-[#fcfdfe] space-y-6 custom-scrollbar">
                                {loading && (
                                    <div className="flex justify-center py-10 opacity-30">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent"></div>
                                    </div>
                                )}
                                
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.senderRole === 'support' ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[70%] group ${m.senderRole === 'support' ? "items-end text-right" : "items-start"}`}>
                                            <div className={`px-4 py-3 rounded-2xl text-[13px] shadow-sm relative ${
                                                m.senderRole === 'support' 
                                                    ? "bg-green-600 text-white rounded-tr-none" 
                                                    : "bg-white text-gray-700 border border-gray-100 rounded-tl-none"
                                            }`}>
                                                <p className="leading-relaxed">{m.message}</p>
                                                <span className={`text-[9px] mt-2 block opacity-50 ${m.senderRole === 'support' ? "text-white" : "text-gray-400"}`}>
                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {typing && (
                                    <div className="flex items-center gap-2 text-[10px] text-green-500 font-bold italic ml-2 bg-green-50 w-fit px-3 py-1 rounded-full animate-pulse">
                                        Passenger is typing...
                                    </div>
                                )}
                            </div>

                            {/* Footer Input Area */}
                            <div className="p-5 bg-white border-t border-gray-50">
                                <div className="flex gap-3 items-center bg-gray-100/50 p-2 rounded-2xl focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
                                    <input
                                        type="text"
                                        value={input}
                                        onKeyDown={(e) => e.key === 'Enter' ? handleSend() : sendTyping()}
                                        onBlur={() => stopTyping()}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type a professional response..."
                                        className="flex-1 bg-transparent px-4 py-2 outline-none text-sm text-gray-700 placeholder:text-gray-400"
                                    />
                                    <button 
                                        onClick={handleSend}
                                        disabled={!input.trim()}
                                        className={`p-3 rounded-xl transition-all duration-300 ${
                                            input.trim() 
                                            ? "bg-green-600 text-white shadow-lg shadow-green-600/40 hover:scale-105" 
                                            : "bg-gray-200 text-gray-400 grayscale"
                                        }`}
                                    >
                                        <Send size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-10 bg-gray-50/20">
                            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 animate-bounce duration-[3s]">
                                <MessageSquare size={48} className="text-gray-100" />
                            </div>
                            <h3 className="text-gray-600 font-black text-xl">Select a Ticket</h3>
                            <p className="text-gray-400 text-sm max-w-[200px] text-center mt-2 font-medium">
                                Choose a passenger conversation to begin providing support.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


// "use client";
// import React, { useState } from "react";
// import { MessageSquare, Send, User, Clock } from "lucide-react";

// export default function ChatSupportPage() {
//   const [chats, setChats] = useState([
//     { id: 1, user: "Alice Cooper", message: "I need help with my payment", time: "Just now", unread: 2 },
//     { id: 2, user: "Bob Martin", message: "Where is my driver?", time: "5 mins ago", unread: 1 },
//     { id: 3, user: "Carol White", message: "Thank you for your help!", time: "10 mins ago", unread: 0 },
//   ]);

//   const [selectedChat, setSelectedChat] = useState(null);
//   const [message, setMessage] = useState("");

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
//           <MessageSquare className="text-green-500" />
//           Chat Support
//         </h1>
//         <p className="text-gray-600 mt-2">Provide real-time support to users</p>
//       </div>

//       <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: "600px" }}>
//         <div className="flex h-full">
//           {/* Chat List */}
//           <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
//             <div className="p-4 bg-gray-50 border-b">
//               <input
//                 type="text"
//                 placeholder="Search conversations..."
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
//               />
//             </div>
//             <div className="divide-y divide-gray-200">
//               {chats.map((chat) => (
//                 <div
//                   key={chat.id}
//                   onClick={() => setSelectedChat(chat)}
//                   className={`p-4 cursor-pointer hover:bg-gray-50 ${
//                     selectedChat?.id === chat.id ? "bg-green-50" : ""
//                   }`}
//                 >
//                   <div className="flex items-start justify-between mb-1">
//                     <div className="flex items-center gap-2">
//                       <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
//                         {chat.user.charAt(0)}
//                       </div>
//                       <div>
//                         <h4 className="font-semibold text-gray-800">{chat.user}</h4>
//                         <p className="text-sm text-gray-600 truncate">{chat.message}</p>
//                       </div>
//                     </div>
//                     {chat.unread > 0 && (
//                       <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                         {chat.unread}
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-xs text-gray-500">{chat.time}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Chat Window */}
//           <div className="flex-1 flex flex-col">
//             {selectedChat ? (
//               <>
//                 <div className="p-4 bg-gray-50 border-b flex items-center gap-3">
//                   <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
//                     {selectedChat.user.charAt(0)}
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-800">{selectedChat.user}</h3>
//                     <p className="text-sm text-green-600">Online</p>
//                   </div>
//                 </div>
//                 <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
//                   <div className="space-y-4">
//                     <div className="flex justify-start">
//                       <div className="bg-white p-3 rounded-lg shadow max-w-xs">
//                         <p className="text-sm text-gray-800">{selectedChat.message}</p>
//                         <p className="text-xs text-gray-500 mt-1">{selectedChat.time}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="p-4 bg-white border-t">
//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       value={message}
//                       onChange={(e) => setMessage(e.target.value)}
//                       placeholder="Type your message..."
//                       className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
//                     />
//                     <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2">
//                       <Send size={18} />
//                       Send
//                     </button>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-1 flex items-center justify-center text-gray-500">
//                 <div className="text-center">
//                   <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
//                   <p>Select a conversation to start chatting</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
