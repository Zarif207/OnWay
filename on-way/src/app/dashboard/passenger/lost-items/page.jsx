"use client";

import { useEffect, useState } from "react";
import { Search, CheckCircle, Phone, XCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import OnWayLoading from "@/app/components/Loading/page";

export default function LostItemsAdminPage() {
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const fetchLostItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/lost-items`);
      const data = await res.json();
      if (data.success) {
        setLostItems(data.data || []);
      } else {
        toast.error("Failed to load lost items");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching lost items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostItems();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/lost-items/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Case marked as ${status}`);
        fetchLostItems(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating status");
    }
  };

  const handleContact = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const filteredItems = lostItems.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.itemName?.toLowerCase().includes(term) ||
      item.rideId?.toLowerCase().includes(term) ||
      item.phone?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wide">Pending</span>;
      case "found":
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide">Found</span>;
      case "contacted":
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">Contacted</span>;
      case "closed":
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wide">Closed</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wide">{status}</span>;
    }
  };

  if (loading) return <OnWayLoading />;

  return (
    <div className="min-h-screen p-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Lost & Found Management
            </h1>
            <p className="text-slate-500 mt-1">
              Review passenger lost item reports and update statuses
            </p>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, item name, or phone..."
              className="bg-white border border-slate-200 pl-12 pr-6 py-3 rounded-2xl w-full md:w-80 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* List content */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {filteredItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                    <th className="p-5 font-bold">Ride ID / Date</th>
                    <th className="p-5 font-bold">Item & Description</th>
                    <th className="p-5 font-bold">Phone</th>
                    <th className="p-5 font-bold">Status</th>
                    <th className="p-5 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5">
                        <p className="font-mono text-sm text-slate-900 font-medium">{(item.rideId || "N/A").slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-5 max-w-xs">
                        <p className="font-bold text-slate-800">{item.itemName}</p>
                        <p className="text-sm text-slate-500 truncate mt-1" title={item.description}>{item.description}</p>
                      </td>
                      <td className="p-5">
                        <p className="text-sm font-medium text-slate-700">{item.phone}</p>
                      </td>
                      <td className="p-5">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateStatus(item._id, "found")}
                            disabled={item.status === "found" || item.status === "closed"}
                            className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Mark as Found"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={() => {
                              updateStatus(item._id, "contacted");
                              handleContact(item.phone);
                            }}
                            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Contact Passenger"
                          >
                            <Phone className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={() => updateStatus(item._id, "closed")}
                            disabled={item.status === "closed"}
                            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Close Case"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-24">
              <AlertCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No lost items found</h3>
              <p className="text-slate-400 mt-2">There are currently no lost item reports matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
