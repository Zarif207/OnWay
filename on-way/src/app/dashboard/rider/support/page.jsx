"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    HelpCircle,
    MessageSquarePlus,
    History,
    FileQuestion,
    Paperclip,
    Send,
    ChevronDown,
    X,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2
} from "lucide-react";
import toast from "react-hot-toast";

// --- Mock Data ---

const INITIAL_TICKETS = [
    {
        id: "TKT-9281A",
        subject: "Cannot update banking details",
        category: "Payment Issue",
        status: "In Progress",
        createdAt: "2024-03-05T14:30:00Z",
        messages: [
            { id: 1, sender: "user", text: "Hi, my app freezes every time I try to save my new routing number. Can you please help with this?", timestamp: "Mar 5, 2:30 PM" },
            { id: 2, sender: "admin", text: "Hello! Our engineering team is currently investigating a known issue with the direct deposit form. We will update you here as soon as it's resolved.", timestamp: "Mar 5, 3:15 PM" }
        ]
    },
    {
        id: "TKT-8842B",
        subject: "Passenger didn't show up but I got no fee",
        category: "Ride Issue",
        status: "Resolved",
        createdAt: "2024-03-01T09:15:00Z",
        messages: [
            { id: 1, sender: "user", text: "I waited 10 minutes at the pickup spot for ride #1192 and they cancelled, but my earning dashboard shows $0.00 for the cancellation fee.", timestamp: "Mar 1, 9:15 AM" },
            { id: 2, sender: "admin", text: "We have reviewed the GPS logs and confirmed you were at the correct pickup location. A $4.50 cancellation fee has been manually credited to your wallet.", timestamp: "Mar 1, 10:45 AM" },
            { id: 3, sender: "user", text: "Thank you, I see it now.", timestamp: "Mar 1, 11:00 AM" }
        ]
    },
    {
        id: "TKT-7731C",
        subject: "How do I update my vehicle registration?",
        category: "Account Problem",
        status: "Closed",
        createdAt: "2024-02-28T16:20:00Z",
        messages: [
            { id: 1, sender: "user", text: "I bought a new car and need to update my plates in the system.", timestamp: "Feb 28, 4:20 PM" },
            { id: 2, sender: "admin", text: "You can update your Vehicle Registration by navigating to Settings > Profile > Vehicle Details. Make sure to upload a clear picture of your new registration document.", timestamp: "Feb 28, 5:10 PM" }
        ]
    }
];

const FAQ_ITEMS = [
    {
        question: "When are earnings deposited into my bank account?",
        answer: "Standard payouts are processed every Tuesday morning for the previous week (Monday-Sunday). If you qualify for Instant Pay, you can withdraw your available balance immediately up to 3 times per day for a small $0.50 processing fee."
    },
    {
        question: "What should I do if a passenger damages my vehicle?",
        answer: "Immediately document the damage with clear photos before taking another ride. Submit a new 'Ride Issue' support ticket with the ride ID and attach your photos. Our damage assessment team will review the claim and apply an appropriate cleaning or repair fee to the passenger's account."
    },
    {
        question: "How is my driver rating calculated?",
        answer: "Your driver rating is an average of the last 500 rated trips. Cancelled rides or rides that were unrated by the passenger do not affect your overall score."
    },
    {
        question: "What happens if I reject too many ride requests?",
        answer: "Your Acceptance Rate is visible on your Dashboard Overview. While you run your own schedule, an acceptance rate consistently below 60% may temporarily pause your account from receiving high-tier or premium ride requests."
    }
];

export default function SupportPage() {
    // State
    const [tickets, setTickets] = useState(INITIAL_TICKETS);
    const [activeTab, setActiveTab] = useState("create"); // 'create', 'history', 'faq'
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [expandedFaq, setExpandedFaq] = useState(null);

    // Form State
    const [ticketForm, setTicketForm] = useState({ subject: "", category: "", description: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyText, setReplyText] = useState("");

    // Helpers
    const getStatusStyle = (status) => {
        switch (status) {
            case "Open": return "bg-blue-50 text-blue-600 border-blue-200";
            case "In Progress": return "bg-yellow-50 text-yellow-600 border-yellow-200";
            case "Resolved": return "bg-primary/10 text-primary border-primary/20";
            case "Closed": return "bg-gray-100 text-gray-500 border-gray-200";
            default: return "bg-gray-50 text-gray-600 border-gray-200";
        }
    };

    // Actions
    const handleTicketSubmit = (e) => {
        e.preventDefault();

        if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) {
            toast.error("Please fill out all required fields.");
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            const newTicket = {
                id: `TKT-${Math.floor(Math.random() * 90000) + 10000}`,
                subject: ticketForm.subject,
                category: ticketForm.category,
                status: "Open",
                createdAt: new Date().toISOString(),
                messages: [
                    {
                        id: 1,
                        sender: "user",
                        text: ticketForm.description,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]
            };

            setTickets(prev => [newTicket, ...prev]);
            setTicketForm({ subject: "", category: "", description: "" });
            setIsSubmitting(false);
            toast.success("Support ticket submitted successfully!");
            setActiveTab("history");
        }, 1500);
    };

    const handleReplySubmit = () => {
        if (!replyText.trim() || !selectedTicket) return;

        const newMessage = {
            id: Date.now(),
            sender: "user",
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedTicket = {
            ...selectedTicket,
            messages: [...selectedTicket.messages, newMessage]
        };

        setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
        setSelectedTicket(updatedTicket);
        setReplyText("");
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 pb-24 pt-4 px-2 xl:px-0">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="space-y-3 relative z-10 w-full md:w-auto text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <div className="h-2 w-12 bg-primary rounded-full" />
                        <span className="text-xs font-black text-primary uppercase tracking-[0.4em]">Help Desk</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-secondary">
                        Support <span className="text-primary">Center</span>
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                        We are here to help you hit the road
                    </p>
                </div>

                {/* Dashboard Tab Toggles */}
                <div className="flex bg-gray-50 p-1.5 rounded-2xl w-full md:w-auto relative z-10 mx-auto md:mx-0">
                    {[
                        { id: 'create', icon: MessageSquarePlus, label: 'Create' },
                        { id: 'history', icon: History, label: 'History' },
                        { id: 'faq', icon: FileQuestion, label: 'FAQ' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                                ${activeTab === tab.id
                                    ? "bg-white text-secondary shadow-sm"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"}
                            `}
                        >
                            <tab.icon size={16} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            {/* Dynamic Content Area */}
            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">

                    {/* SECTION: CREATE TICKET */}
                    {activeTab === "create" && (
                        <motion.section
                            key="create"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-8 mt-2">
                                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                                    <MessageSquarePlus size={20} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-secondary tracking-tight">Submit a Request</h2>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Our team typically responds in under 24 hours</p>
                                </div>
                            </div>

                            <form onSubmit={handleTicketSubmit} className="max-w-3xl space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Subject</label>
                                        <input
                                            type="text"
                                            value={ticketForm.subject}
                                            onChange={(e) => setTicketForm(p => ({ ...p, subject: e.target.value }))}
                                            className="w-full h-14 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400"
                                            placeholder="What is this regarding?"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Category</label>
                                        <div className="relative">
                                            <select
                                                value={ticketForm.category}
                                                onChange={(e) => setTicketForm(p => ({ ...p, category: e.target.value }))}
                                                className="w-full h-14 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Select a category...</option>
                                                <option value="Technical Issue">Technical / App Issue</option>
                                                <option value="Payment Issue">Wallet or Payouts</option>
                                                <option value="Ride Issue">Specific Ride / Passenger</option>
                                                <option value="Account Problem">Verification / Documents</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Detailed Description</label>
                                    <textarea
                                        value={ticketForm.description}
                                        onChange={(e) => setTicketForm(p => ({ ...p, description: e.target.value }))}
                                        rows={6}
                                        className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 resize-none leading-relaxed"
                                        placeholder="Please provide as much detail as possible, including Ride IDs or error messages if applicable."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Attachments (Optional)</label>
                                    <button
                                        type="button"
                                        className="w-full relative overflow-hidden group border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all outline-none"
                                    >
                                        <Paperclip className="text-gray-400 group-hover:text-primary transition-colors" size={24} />
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-primary transition-colors">Drag files or click to upload</span>
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center gap-3 bg-secondary hover:bg-secondary/90 text-white active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 size={18} className="animate-spin" /> Submitting</>
                                        ) : (
                                            <><Send size={18} /> Send Ticket</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.section>
                    )}

                    {/* SECTION: TICKET HISTORY */}
                    {activeTab === "history" && (
                        <motion.section
                            key="history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8 mt-2">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                                        <History size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-secondary tracking-tight">Your Tickets</h2>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Review active and resolved cases</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {tickets.length > 0 ? (
                                    tickets.map((ticket, i) => {
                                        const cStatus = getStatusStyle(ticket.status);
                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                key={ticket.id}
                                                onClick={() => setSelectedTicket(ticket)}
                                                className="group border border-gray-100 rounded-3xl p-5 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer bg-white"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-black text-gray-400">{ticket.id}</span>
                                                            <span className="h-1 w-1 bg-gray-300 rounded-full" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{ticket.category}</span>
                                                        </div>
                                                        <h3 className="text-lg font-black tracking-tight text-secondary group-hover:text-primary transition-colors">
                                                            {ticket.subject}
                                                        </h3>
                                                    </div>

                                                    <div className="flex items-center justify-between md:justify-end gap-6 md:min-w-[200px]">
                                                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-widest">
                                                            <Clock size={12} />
                                                            {new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </span>
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${cStatus}`}>
                                                            {ticket.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                            <CheckCircle2 size={32} className="text-gray-300" />
                                        </div>
                                        <h3 className="text-xl font-black text-secondary tracking-tight">No Tickets Found</h3>
                                        <p className="text-gray-400 font-medium text-sm">You haven't submitted any support requests yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    )}

                    {/* SECTION: FAQ ACCORDION */}
                    {activeTab === "faq" && (
                        <motion.section
                            key="faq"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-8 mt-2">
                                <div className="h-12 w-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                                    <FileQuestion size={20} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-secondary tracking-tight">Frequently Asked Questions</h2>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Quick answers to common issues</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {FAQ_ITEMS.map((item, index) => {
                                    const isExpanded = expandedFaq === index;
                                    return (
                                        <div key={index} className="border border-gray-100 rounded-3xl overflow-hidden transition-all duration-300">
                                            <button
                                                onClick={() => setExpandedFaq(isExpanded ? null : index)}
                                                className={`w-full flex items-center justify-between p-6 text-left transition-colors ${isExpanded ? "bg-gray-50" : "bg-white hover:bg-gray-50/50"}`}
                                            >
                                                <span className="text-base font-black text-secondary pr-4 leading-snug">{item.question}</span>
                                                <motion.div
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="shrink-0 h-8 w-8 bg-white border border-gray-200 rounded-full flex items-center justify-center"
                                                >
                                                    <ChevronDown size={16} className="text-gray-400" />
                                                </motion.div>
                                            </button>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                                    >
                                                        <div className="p-6 pt-0 bg-gray-50 text-gray-600 font-medium text-sm leading-relaxed border-t border-gray-100">
                                                            {item.answer}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.section>
                    )}

                </AnimatePresence>
            </div>

            {/* ====== TICKET DETAIL MODAL (PORTAL) ====== */}
            {typeof window !== "undefined" && createPortal(
                <AnimatePresence>
                    {selectedTicket && (
                        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 md:p-6">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedTicket(null)}
                                className="absolute inset-0 bg-[#011421]/60 backdrop-blur-sm"
                            />

                            {/* Modal Document */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="relative bg-white rounded-[2.5rem] md:rounded-[3rem] w-full max-w-2xl h-[90vh] md:h-[80vh] flex flex-col shadow-2xl overflow-hidden"
                            >
                                {/* Modal Header (Sticky) */}
                                <div className="shrink-0 border-b border-gray-100 p-6 md:p-8 bg-white z-10 flex items-start justify-between gap-4">
                                    <div className="space-y-2 max-w-full">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{selectedTicket.id}</span>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(selectedTicket.status)}`}>
                                                {selectedTicket.status}
                                            </span>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-black text-secondary tracking-tight pr-8">
                                            {selectedTicket.subject}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTicket(null)}
                                        className="shrink-0 h-10 w-10 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-secondary rounded-full flex items-center justify-center transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Modal Chat Body (Scrollable) */}
                                <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 bg-gray-50/50">
                                    {selectedTicket.messages.map((msg, idx) => {
                                        const isUser = msg.sender === "user";
                                        return (
                                            <div key={idx} className={`flex flex-col max-w-[85%] ${isUser ? "ml-auto items-end" : "mr-auto items-start"}`}>
                                                <div className={`p-4 md:p-5 text-sm leading-relaxed font-medium
                                                    ${isUser
                                                        ? "bg-primary text-white rounded-t-3xl rounded-bl-3xl"
                                                        : "bg-white text-gray-700 border border-gray-100 shadow-sm rounded-t-3xl rounded-br-3xl"}
                                                `}>
                                                    {msg.text}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-2 px-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{msg.timestamp}</span>
                                                    {!isUser && <span className="h-4 px-2 bg-gray-200 rounded-full text-[9px] font-black text-gray-500 uppercase flex items-center justify-center ml-1">Support</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Modal Chat Input (Sticky Footer) */}
                                {selectedTicket.status !== "Closed" ? (
                                    <div className="shrink-0 bg-white border-t border-gray-100 p-4 md:p-6">
                                        <div className="flex items-end gap-3 bg-gray-50 p-2 pl-4 rounded-3xl border border-gray-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Type your reply..."
                                                rows={1}
                                                className="w-full bg-transparent border-none outline-none py-3 text-sm font-medium text-secondary resize-none placeholder:text-gray-400"
                                            />
                                            <button
                                                onClick={handleReplySubmit}
                                                disabled={!replyText.trim()}
                                                className="shrink-0 h-12 w-12 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
                                            >
                                                <Send size={18} className="translate-x-[1px]" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="shrink-0 bg-white border-t border-gray-100 p-6 flex flex-col items-center justify-center text-center gap-2">
                                        <AlertCircle size={20} className="text-gray-400" />
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">This ticket has been closed.</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

        </div>
    );
}
