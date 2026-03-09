"use client";

import { useState } from "react";
import {
  Wallet, Plus, CreditCard, Landmark, ArrowUpRight,
  ArrowDownLeft, Ticket, Clock, CheckCircle2,
  XCircle, AlertCircle, FileText, Download,
  MoreVertical, ChevronRight, RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- MOCK DATA ---

const MOCK_BALANCE = {
  wallet: 1250,
  credits: 350,
  promos: 150
};

const MOCK_PAYMENT_METHODS = [
  { id: 1, type: "Stripe", last4: "4242", expiry: "12/26", isDefault: true, icon: CreditCard },
  { id: 2, type: "SSLCommerz", account: "Standard Bank", isDefault: false, icon: Landmark },
];

const MOCK_PROMOS = [
  { id: 1, code: "ONWAY50", discount: 50, date: "Mar 5, 2026", ref: "Ride #1042" },
  { id: 2, code: "WELCOME20", discount: 20, date: "Feb 12, 2026", ref: "Ride #1001" },
  { id: 3, code: "FESTIVAL30", discount: 30, date: "Jan 01, 2026", ref: "Ride #0950" },
];

const MOCK_TRANSACTIONS = [
  { id: "TXN-9021", date: "Mar 07, 2026 10:45 AM", type: "Ride Payment", amount: -150, method: "Stripe ••••4242", status: "Completed" },
  { id: "TXN-9020", date: "Mar 05, 2026 02:30 PM", type: "Promo Credit", amount: 50, method: "System", status: "Completed" },
  { id: "TXN-9019", date: "Mar 01, 2026 09:00 AM", type: "Wallet Top-up", amount: 500, method: "SSLCommerz", status: "Completed" },
  { id: "TXN-9018", date: "Feb 28, 2026 11:20 PM", type: "Refund", amount: 120, method: "Wallet", status: "Pending" },
  { id: "TXN-9017", date: "Feb 20, 2026 08:15 AM", type: "Ride Payment", amount: -220, method: "Stripe ••••4242", status: "Completed" },
];

const MOCK_REFUNDS = [
  { id: "REF-101", rideId: "Ride #1030", amount: 120, reason: "Driver Cancelled", status: "Pending", date: "Feb 28, 2026" },
  { id: "REF-100", rideId: "Ride #0988", amount: 350, reason: "Overcharged Route", status: "Completed", date: "Jan 15, 2026" },
  { id: "REF-099", rideId: "Ride #0980", amount: 50, reason: "Promo Not Applied", status: "Rejected", date: "Jan 10, 2026" },
];

// --- HELPER COMPONENTS ---

const StatusBadge = ({ status }) => {
  let colors = "bg-gray-100 text-gray-600";
  let Icon = Clock;

  if (status === "Completed") {
    colors = "bg-[#2FCA71]/10 text-[#2FCA71]";
    Icon = CheckCircle2;
  } else if (status === "Pending" || status === "Processing") {
    colors = "bg-amber-100 text-amber-700";
    Icon = RefreshCcw;
  } else if (status === "Failed" || status === "Rejected") {
    colors = "bg-red-100 text-red-600";
    Icon = XCircle;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};


export default function WalletPage() {
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Wallet & Payments</h1>
          <p className="text-gray-500 mt-1">Manage your balances, payment methods, and transaction history.</p>
        </div>
        <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition shadow-sm font-medium text-sm">
          <Download size={16} />
          Download Statement
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ===================== SECTION 1: BALANCE ===================== */}
        <div className="lg:col-span-1 border border-gray-200 bg-white rounded-3xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2FCA71]/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />

          <div className="flex items-center gap-3 mb-6 relative">
            <div className="p-3 bg-[#2FCA71]/10 text-[#2FCA71] rounded-2xl">
              <Wallet size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Total Balance</h2>
          </div>

          <div className="mb-8 relative">
            <span className="text-sm text-gray-500 font-medium">Available Wallet Balance</span>
            <div className="text-5xl font-extrabold text-gray-900 tracking-tight mt-1">
              ৳{MOCK_BALANCE.wallet.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 relative">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-xs text-gray-500 font-semibold block mb-1">Ride Credits</span>
              <span className="text-xl font-bold text-gray-800">৳{MOCK_BALANCE.credits}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-xs text-gray-500 font-semibold block mb-1">Promo Credits</span>
              <span className="text-xl font-bold text-[#2FCA71]">৳{MOCK_BALANCE.promos}</span>
            </div>
          </div>

          <div className="flex gap-3 relative">
            <button className="flex-1 bg-[#2FCA71] text-white py-3.5 rounded-xl font-bold hover:bg-[#25A65B] transition shadow-lg shadow-[#2FCA71]/20 flex items-center justify-center gap-2">
              <Plus size={18} /> Add Money
            </button>
            <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition">
              Withdraw
            </button>
          </div>
        </div>

        {/* ===================== SECTION 2: PAYMENT METHODS ===================== */}
        <div className="lg:col-span-2 border border-gray-200 bg-white rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CreditCard size={20} className="text-gray-400" /> Payment Methods
            </h2>
            <button
              onClick={() => setIsAddingPayment(!isAddingPayment)}
              className="text-sm font-semibold text-[#2FCA71] hover:text-[#25A65B] flex items-center gap-1 bg-[#2FCA71]/5 px-3 py-1.5 rounded-lg transition"
            >
              <Plus size={16} /> Add New
            </button>
          </div>

          <AnimatePresence>
            {isAddingPayment && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex gap-3">
                  <button className="flex-1 bg-white border border-gray-200 p-3 rounded-xl hover:border-[#2FCA71] transition flex items-center justify-center gap-2">
                    <CreditCard size={18} className="text-gray-600" /> Stripe
                  </button>
                  <button className="flex-1 bg-white border border-gray-200 p-3 rounded-xl hover:border-[#2FCA71] transition flex items-center justify-center gap-2">
                    <Landmark size={18} className="text-gray-600" /> SSLCommerz
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {MOCK_PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <div key={method.id} className={`p-5 rounded-2xl border-2 transition-all ${method.isDefault ? 'border-[#2FCA71] bg-[#2FCA71]/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-white shadow-sm rounded-xl border border-gray-100">
                      <Icon size={24} className={method.isDefault ? "text-[#2FCA71]" : "text-gray-500"} />
                    </div>
                    {method.isDefault && (
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-[#2FCA71] text-white px-2 py-1 rounded-md">Default</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{method.type}</h3>
                  <p className="text-gray-500 text-sm font-medium">
                    {method.last4 ? `•••• •••• •••• ${method.last4}` : method.account}
                  </p>
                  {method.expiry && <p className="text-gray-400 text-xs mt-2">Expires {method.expiry}</p>}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ===================== SECTION 4: TRANSACTIONS ===================== */}
        <div className="lg:col-span-2 border border-gray-200 bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText size={20} className="text-gray-400" /> Transaction History
            </h2>
            <button className="text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-500">
                  <th className="pb-3 font-semibold">Transaction</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Method</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TRANSACTIONS.map((txn, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${txn.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                          {txn.amount > 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{txn.type}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{txn.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-600">{txn.date}</td>
                    <td className="py-4 text-sm text-gray-600">{txn.method}</td>
                    <td className="py-4"><StatusBadge status={txn.status} /></td>
                    <td className="py-4 text-right">
                      <span className={`font-bold ${txn.amount > 0 ? 'text-[#2FCA71]' : 'text-gray-900'}`}>
                        {txn.amount > 0 ? '+' : ''}৳{Math.abs(txn.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================== SECTION 3 & 5: PROMOS & REFUNDS ===================== */}
        <div className="lg:col-span-1 space-y-6">

          {/* Promos */}
          <div className="border border-gray-200 bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Ticket size={20} className="text-[#2FCA71]" /> Promo History
            </h2>
            <div className="space-y-4">
              {MOCK_PROMOS.map((promo) => (
                <div key={promo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <span className="inline-block px-2 py-1 bg-gray-900 text-white text-[10px] font-bold tracking-wider rounded uppercase mb-1">
                      {promo.code}
                    </span>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-[#2FCA71]" /> Used {promo.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-[#2FCA71] text-sm">-৳{promo.discount}</span>
                    <span className="text-xs text-gray-400 font-mono mt-0.5">{promo.ref}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refunds */}
          <div className="border border-gray-200 bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
              <AlertCircle size={20} className="text-amber-500" /> Refund Status
            </h2>
            <div className="space-y-4">
              {MOCK_REFUNDS.map((refund) => (
                <div key={refund.id} className="flex flex-col p-4 border border-gray-100 rounded-2xl hover:shadow-md transition bg-white group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900 text-sm">{refund.rideId}</span>
                    <span className="font-bold text-gray-900">৳{refund.amount}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{refund.reason}</p>
                  <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400">{refund.date}</span>
                    <StatusBadge status={refund.status} />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition border border-gray-200">
              Request New Refund
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}