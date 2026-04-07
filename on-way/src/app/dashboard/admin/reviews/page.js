"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Star,
    Trash2,
    Search,
    MessageSquare,
    Clock,
    User,
    CarFront,
    Filter
} from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import OnWayLoading from "@/app/components/Loading/page";

export default function ReviewManagement() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const reviewPageSize = 10;

    const API = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API}/reviews`);
            const data = await res.json();
            if (data.success) {
                setReviews(Array.isArray(data.data) ? data.data : []);
            }
        } catch (error) {
            toast.error("Network error! Could not connect to database.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This review will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            background: "#ffffff",
            customClass: {
                popup: 'rounded-[2rem]'
            }
        });

        if (result.isConfirmed) {
            const toastId = toast.loading("Processing deletion...");
            try {
                const res = await fetch(`${API}/reviews/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                const data = await res.json();

                if (data.success) {
                    setReviews((prev) => prev.filter((r) => r._id !== id));
                    toast.success("Review deleted successfully", { id: toastId });
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                toast.error(error.message || "Deletion failed!", { id: toastId });
            }
        }
    };

    const filteredReviews = useMemo(() => {
        return reviews.filter((r) =>
            `${r.review} ${r.passengerName} ${r.driverId}`.toLowerCase().includes(search.toLowerCase())
        );
    }, [reviews, search]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    // Pagination logic
    const itemsPerPage = reviewPageSize;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReviews = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
 if (loading) {
    return (
      <OnWayLoading></OnWayLoading>   
    );
  }
    return (
        <div className="min-h-screen p-2">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            Review <span className="text-blue-600/70 italic">Console</span>
                        </h1>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, ID or comment..."
                            className="w-full md:w-96 pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="py-40 flex flex-col items-center justify-center">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-slate-400 font-medium">Loading data...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/80">
                                    <tr>
                                        <th className="px-8 py-6 text-xs uppercase tracking-wider font-bold text-slate-500">Passenger Info</th>
                                        <th className="px-8 py-6 text-xs uppercase tracking-wider font-bold text-slate-500 text-center">Rating</th>
                                        <th className="px-8 py-6 text-xs uppercase tracking-wider font-bold text-slate-500">Feedback Details</th>
                                        <th className="px-8 py-6 text-xs uppercase tracking-wider font-bold text-slate-500 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <AnimatePresence mode="popLayout">
                                        {currentReviews.map((review) => (
                                            <motion.tr
                                                key={review._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -30 }}
                                                className="hover:bg-blue-50/30 transition-colors group"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800 flex items-center gap-2">
                                                            <User size={14} className="text-blue-500" /> {review.passengerName || "Anonymous"}
                                                        </span>
                                                        <span className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                                                            <CarFront size={12} /> Driver ID: {review.driverId?.slice(-8)}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-6">
                                                    <div className="flex justify-center">
                                                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100 font-black text-sm">
                                                            <Star size={14} className="fill-amber-500 text-amber-500" />
                                                            {Number(review.rating).toFixed(1)}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-6 max-w-sm">
                                                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 italic">
                                                        "{review.review || "No verbal feedback provided."}"
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                        <Clock size={12} /> {new Date(review.createdAt).toDateString()}
                                                    </div>
                                                </td>

                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => handleDelete(review._id)}
                                                        className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-95"
                                                        title="Delete Review"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>

                            {filteredReviews.length === 0 && !loading && (
                                <div className="py-24 text-center">
                                    <div className="inline-flex p-6 bg-slate-50 rounded-full mb-4 text-slate-300">
                                        <MessageSquare size={40} />
                                    </div>
                                    <h3 className="text-slate-800 font-bold">No reviews found</h3>
                                    <p className="text-slate-400 text-sm">Try searching with different keywords.</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {!loading && filteredReviews.length > 0 && (
                                <div className="flex justify-center mt-8 pb-6">
                                    <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl">
                                        {/* Prev Button */}
                                        <button
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 text-slate-500 font-medium rounded-xl hover:bg-slate-200 disabled:opacity-40 flex items-center gap-1"
                                        >
                                            ‹ Prev
                                        </button>

                                        {/* Page Numbers */}
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl font-semibold transition-all ${
                                                    currentPage === i + 1
                                                        ? "bg-green-500 text-white shadow-md"
                                                        : "text-slate-600 hover:bg-slate-200"
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
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}