"use client";

import { useState, useEffect } from "react";
import {
  User, MapPin, ShieldAlert, Settings, Bell,
  Globe, Shield, Camera, Edit2, Plus,
  Trash2, Car, Volume2, ArrowRight, Share2,
  LogOut, AlertTriangle, KeySquare, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const TABS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "addresses", label: "Saved Addresses", icon: MapPin },
  { id: "emergency", label: "Emergency Contacts", icon: ShieldAlert },
  { id: "preferences", label: "Ride Preferences", icon: Settings },
  { id: "notifications", label: "Notifications & Language", icon: Bell },
  { id: "security", label: "Account & Security", icon: Shield },
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("personal");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    image: ""
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/passenger/${session.user.id}`);
      if (res.data.success) {
        const userData = res.data.data;
        setUser(userData);
        setFormData({
          name: userData.name || "",
          phone: userData.phone || "",
          email: userData.email || "",
          image: userData.image || ""
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await axios.patch(`${API_BASE_URL}/passenger/profile/${session.user.id}`, {
        name: formData.name,
        phone: formData.phone,
        image: formData.image
      });
      if (res.data.success) {
        toast.success("Profile updated successfully!");
        fetchProfile();
      }
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Syncing Account...</p>
      </div>
    );

    switch (activeTab) {
      case "personal":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <h2 className="text-3xl font-black text-secondary tracking-tighter">Personal Info</h2>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
                  <img src={formData.image || `https://ui-avatars.com/api/?name=${formData.name}&background=2FCA71&color=fff&size=200`} alt="Profile" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera className="text-white" size={24} />
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-secondary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-secondary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-300 cursor-not-allowed shadow-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-50 pt-8">
              <button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="bg-secondary text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-[#011421] transition-all shadow-2xl shadow-secondary/20 flex items-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : "Update Profile"}
              </button>
            </div>
          </motion.div>
        );

      case "addresses":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-secondary tracking-tighter">Saved Places</h2>
              <button className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
                <Plus size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(user?.savedLocations || []).length > 0 ? user.savedLocations.map((loc, i) => (
                <div key={i} className="p-6 bg-white border border-gray-100 rounded-[2.5rem] flex items-start justify-between group hover:shadow-xl transition-all hover:scale-[1.02]">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-secondary tracking-tight">{loc.label}</h4>
                      <p className="text-xs font-bold text-gray-400 line-clamp-1">{loc.address}</p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              )) : (
                <div className="md:col-span-2 py-20 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center gap-4">
                  <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-gray-200">
                    <MapPin size={32} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No saved addresses yet</p>
                </div>
              )}
            </div>
          </motion.div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 gap-4 opacity-20">
            <Settings size={48} />
            <p className="text-xs font-black uppercase tracking-widest">Tab integration in progress...</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-secondary tracking-tighter">Account Settings</h1>
          <p className="text-gray-400 font-medium">Customize your OnWay experience</p>
        </div>
        <button onClick={() => signOut()} className="flex items-center gap-3 px-8 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all shadow-sm">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* SIDEBAR */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-between px-6 py-5 rounded-[1.8rem] transition-all group
                  ${isActive
                    ? "bg-secondary text-white shadow-2xl shadow-secondary/20 scale-[1.05] z-10"
                    : "text-gray-400 hover:bg-gray-50 hover:text-secondary"}
                `}
              >
                <div className="flex items-center gap-4">
                  <Icon size={20} className={isActive ? "text-primary" : "text-gray-300 group-hover:text-primary transition-colors"} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
                </div>
                <ArrowRight size={16} className={`transition-transform ${isActive ? "translate-x-0" : "-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`} />
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="lg:col-span-8 bg-white rounded-[3.5rem] border border-gray-100 shadow-xl p-8 md:p-12 min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "circOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}