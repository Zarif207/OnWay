"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PackageSearch, Clock, CheckCircle, XCircle, AlertCircle, Search } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import OnWayLoading from "@/app/components/Loading/page";

export default function PassengerLostItemsPage() {
  const { data: session } = useSession();
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const fetchLostItems = async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      // Filter by passengerId to ensure privacy
      const res = await fetch(`${API_BASE}/lost-items?passengerId=${session.user.id}`);
      const data = await res.json();
      if (data.success) {
        setLostItems(data.data || []);
      } else {
        toast.error("Failed to load your lost items");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching lost items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
       fetchLostItems();
    }
  }, [session]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100">
            <Clock size={12} /> Pending
          </span>
        );
      case "found":
      case "recovered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
            <CheckCircle size={12} /> Found
          </span>
        );
      case "closed":
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-slate-100">
            <XCircle size={12} /> Case Closed
          </span>
        );
      default:
        return <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider">{status}</span>;
    }
  };

  if (loading) return <OnWayLoading />;

  const filteredItems = lostItems.filter(item => 
    item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.rideId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              <PackageSearch size={14} /> Recovery Center
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Lost Items</h1>
            <p className="text-slate-500 font-medium">Tracking your reported items and their recovery status</p>
          </div>

          <div className="relative group max-w-sm w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by ID or item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-12 pr-6 py-4 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </header>

        {/* Dashboard Content */}
        {filteredItems.length > 0 ? (
          <div className="grid gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item._id} 
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-8 group"
              >
                {/* Item Icon/Image */}
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 transition-colors relative overflow-hidden shrink-0">
                  {item.itemImage ? (
                    <img src={item.itemImage} alt={item.itemName} className="w-full h-full object-cover" />
                  ) : (
                    <PackageSearch size={32} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                  )}
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-4 w-full text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-none mb-2">{item.itemName}</h3>
                      <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-wider">
                         <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-slate-200 rounded-full" /> ID: {item.rideId?.slice(-8).toUpperCase()}</span>
                         <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-slate-200 rounded-full" /> Date: {new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div>{getStatusBadge(item.status)}</div>
                  </div>
                  
                  <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                    {item.description || "No description provided."}
                  </p>

                  <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-3">
                    <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Reported Phone: {item.phone}
                    </div>
                  </div>
                </div>

                {/* Quick Info/Help */}
                <div className="w-full lg:w-48 p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Status Overview</p>
                   <div className="text-sm font-bold text-slate-700 mb-1">
                      {item.status === 'pending' ? 'Search in Progress' : item.status === 'found' ? 'Item Secured' : 'Case Closed'}
                   </div>
                   <p className="text-[10px] text-slate-400 font-medium leading-tight">
                      {item.status === 'pending' ? 'Our agents are currently investigating your claim.' : 'We have identified your item and will contact you shortly.'}
                   </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border border-dashed border-slate-200 py-32 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center">
              <PackageSearch size={40} className="text-slate-200" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">No lost reports found</h3>
              <p className="text-slate-400 max-w-xs mx-auto">Items you report from your ride history will appear here for tracking.</p>
            </div>
          </div>
        )}

        {/* Support Section */}
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left">
              <h2 className="text-3xl font-black tracking-tight">Need immediate help?</h2>
              <p className="text-slate-400 max-w-md font-medium">Our support team is available 24/7 to assist with critical items like phones, wallets, or passports.</p>
            </div>
            <button 
               className="px-10 py-5 bg-[#2FCA71] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#27b362] transition-all transform active:scale-95 shadow-xl shadow-green-500/20"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
