"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    Wallet,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowUpRight,
    Download,
    CreditCard,
    Smartphone,
    ChevronRight,
    Loader2,
    HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function WithdrawPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const riderId = session?.user?.id;

    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("bkash");
    const [accountDetails, setAccountDetails] = useState("");
    const [notes, setNotes] = useState("");
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // 1. Fetch Balance Data
    const { data: balanceData, isLoading: isBalanceLoading } = useQuery({
        queryKey: ["riderBalance", riderId],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE_URL}/riders/balance?driverId=${riderId}`);
            return res.data.data;
        },
        enabled: !!riderId,
    });

    // 2. Fetch Withdrawal History
    const { data: historyData, isLoading: isHistoryLoading } = useQuery({
        queryKey: ["withdrawalHistory", riderId],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE_URL}/riders/withdrawals?driverId=${riderId}`);
            return res.data.data;
        },
        enabled: !!riderId,
    });

    // 3. Submit Withdrawal Mutation
    const withdrawMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await axios.post(`${API_BASE_URL}/riders/withdraw`, payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["riderBalance", riderId]);
            queryClient.invalidateQueries(["withdrawalHistory", riderId]);
            toast.success("Request submitted successfully!");
            setAmount("");
            setAccountDetails("");
            setNotes("");
            setIsConfirmOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to submit request");
            setIsConfirmOpen(false);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return toast.error("Please enter a valid amount");
        if (!accountDetails) return toast.error("Please enter account details");
        if (parseFloat(amount) > balanceData?.availableBalance) return toast.error("Insufficient balance");
        setIsConfirmOpen(true);
    };

    const confirmWithdrawal = () => {
        withdrawMutation.mutate({
            driverId: riderId,
            amount: parseFloat(amount),
            method,
            accountDetails,
            notes,
        });
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20 pt-4 px-2">
            {/* Header */}
            <header className="space-y-3 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-2 w-12 bg-primary rounded-full" />
                    <span className="text-xs font-black text-primary uppercase tracking-[0.4em]">Payout Center</span>
                </div>
                <h1 className="text-5xl font-black tracking-tight text-[#011421]">
                    Manage <span className="text-primary">Earnings</span>
                </h1>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                    Withdraw funds to your preferred account
                </p>
            </header>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Available Balance", value: balanceData?.availableBalance || 0, icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Pending Withdrawals", value: balanceData?.pendingWithdrawals || 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
                    { label: "Total Withdrawn", value: balanceData?.totalWithdrawn || 0, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-100" },
                ].map((card, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-all">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{card.label}</span>
                            <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${card.bg}`}>
                                <card.icon size={20} className={card.color} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-black text-gray-400">৳</span>
                            <span className="text-4xl font-black text-[#011421] tracking-tighter">
                                {card.value.toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                {/* Withdraw Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-10">
                        <h3 className="text-2xl font-black text-[#011421] tracking-tight flex items-center gap-3">
                            <ArrowUpRight className="text-primary" /> New Request
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Withdrawal Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400">৳</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            className="w-full h-16 pl-12 pr-6 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-black text-[#011421] focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Payment Method</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: "bkash", label: "bKash", icon: Smartphone },
                                            { id: "stripe", label: "Stripe", icon: CreditCard },
                                        ].map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setMethod(p.id)}
                                                className={`h-16 rounded-2xl border flex items-center justify-center gap-3 transition-all ${method === p.id
                                                    ? "bg-primary border-primary text-white shadow-xl shadow-primary/20"
                                                    : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-300"
                                                    }`}
                                            >
                                                <p.icon size={18} />
                                                <span className="text-xs font-black uppercase tracking-widest">{p.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                        {method === "bkash" ? "bKash Number" : "Stripe Account/Email"}
                                    </label>
                                    <input
                                        type="text"
                                        value={accountDetails}
                                        onChange={(e) => setAccountDetails(e.target.value)}
                                        placeholder={method === "bkash" ? "e.g. 017XXXXXXXX" : "Enter account or email"}
                                        className="w-full h-16 px-6 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#011421] focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Notes (Optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add special instructions..."
                                        className="w-full h-32 p-6 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#011421] focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full h-16 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                Submit Withdraw Request
                            </button>
                        </form>
                    </div>
                </div>

                {/* Withdraw History */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-[#011421] tracking-tight">Recent Status</h3>
                        <button className="text-[10px] font-black text-primary hover:text-primary-dark uppercase tracking-widest">View All Files</button>
                    </div>

                    <div className="space-y-6">
                        {isHistoryLoading ? (
                            <div className="h-60 flex items-center justify-center">
                                <Loader2 className="animate-spin text-blue-600" size={40} />
                            </div>
                        ) : historyData?.withdrawals?.length > 0 ? (
                            <div className="space-y-4">
                                {historyData.withdrawals.map((item, idx) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-all shadow-sm group"
                                    >
                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            <div className="h-14 w-14 rounded-2xl bg-[#f5f7fa] flex items-center justify-center border border-gray-100 text-primary font-black">
                                                {item.method === "bkash" ? "BK" : "ST"}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{item.requestId}</p>
                                                <h4 className="text-lg font-black text-[#011421]">৳{item.amount.toLocaleString()}</h4>
                                                <p className="text-[10px] font-bold text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[item.status]}`}>
                                                {item.status}
                                            </span>
                                            <button className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100">
                                                <Download size={18} className="text-gray-400" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[400px] flex flex-col items-center justify-center space-y-6 bg-gray-50 rounded-[3rem] border border-gray-200 border-dashed">
                                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <AlertCircle size={32} className="text-gray-400" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Archive Empty: No Withdrawals</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {isConfirmOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="max-w-md w-full bg-white rounded-[2.5rem] p-10 space-y-8 shadow-2xl text-center"
                        >
                            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                <HelpCircle size={48} className="text-primary" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-black text-[#011421] tracking-tighter">Confirm Withdrawal?</h2>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
                                    You are about to request a payout of <span className="text-[#011421]">৳{amount}</span> to your <span className="text-[#011421] uppercase">{method}</span> account.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={() => setIsConfirmOpen(false)}
                                    className="h-16 rounded-2xl border border-gray-200 text-gray-500 font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all"
                                >
                                    Override
                                </button>
                                <button
                                    onClick={confirmWithdrawal}
                                    disabled={withdrawMutation.isPending}
                                    className="h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {withdrawMutation.isPending ? <Loader2 className="animate-spin" /> : "Authorize"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="pt-20 flex flex-col items-center gap-4 opacity-30 grayscale cursor-default transition-all hover:opacity-60">
                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-gray-500 to-transparent rounded-full" />
                <p className="text-[9px] font-black uppercase tracking-[0.8em] text-gray-500">Secure Protocol Level 7 Encrypted Payout</p>
            </footer>
        </div>
    );
}
