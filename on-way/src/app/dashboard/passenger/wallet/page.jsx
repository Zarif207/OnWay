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

const ADD_AMOUNTS = [100, 200, 500, 1000];

export default function WalletPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [addingMoney, setAddingMoney] = useState(false);

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

      if (userRes.data.success) {
        const serverUser = userRes.data.data;
        // Merge with localStorage mock balance
        const savedBalance = localStorage.getItem(`wallet_balance_${session.user.id}`);
        if (savedBalance) serverUser.walletBalance = parseInt(savedBalance);
        setUser(serverUser);
      }
      if (transRes.data.success) {
        const serverTxns = transRes.data.data;
        // Merge with localStorage mock transactions
        const savedTxns = JSON.parse(localStorage.getItem(`wallet_txns_${session.user.id}`) || "[]");
        setTransactions([...savedTxns, ...serverTxns]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;
    if (!amount || amount < 10) {
      toast.error("Minimum amount is ৳10");
      return;
    }
    setAddingMoney(true);
    await new Promise(r => setTimeout(r, 1000));

    const mockTxn = {
      transactionId: `TXN-${Date.now()}`,
      product_name: "Wallet Top-up",
      status: "success",
      total_amount: amount,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage so it persists on refresh
    const newBalance = (user?.walletBalance || 0) + amount;
    localStorage.setItem(`wallet_balance_${session.user.id}`, newBalance.toString());
    const savedTxns = JSON.parse(localStorage.getItem(`wallet_txns_${session.user.id}`) || "[]");
    localStorage.setItem(`wallet_txns_${session.user.id}`, JSON.stringify([mockTxn, ...savedTxns]));

    setUser(prev => ({ ...prev, walletBalance: newBalance }));
    setTransactions(prev => [mockTxn, ...prev]);
    setAddingMoney(false);
    setShowAddModal(false);
    setCustomAmount("");
    setSelectedAmount(500);
    toast.success(`৳${amount} added to your wallet!`);
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
        <button
          onClick={() => {
            const last5 = transactions.slice(0, 5);
            if (!last5.length) { toast.error("No transactions to download"); return; }

            const rows = [
              ["Transaction ID", "Description", "Date", "Status", "Amount (BDT)"],
              ...last5.map(t => [
                t.transactionId || t.tran_id || "-",
                t.product_name || "Wallet Top-up",
                new Date(t.createdAt).toLocaleString(),
                t.status,
                (t.total_amount || t.amount || 0).toString()
              ])
            ];

            const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `onway-statement-${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Statement downloaded!");
          }}
          className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 text-secondary rounded-[1.5rem] hover:bg-gray-50 transition shadow-sm font-black text-xs uppercase tracking-widest"
        >
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
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter break-all">
                ৳{(user?.walletBalance || 0).toLocaleString()}
              </h2>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex-1 bg-primary text-white py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#25A65B] transition-all shadow-xl shadow-primary/20 active:scale-95"
              >
                <Plus size={18} /> Add Money
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
                  <td className="py-6 px-4"><StatusBadge status={txn.status} /></td>
                  <td className="py-6 px-4 text-right">
                    <span className={`text-xl font-black tracking-tight ${txn.status === 'success' ? 'text-primary' : 'text-secondary'}`}>
                      ৳{(txn.total_amount || txn.amount).toLocaleString()}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
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

      {/* ADD MONEY MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-black text-secondary tracking-tighter mb-2">Add Money</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Select or enter amount</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {ADD_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                    className={`py-4 rounded-2xl font-black text-sm transition-all ${selectedAmount === amt && !customAmount ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 text-secondary hover:bg-gray-100'}`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              <input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl text-secondary font-black text-sm focus:outline-none focus:border-primary mb-6"
              />

              <button
                onClick={handleAddMoney}
                disabled={addingMoney}
                className="w-full py-5 bg-primary text-white font-black rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#25A65B] transition-all disabled:opacity-50"
              >
                {addingMoney ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {addingMoney ? "Processing..." : `Add ৳${customAmount || selectedAmount || 0}`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}