"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  PackageSearch,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  ChevronDown,
  User,
  Hash,
  Calendar,
  Phone,
  ImageOff,
  Loader2,
} from "lucide-react";
import SupportLoading from "../SupportLoading";
import toast, { Toaster } from "react-hot-toast";

const STATUS_OPTIONS = ["Pending", "Recovered", "Not Found"];

export default function ItemRecoveryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemRecoveryPerPage = 10;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  // ── Fetch all lost-item reports ──────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/item-recovery`);
      if (res.ok) {
        const data = await res.json();
        setItems(data?.data || data || []);
      } else {
        toast.error("Failed to load item recovery requests");
      }
    } catch (err) {
      console.error("Error fetching item recovery requests:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Status update ────────────────────────────────────────
  const handleStatusUpdate = async (itemId, newStatus) => {
    setUpdatingId(itemId);
    try {
      const res = await fetch(`${apiUrl}/item-recovery/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Status updated to "${newStatus}"`);
        setItems((prev) =>
          prev.map((item) =>
            item._id === itemId ? { ...item, status: newStatus } : item
          )
        );
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Network error. Could not update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Filter / search ──────────────────────────────────────
  const filtered = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      item.passengerName?.toLowerCase().includes(q) ||
      item.itemDescription?.toLowerCase().includes(q) ||
      item.itemName?.toLowerCase().includes(q) ||
      String(item.rideId || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Helpers ──────────────────────────────────────────────
  const statusConfig = {
    Pending: { icon: <Clock size={13} />, cls: "bg-amber-100 text-amber-700 border-amber-200" },
    Recovered: { icon: <CheckCircle size={13} />, cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "Not Found": { icon: <XCircle size={13} />, cls: "bg-red-100 text-red-600 border-red-200" },
  };

  const getStatusConfig = (status) =>
    statusConfig[status] || statusConfig["Pending"];

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const shortId = (id) => (id ? String(id).slice(-8).toUpperCase() : "—");

  // ── Summary counts ───────────────────────────────────────
  const counts = {
    all: items.length,
    pending: items.filter((i) => i.status === "Pending").length,
    recovered: items.filter((i) => i.status === "Recovered").length,
    notFound: items.filter((i) => i.status === "Not Found").length,
  };

  const totalPages = Math.ceil(filtered.length / itemRecoveryPerPage);

  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemRecoveryPerPage,
    currentPage * itemRecoveryPerPage
  );

  if (loading) return <SupportLoading />;

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#2FCA71]/10 flex items-center justify-center">
            <PackageSearch className="text-[#2FCA71]" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">Item Recovery</h1>
            <p className="text-sm text-gray-500">Manage lost item requests from passengers</p>
          </div>
        </div>
        <button
          onClick={fetchItems}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2FCA71] text-white rounded-xl text-sm font-semibold hover:bg-[#27b362] transition-colors shadow-sm"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* ── Stats row ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.all, color: "text-gray-700", bg: "bg-white" },
          { label: "Pending", value: counts.pending, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Recovered", value: counts.recovered, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Not Found", value: counts.notFound, color: "text-red-500", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100 shadow-sm`}>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by passenger name, item, or ride ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#2FCA71] focus:ring-2 focus:ring-[#2FCA71]/20 transition"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#2FCA71] focus:ring-2 focus:ring-[#2FCA71]/20 transition cursor-pointer"
          >
            <option>All</option>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Card list ──────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
          <PackageSearch size={48} className="mb-3 opacity-25" />
          <p className="text-sm font-semibold">No item recovery requests found</p>
          <p className="text-xs mt-1 text-gray-400">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedItems.map((item) => {
            const sc = getStatusConfig(item.status || "Pending");
            const isUpdating = updatingId === item._id;
            const nextStatuses = STATUS_OPTIONS.filter((s) => s !== (item.status || "Pending"));

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col lg:flex-row gap-5 hover:shadow-md transition-shadow"
              >
                {/* Item image */}
                <div className="flex-shrink-0">
                  {item.itemImage ? (
                    <button
                      onClick={() => setPreviewImage(item.itemImage)}
                      className="block w-20 h-20 rounded-xl overflow-hidden border border-gray-100 hover:opacity-90 transition"
                      title="Click to enlarge"
                    >
                      <img
                        src={item.itemImage}
                        alt={item.itemName}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                      <ImageOff size={24} />
                      <span className="text-[10px] mt-1">No image</span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Title row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-gray-800 text-base">{item.itemName || "—"}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sc.cls}`}>
                      {sc.icon} {item.status || "Pending"}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-500 line-clamp-2">{item.itemDescription || "—"}</p>

                  {/* Meta grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 pt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <User size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-700 truncate">{item.passengerName || "—"}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Hash size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="font-mono">{shortId(item.rideId)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone size={12} className="text-gray-400 flex-shrink-0" />
                      {item.phone || "—"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex flex-col gap-2 justify-center lg:min-w-[140px]">
                  {nextStatuses.map((newStatus) => (
                    <button
                      key={newStatus}
                      disabled={isUpdating}
                      onClick={() => handleStatusUpdate(item._id, newStatus)}
                      className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${newStatus === "Recovered"
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                        }`}
                    >
                      {isUpdating ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : newStatus === "Recovered" ? (
                        <CheckCircle size={13} />
                      ) : (
                        <XCircle size={13} />
                      )}
                      {newStatus}
                    </button>
                  ))}
                  {/* Reset to Pending if resolved */}
                  {item.status !== "Pending" && (
                    <button
                      disabled={isUpdating}
                      onClick={() => handleStatusUpdate(item._id, "Pending")}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Clock size={13} /> Reset
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex justify-end mt-8">
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-2xl">

          {/* Prev Button */}
          <button
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-gray-500 font-medium rounded-xl hover:bg-gray-200 disabled:opacity-40 flex items-center gap-1"
          >
            ‹ Prev
          </button>

          {/* Page Numbers */}
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl font-semibold transition-all
                    ${currentPage === i + 1
                  ? "bg-green-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-200"
                }`}
            >
              {i + 1}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-white bg-green-500 rounded-xl font-medium hover:bg-green-600 disabled:opacity-40 flex items-center gap-1"
          >
            Next ›
          </button>
        </div>
      </div>

      {/* ── Image Preview Modal ─────────────────────────── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-2xl p-3 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Item preview"
              className="w-full rounded-xl object-contain max-h-[70vh]"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="mt-3 w-full py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
