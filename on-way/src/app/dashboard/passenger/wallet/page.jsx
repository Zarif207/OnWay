"use client";

import { useState, useEffect } from "react";
import {
  Wallet, Plus, CreditCard, Landmark, ArrowUpRight,
  ArrowDownLeft, Ticket, Clock, CheckCircle2,
  XCircle, AlertCircle, FileText, Download,
  MoreVertical, ChevronRight, RefreshCcw, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const StatusBadge = ({ status }) => {
  let colors = "bg-gray-100 text-gray-600";
  let Icon = Clock;

  if (status === "success" || status === "Completed") {
    colors = "bg-[#2FCA71]/10 text-[#2FCA71]";
    Icon = CheckCircle2;
  } else if (status === "initiated" || status === "pending") {
    colors = "bg-amber-100 text-amber-700";
    Icon = RefreshCcw;
  } else if (status === "failed" || status === "cancelled") {
    colors = "bg-red-100 text-red-600";
    Icon = XCircle;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${colors}`}>
      <Icon size={10} />
      {status}
    </span>
  );
};

export default function WalletPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchWalletData();
    }
  }, [session]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [userRes, transRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/passenger/${session.user.id}`),
        axios.get(`${API_BASE_URL}/payment/user/${session.user.id}`)
      ]);

      if (userRes.data.success) setUser(userRes.data.data);
      if (transRes.data.success) setTransactions(transRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = () => {
    toast.success("Redirecting to payment gateway...");
    // Mock initiation
    window.location.href = `${API_BASE_URL}/payment/initiate-demo?userId=${session.user.id}&amount=500`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Accessing Secure Wallet...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-secondary tracking-tighter">My Wallet</h1>
          <p className="text-gray-400 font-medium">Manage your funds and viewing billing history</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 text-secondary rounded-[1.5rem] hover:bg-gray-50 transition shadow-sm font-black text-xs uppercase tracking-widest">
          <Download size={18} />
          Statement
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BALANCE CARD */}
        <div className="lg:col-span-4 bg-secondary p-8 rounded-[3rem] text-white shadow-2xl shadow-secondary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-110" />

          <div className="relative z-10 space-y-12">
            <div className="flex items-center justify-between">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <Wallet size={32} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
                <p className="text-xs font-black uppercase tracking-widest text-[#2FCA71]">Verified</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-2">Available Balance</p>
              <h2 className="text-6xl font-black tracking-tighter">
                ৳{(user?.walletBalance || 0).toLocaleString()}
              </h2>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddMoney}
                className="flex-1 bg-primary text-white py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#25A65B] transition-all shadow-xl shadow-primary/20 active:scale-95"
              >
                <Plus size={18} /> Add Money
              </button>
              <button className="flex-1 bg-white/10 backdrop-blur-md text-white py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all border border-white/10">
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* PAYMENT METHODS */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-secondary tracking-tighter flex items-center gap-3">
              <CreditCard size={24} className="text-primary" /> Saved Methods
            </h2>
            <button
              onClick={() => setIsAddingPayment(!isAddingPayment)}
              className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-secondary hover:bg-secondary hover:text-white transition-all"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div className="p-6 rounded-[2rem] border-4 border-primary bg-primary/5 relative group cursor-pointer overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                  <CreditCard size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-primary text-white px-3 py-1.5 rounded-full shadow-lg shadow-primary/20">Default</span>
              </div>
              <p className="text-lg font-black text-secondary tracking-tight mb-1">Stripe Card</p>
              <p className="text-xs font-bold text-gray-400">•••• •••• •••• 4242</p>
              <div className="mt-4 flex justify-between items-end">
                <p className="text-[10px] font-black uppercase text-gray-400">Exp 12/26</p>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-4 object-contain opacity-20" alt="visa" />
              </div>
            </div>

            <div className="p-6 rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-primary hover:text-primary transition-all group cursor-pointer">
              <Plus size={32} className="group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-black uppercase tracking-widest">Add New Card</p>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-xl">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-black text-secondary tracking-tighter flex items-center gap-4">
            <FileText size={32} className="text-primary" /> Transactions
          </h2>
          <button className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-secondary flex items-center gap-1 transition-colors">
            Full History <ChevronRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="pb-6 px-4">Transaction</th>
                <th className="pb-6 px-4">Date & Time</th>
                <th className="pb-6 px-4">Method</th>
                <th className="pb-6 px-4">Status</th>
                <th className="pb-6 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.length > 0 ? transactions.map((txn, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${txn.status === 'success' ? 'bg-[#2FCA71]/10 text-[#2FCA71]' : 'bg-gray-100 text-gray-400'}`}>
                        {txn.total_amount > 0 ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="font-black text-secondary text-sm uppercase tracking-tight">{txn.product_name || 'Wallet Top-up'}</p>
                        <p className="text-[9px] font-mono text-gray-300 transition-colors group-hover:text-gray-500 uppercase">{txn.transactionId || txn.tran_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <p className="text-xs font-bold text-gray-500">{new Date(txn.createdAt).toLocaleDateString()}</p>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{new Date(txn.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="py-6 px-4">
                    <p className="text-xs font-black text-secondary uppercase tracking-widest">{txn.paymentMethod || 'SSLCommerz'}</p>
                  </td>
                  <td className="py-6 px-4"><StatusBadge status={txn.status} /></td>
                  <td className="py-6 px-4 text-right">
                    <span className={`text-xl font-black tracking-tight ${txn.status === 'success' ? 'text-primary' : 'text-secondary'}`}>
                      ৳{(txn.total_amount || txn.amount).toLocaleString()}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 opacity-20">
                      <FileText size={48} />
                      <p className="text-xs font-black uppercase tracking-widest">No recent transactions</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}