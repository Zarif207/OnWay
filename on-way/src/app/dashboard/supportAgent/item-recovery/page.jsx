"use client";
import React, { useState, useEffect } from "react";
import { PackageSearch, Search, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import SupportLoading from "../SupportLoading";

export default function ItemRecoveryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/item-recovery`);
      if (res.ok) {
        const data = await res.json();
        setItems(data?.data || data || []);
      }
    } catch (err) {
      console.error("Error fetching item recovery requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = items.filter((item) => {
    const matchSearch =
      item.passengerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rideId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "All" || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusIcon = (status) => {
    if (status === "Recovered") return <CheckCircle size={14} className="text-green-500" />;
    if (status === "Pending") return <Clock size={14} className="text-yellow-500" />;
    return <XCircle size={14} className="text-red-400" />;
  };

  const statusBadge = (status) => {
    if (status === "Recovered") return "bg-green-100 text-green-700";
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-600";
  };

  if (loading) return <SupportLoading />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PackageSearch className="text-[#2FCA71]" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Item Recovery</h1>
            <p className="text-sm text-gray-500">Manage lost item requests from passengers</p>
          </div>
        </div>
        <button
          onClick={fetchItems}
          className="flex items-center gap-2 px-4 py-2 bg-[#2FCA71] text-white rounded-xl text-sm font-semibold hover:bg-[#27b362] transition"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by passenger, item or ride ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2FCA71]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2FCA71]"
        >
          <option>All</option>
          <option>Pending</option>
          <option>Recovered</option>
          <option>Not Found</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <PackageSearch size={48} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">No item recovery requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Passenger</th>
                <th className="px-5 py-3 text-left">Item Description</th>
                <th className="px-5 py-3 text-left">Ride ID</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item, i) => (
                <tr key={item._id || i} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-medium text-gray-800">{item.passengerName || "—"}</td>
                  <td className="px-5 py-3 text-gray-600">{item.itemDescription || "—"}</td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{item.rideId || "—"}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(item.status)}`}>
                      {statusIcon(item.status)} {item.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
