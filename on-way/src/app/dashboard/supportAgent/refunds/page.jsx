"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { DollarSign, Search, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const StatusBadge = ({ status }) => {
  const map = {
    pending:  "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${map[status] || map.pending}`}>
      {status}
    </span>
  );
};

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [agentNote, setAgentNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/refunds`);
      setRefunds(res.data.data || []);
    } catch (_) {
      toast.error("Failed to load refunds");
    }
    setLoading(false);
  };

  useEffect(() => { fetchRefunds(); }, []);

  useEffect(() => {
    let data = [...refunds];
    if (statusFilter !== "all") data = data.filter(r => r.status === statusFilter);
    if (search) data = data.filter(r =>
      r.passengerName?.toLowerCase().includes(search.toLowerCase()) ||
      r.cause?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [refunds, statusFilter, search]);

  const handleAction = async (id, status) => {
    setProcessing(true);
    try {
      await axios.patch(`${API}/refunds/${id}`, { status, agentNote });
      toast.success(`Refund ${status}`);
      setSelected(null);
      setAgentNote("");
      fetchRefunds();
    } catch (_) {
      toast.error("Action failed");
    }
    setProcessing(false);
  };

  const counts = {
    pending:  refunds.filter(r => r.status === "pending").length,
    approved: refunds.filter(r => r.status === "approved").length,
    rejected: refunds.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="text-green-500" /> Refund Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review and process passenger refund requests</p>
        </div>
        <button onClick={fetchRefunds} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition">
          <RefreshCw size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending",  count: counts.pending,  color: "yellow", icon: Clock },
          { label: "Approved", count: counts.approved, color: "green",  icon: CheckCircle },
          { label: "Rejected", count: counts.rejected, color: "red",    icon: XCircle },
        ].map(s => (
          <div key={s.label} className={`bg-${s.color}-50 border-l-4 border-${s.color}-500 p-4 rounded-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm text-${s.color}-600 font-semibold`}>{s.label}</p>
                <p className={`text-2xl font-bold text-${s.color}-700`}>{s.count}</p>
              </div>
              <s.icon className={`text-${s.color}-500`} size={28} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or cause..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
          />
        </div>
        {["all", "pending", "approved", "rejected"].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition ${
              statusFilter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No refund requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Passenger", "Cause", "Amount", "Ride Info", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{r.passengerName || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[180px]">
                      <p className="font-medium">{r.cause}</p>
                      {r.description && <p className="text-xs text-gray-400 truncate">{r.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      {r.amount > 0 ? `৳${r.amount}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {r.bookingInfo ? (
                        <div>
                          <p className="font-semibold text-gray-700">
                            {r.bookingInfo.rideType === "bike" ? "🏍️ Bike" : r.bookingInfo.rideType === "premium" ? "🚗 Premium" : "🚕 Car"}
                          </p>
                          <p className="truncate max-w-[140px]">{r.bookingInfo.pickup}</p>
                          <p className="truncate max-w-[140px]">→ {r.bookingInfo.dropoff}</p>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {r.status === "pending" ? (
                        <button
                          onClick={() => { setSelected(r); setAgentNote(""); }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">{r.agentNote || "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={e => e.target === e.currentTarget && setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            >
              <h2 className="text-lg font-bold text-gray-900">Review Refund Request</h2>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Passenger</span><span className="font-bold">{selected.passengerName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Cause</span><span className="font-bold">{selected.cause}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-green-600">৳{selected.amount || 0}</span></div>
                {selected.description && (
                  <div><span className="text-gray-500">Details: </span><span>{selected.description}</span></div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  Agent Note (optional)
                </label>
                <textarea
                  value={agentNote}
                  onChange={e => setAgentNote(e.target.value)}
                  rows={2}
                  placeholder="Add a note for the passenger..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(selected._id, "approved")}
                  disabled={processing}
                  className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button
                  onClick={() => handleAction(selected._id, "rejected")}
                  disabled={processing}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle size={16} /> Reject
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
