"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trash2,
    Search,
    Mail,
    Calendar,
    Download,
    RefreshCcw,
    UserCheck
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

export default function AdminNewsletter() {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribers`);
            const data = await response.json();
            if (data) {
                setSubscribers(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            toast.error("Failed to load subscribers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#22c55e",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete it!",
            background: "#fff",
            color: "#000"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/delete/${id}`, {
                        method: "DELETE",
                    });
                    const data = await response.json();

                    if (data.success) {
                        setSubscribers(subscribers.filter(sub => sub._id !== id));
                        Swal.fire("Deleted!", "Subscriber has been removed.", "success");
                    } else {
                        toast.error(data.message || "Delete failed");
                    }
                } catch (error) {
                    toast.error("Error connecting to server");
                }
            }
        });
    };

    const filteredSubscribers = subscribers.filter(sub =>
        sub.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen text-slate-800 p-4">
            <div className="relative z-10 max-w-6xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-[#0A1F3D] flex items-center gap-3">
                            <Mail className="text-[#22c55e]" size={32} />
                            Newsletter Subscribers
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium italic">Manage your {subscribers.length} active readers</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchSubscribers}
                            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <RefreshCcw size={20} className={`${loading ? "animate-spin" : ""} text-slate-600`} />
                        </button>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white border border-slate-200 text-slate-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all w-64 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border border-slate-200 rounded-4xl overflow-hidden shadow shadow-slate-200/50"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-8 py-5 text-xs uppercase tracking-widest text-slate-500 font-black">Email Address</th>
                                    <th className="px-8 py-5 text-xs uppercase tracking-widest text-slate-500 font-black">Joined Date</th>
                                    <th className="px-8 py-5 text-xs uppercase tracking-widest text-slate-500 font-black text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-20 text-center text-slate-400 font-bold">
                                                <RefreshCcw className="animate-spin inline mr-2" /> Loading database...
                                            </td>
                                        </tr>
                                    ) : filteredSubscribers.length > 0 ? (
                                        filteredSubscribers.map((sub, index) => (
                                            <motion.tr
                                                key={sub._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="border-b border-slate-50 hover:bg-slate-50/80 transition-all group"
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[#22c55e] font-bold text-sm shadow-inner">
                                                            {sub.email ? sub.email[0].toUpperCase() : "?"}
                                                        </div>
                                                        <span className="font-bold text-slate-700">{sub.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                                        <Calendar size={14} />
                                                        {sub.subscribedAt || sub.createdAt ? new Date(sub.subscribedAt || sub.createdAt).toLocaleDateString('en-GB', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        }) : "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button
                                                        onClick={() => handleDelete(sub._id)}
                                                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-20 text-center text-slate-400 font-bold">
                                                No active subscribers found.
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}