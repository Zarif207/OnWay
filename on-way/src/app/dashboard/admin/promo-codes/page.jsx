"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, Calendar, Ticket, X, AlertCircle, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const API = `${process.env.NEXT_PUBLIC_API_URL}/promo`;

export default function PromoCodes() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchPromos = async () => {
    try {
      const res = await axios.get(API);
      setPromos(res.data.data || []);
    } catch (error) {
      console.error("Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromos(); }, []);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, data);
        toast.success("Promo updated successfully!");
      } else {
        await axios.post(API, data);
        toast.success("New promo launched!");
      }
      reset();
      setEditingId(null);
      setOpenModal(false);
      fetchPromos();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (promo) => {
    setEditingId(promo._id);
    setOpenModal(true);
    const date = new Date(promo.expiryDate).toISOString().split('T')[0];

    setValue("code", promo.code);
    setValue("discountType", promo.discountType);
    setValue("discountValue", promo.discountValue);
    setValue("expiryDate", date);
    setValue("usageLimit", promo.usageLimit);
    setValue("minRideAmount", promo.minRideAmount);
    setValue("maxDiscount", promo.maxDiscount);
  };

  const toggleStatus = async (promo) => {
    const isExpired = new Date() > new Date(promo.expiryDate);

    if (isExpired && !promo.active) {
      toast.error("Expired promo cannot be activated. Update expiry date first!", {
        icon: '⚠️',
      });
      return;
    }

    try {
      await axios.patch(`${API}/${promo._id}/toggle`);
      fetchPromos();
      toast.success(`Promo ${!promo.active ? 'Activated' : 'Paused'}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Status toggle failed");
    }
  };

  const deletePromo = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!',
      borderRadius: '1rem',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API}/${id}`);
        setPromos(promos.filter(p => p._id !== id));
        toast.success("Promo deleted successfully");
      } catch (error) {
        toast.error("Failed to delete promo");
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 ">
      <div className="max-w-7xl mx-auto">

        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Ticket className="text-orange-500" /> Promo Management
            </h1>
            <p className="text-gray-500 text-sm">Create and track your discount campaigns</p>
          </div>
          <button
            onClick={() => { reset(); setEditingId(null); setOpenModal(true); }}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-green-50"
          >
            <Plus size={20} /> Create New Promo
          </button>
        </div>

        {/* --- Promo Grid --- */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((promo) => {
              const isExpired = new Date() > new Date(promo.expiryDate);
              const usagePercent = Math.min((promo.usedCount / promo.usageLimit) * 100, 100);
              const statusLabel = isExpired ? "Expired" : promo.active ? "Active" : "Paused";

              return (
                <div key={promo._id} className={`group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${isExpired ? 'opacity-75 grayscale-[0.2]' : ''}`}>
                  {/* Visual Status Indicator */}
                  <div className={`h-2 w-full ${isExpired ? 'bg-red-500' : promo.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`px-4 py-2 rounded-lg font-mono font-bold text-lg border-dashed border-2 ${isExpired ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-100 border-gray-300 text-gray-800'}`}>
                        {promo.code}
                      </div>
                      <button
                        onClick={() => toggleStatus(promo)}
                        disabled={isExpired}
                        className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider transition-colors ${isExpired ? 'bg-red-100 text-red-600 cursor-not-allowed' :
                          promo.active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                      >
                        {statusLabel}
                      </button>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Discount</span>
                        <span className="font-bold text-orange-600">
                          {promo.discountType === 'percentage' ? `${promo.discountValue}% Off` : `$${promo.discountValue} Fixed`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1"><Calendar size={14} /> Expiry</span>
                        <span className={`flex items-center gap-1 font-medium ${isExpired ? "text-red-500" : "text-gray-700"}`}>
                          {isExpired && <Clock size={12} />}
                          {new Date(promo.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] mb-1 uppercase font-bold text-gray-400">
                        <span>Usage Limit</span>
                        <span>{promo.usedCount} / {promo.usageLimit}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${usagePercent}%` }}
                          className={`h-full transition-all duration-500 ${isExpired ? 'bg-red-400' : usagePercent > 80 ? 'bg-orange-500' : 'bg-blue-500'}`}
                        ></div>
                      </div>
                    </div>

                    {isExpired && (
                      <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mb-4">
                        <AlertCircle size={12} /> This promo has reached its end date.
                      </p>
                    )}

                    <div className="flex gap-2 border-t pt-4">
                      <button onClick={() => handleEdit(promo)} className="flex-1 flex items-center justify-center gap-1 text-sm font-medium py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <Pencil size={14} /> Edit
                      </button>
                      <button onClick={() => deletePromo(promo._id)} className="flex-1 flex items-center justify-center gap-1 text-sm font-medium py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- Responsive Modal --- */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <Ticket size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">{editingId ? "Update Promo Code" : "Create New Campaign"}</h2>
              </div>
              <button onClick={() => setOpenModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Promo Code</label>
                <input {...register("code", { required: true })} placeholder="e.g. SUMMER50" className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none uppercase font-mono" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Discount Type</label>
                <select {...register("discountType")} className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Value</label>
                <input type="number" {...register("discountValue", { required: true })} placeholder="10" className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Expiry Date</label>
                <input type="date" {...register("expiryDate", { required: true })} className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Usage Limit</label>
                <input type="number" {...register("usageLimit")} placeholder="100" className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Min. Ride Amount</label>
                <input type="number" {...register("minRideAmount")} placeholder="0" className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>

              <div className="md:col-span-2 flex gap-3 mt-4">
                <button type="button" onClick={() => setOpenModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 shadow-lg shadow-orange-100 transition-all">
                  {editingId ? "Update Promo" : "Launch Promo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}