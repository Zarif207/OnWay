"use client";
import { Megaphone, Trash2, Send, Edit3, X, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

const NoticeManager = () => {
    const [notices, setNotices] = useState([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [editData, setEditData] = useState(null);

    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/notice`;

    const fetchNotices = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            if (data.success) setNotices(data.data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => { fetchNotices(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const url = editData ? `${API_URL}/${editData._id}` : API_URL;
        const method = editData ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, message }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success(editData ? "Notice Updated Successfully!" : "Notice published & Emails sent!");
                setTitle('');
                setMessage('');
                setEditData(null);
                fetchNotices();
            } else {
                toast.error(data.message || "Something went wrong!");
            }
        } catch (err) {
            toast.error("Network error! Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        toast.success("Notice deleted!");
                        fetchNotices();
                    }
                } catch (err) {
                    toast.error("Delete failed!");
                }
            }
        });
    };

    const handleEditClick = (notice) => {
        setEditData(notice);
        setTitle(notice.title);
        setMessage(notice.message);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast('Editing Mode Active', { icon: '📝' });
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-100 p-3 rounded-xl text-red-600 shadow-inner">
                            <Megaphone size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">OnWay Notice</h2>
                            <p className="text-sm text-gray-500 font-medium">Broadcast announcements to all passengers</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-4">
                        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-8">
                            <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-700">
                                {editData ? <Edit3 size={20} className="text-blue-500" /> : <Send size={20} className="text-green-500" />}
                                {editData ? "Update Notice" : "Compose New"}
                            </h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5 ml-1">Notice Title</label>
                                    <input
                                        value={title} onChange={(e) => setTitle(e.target.value)}
                                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 ring-red-500/10 focus:border-red-500 outline-none transition-all placeholder:text-gray-300"
                                        placeholder="e.g. System Maintenance" required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5 ml-1">Message Body</label>
                                    <textarea
                                        value={message} onChange={(e) => setMessage(e.target.value)}
                                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl h-44 outline-none focus:ring-4 ring-red-500/10 focus:border-red-500 transition-all placeholder:text-gray-300 resize-none"
                                        placeholder="Type your detailed message here..." required
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        disabled={loading}
                                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all transform active:scale-95 ${editData ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200' : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200'
                                            }`}
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : editData ? "Update Now" : "Send to Everyone"}
                                    </button>
                                    {editData && (
                                        <button
                                            type="button"
                                            onClick={() => { setEditData(null); setTitle(''); setMessage(''); toast('Cancelled edit'); }}
                                            className="p-4 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 transition-colors"
                                        >
                                            <X size={22} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                <h3 className="font-bold text-gray-800">Notice History</h3>
                                <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full">{notices.length} Total</span>
                            </div>
                            <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {notices.length > 0 ? notices.map(n => (
                                    <div key={n._id} className="p-6 hover:bg-red-50/30 transition-all group">
                                        <div className="flex justify-between items-start gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                                                    <span className="text-[10px] font-black text-red-500/70 tracking-widest uppercase">Live Notice</span>
                                                    <span className="text-xs text-gray-400 font-medium">{new Date(n.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                                <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-red-600 transition-colors">{n.title}</h4>
                                                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{n.message}</p>
                                            </div>
                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleEditClick(n)}
                                                    className="p-2.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(n._id)}
                                                    className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center p-20 text-gray-300">
                                        <Megaphone size={48} className="mb-4 opacity-20" />
                                        <p className="font-medium">Clean slate! No notices yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoticeManager;