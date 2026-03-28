"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import { RotateCcw, CheckCircle2, Clock, XCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const CAUSES = [
  "Driver did not arrive",
  "Ride was cancelled by driver",
  "Overcharged fare",
  "Poor service / misconduct",
  "Duplicate payment",
  "Technical error during payment",
  "Ride not completed but charged",
  "Other",
];

const StatusBadge = ({ status }) => {
  const map = {
    pending:  { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
    approved: { bg: "bg-green-100",  text: "text-green-700",  icon: CheckCircle2 },
    rejected: { bg: "bg-red-100",    text: "text-red-700",    icon: XCircle },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${s.bg} ${s.text}`}>
      <s.icon size={12} /> {status}
    </span>
  );
};

export default function RefundRequestPage() {
  const { data: session } = useSession();
  const passengerId = session?.user?.id;

  const [myRefunds, setMyRefunds] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    bookingId: "",
    rideType: "",
    cause: "",
    description: "",
  });

  // Fetch passenger's past refunds and rides
  useEffect(() => {
    if (!passengerId) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const [refRes, rideRes] = await Promise.all([
          axios.get(`${API}/refunds/passenger/${passengerId}`),
          axios.get(`${API}/bookings?passengerId=${passengerId}`),
        ]);
        setMyRefunds(refRes.data.data || []);
        const completedRides = (rideRes.data.data || []).filter(
          r => ["completed", "cancelled"].includes(r.bookingStatus)
        );
        setRides(completedRides);
      } catch (_) {}
      setLoading(false);
    };
    fetch();
  }, [passengerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cause) return toast.error("Please select a cause");
    setSubmitting(true);
    try {
      const selectedRide = rides.find(r => r._id === form.bookingId);
      await axios.post(`${API}/refunds`, {
        passengerId,
        bookingId: form.bookingId || null,
        rideType: form.rideType || null,
        cause: form.cause,
        description: form.description,
        amount: selectedRide?.price || 0,
      });
      toast.success("Refund request submitted!");
      setForm({ bookingId: "", rideType: "", cause: "", description: "" });
      setShowForm(false);
      // Refresh
      const res = await axios.get(`${API}/refunds/passenger/${passengerId}`);
      setMyRefunds(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <RotateCcw className="text-[#2FCA71]" size={24} /> Refund Requests
          </h1>
          <p className="text-gray-500 text-sm mt-1">Submit a refund request for a completed or cancelled ride</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-5 py-2.5 bg-[#2FCA71] text-white font-bold rounded-xl hover:bg-[#25A65B] transition text-sm"
        >
          + New Request
        </button>
      </div>

      {/* New Request Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
          >
            <h2 className="font-bold text-gray-800">New Refund Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Vehicle Type */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  Select Ride Type (optional)
                </label>
                <select
                  value={form.rideType}
                  onChange={e => setForm(f => ({ ...f, rideType: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2FCA71]/30"
                >
                  <option value="">-- Select ride type --</option>
                  <option value="bike">Bike</option>
                  <option value="car">Car</option>
                </select>
              </div>

              {/* Cause */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  Cause <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.cause}
                  onChange={e => setForm(f => ({ ...f, cause: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2FCA71]/30"
                >
                  <option value="">-- Select a cause --</option>
                  {CAUSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  Additional Details
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe your issue..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2FCA71]/30 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#2FCA71] text-white font-bold rounded-xl hover:bg-[#25A65B] transition disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My Refunds List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-800">My Requests</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : myRefunds.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No refund requests yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {myRefunds.map(r => (
              <div key={r._id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{r.cause}</p>
                  {r.description && <p className="text-gray-500 text-xs mt-0.5">{r.description}</p>}
                  {r.agentNote && (
                    <p className="text-xs mt-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg inline-block">
                      Agent note: {r.agentNote}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={r.status} />
                  {r.amount > 0 && <span className="text-sm font-bold text-gray-700">৳{r.amount}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
