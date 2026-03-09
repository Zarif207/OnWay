"use client";

import { useState } from "react";
import {
  User, MapPin, ShieldAlert, Settings, Bell,
  Globe, Shield, Camera, Edit2, Plus,
  Trash2, Car, Volume2, ArrowRight, Share2,
  LogOut, AlertTriangle, KeySquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// --- MOCK DATA ---
const MOCK_USER = {
  name: "Zarif Hasan",
  phone: "+880 1712 345678",
  email: "zarif@example.com",
  photo: "https://ui-avatars.com/api/?name=Zarif+Hasan&background=2FCA71&color=fff&size=128",
};

const MOCK_ADDRESSES = [
  { id: 1, title: "Home", address: "Navana Tower, Gulshan Ave, Dhaka", icon: MapPin },
  { id: 2, title: "Work", address: "Kemal Ataturk Ave, Banani, Dhaka", icon: MapPin },
];

const MOCK_CONTACTS = [
  { id: 1, name: "Ali Hasan", phone: "+880 1819 123456", relation: "Brother" },
  { id: 2, name: "Sara Rahman", phone: "+880 1611 987654", relation: "Friend" },
];

const TABS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "addresses", label: "Saved Addresses", icon: MapPin },
  { id: "emergency", label: "Emergency Contacts", icon: ShieldAlert },
  { id: "preferences", label: "Ride Preferences", icon: Settings },
  { id: "notifications", label: "Notifications & Language", icon: Bell },
  { id: "security", label: "Account & Security", icon: Shield },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");

  // States for toggles
  const [prefAC, setPrefAC] = useState(true);
  const [prefQuiet, setPrefQuiet] = useState(false);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [language, setLanguage] = useState("English");

  // Handlers
  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">Personal Information</h2>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative group">
                <img src={MOCK_USER.photo} alt="Profile" className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-sm" />
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-gray-200 shadow-md text-gray-600 hover:text-[#2FCA71] transition">
                  <Camera size={16} />
                </button>
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1.5">Full Name</label>
                    <input type="text" defaultValue={MOCK_USER.name} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#2FCA71] focus:ring-1 focus:ring-[#2FCA71]" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1.5">Phone Number</label>
                    <input type="text" defaultValue={MOCK_USER.phone} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#2FCA71] focus:ring-1 focus:ring-[#2FCA71]" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1.5">Email Address</label>
                  <input type="email" defaultValue={MOCK_USER.email} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#2FCA71] focus:ring-1 focus:ring-[#2FCA71]" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={handleSave} className="bg-[#2FCA71] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#25A65B] transition shadow-lg shadow-[#2FCA71]/20">
                Save Changes
              </button>
            </div>
          </motion.div>
        );

      case "addresses":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
              <button className="text-sm font-semibold text-[#2FCA71] bg-[#2FCA71]/10 px-3 py-1.5 rounded-lg hover:bg-[#2FCA71]/20 transition flex items-center gap-1">
                <Plus size={16} /> Add New
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_ADDRESSES.map(addr => (
                <div key={addr.id} className="p-4 border border-gray-200 rounded-2xl flex items-start justify-between bg-white hover:border-gray-300 transition group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-50 text-gray-500 rounded-xl group-hover:bg-[#2FCA71]/10 group-hover:text-[#2FCA71] transition">
                      <addr.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{addr.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{addr.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-blue-500 transition"><Edit2 size={16} /></button>
                    <button className="p-1.5 text-gray-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case "emergency":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Emergency Contacts</h2>
                <p className="text-sm text-gray-500 mt-1">Add trusted contacts to share your ride status or alert in case of emergency.</p>
              </div>
              <button className="shrink-0 text-sm font-semibold text-[#2FCA71] bg-[#2FCA71]/10 px-3 py-1.5 rounded-lg hover:bg-[#2FCA71]/20 transition flex items-center gap-1">
                <Plus size={16} /> Add Contact
              </button>
            </div>

            <div className="space-y-4">
              {MOCK_CONTACTS.map(contact => (
                <div key={contact.id} className="p-4 border border-gray-200 rounded-2xl flex items-center justify-between bg-white">
                  <div>
                    <h4 className="font-bold text-gray-900">{contact.name} <span className="text-xs font-semibold text-white bg-gray-800 px-2 py-0.5 rounded ml-2 uppercase tracking-wide">{contact.relation}</span></h4>
                    <p className="text-sm text-gray-500 mt-1">{contact.phone}</p>
                  </div>
                  <div className="flex gap-4 items-center">
                    <button onClick={() => toast.success(`Simulating Trip Share with ${contact.name}`)} className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#2FCA71] hover:underline">
                      <Share2 size={14} /> Simulate Share Trip
                    </button>
                    <button className="p-2 text-gray-400 hover:bg-gray-50 hover:text-red-500 rounded-full transition"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case "preferences":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">Ride Preferences</h2>

            <div className="space-y-6">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                <div className="flex gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl h-fit"><Car size={20} /></div>
                  <div>
                    <h4 className="font-bold text-gray-900">AC / Cool Temperature</h4>
                    <p className="text-sm text-gray-500 mt-0.5 max-w-sm">Drivers will be notified to turn on Air Conditioning before picking you up.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={prefAC} onChange={() => setPrefAC(!prefAC)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2FCA71]"></div>
                </label>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                <div className="flex gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl h-fit"><Volume2 size={20} /></div>
                  <div>
                    <h4 className="font-bold text-gray-900">Quiet Ride</h4>
                    <p className="text-sm text-gray-500 mt-0.5 max-w-sm">Let drivers know you'd prefer to ride without conversation or radio playing.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={prefQuiet} onChange={() => setPrefQuiet(!prefQuiet)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2FCA71]"></div>
                </label>
              </div>
            </div>
          </motion.div>
        );

      case "notifications":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">Notifications & Language</h2>

            {/* Language Selection */}
            <div className="p-5 border border-gray-200 rounded-2xl bg-white space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Globe size={18} className="text-gray-500" /> App Language</h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full md:w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#2FCA71]"
              >
                <option value="English">English</option>
                <option value="Bengali">Bengali</option>
                <option value="Arabic">Arabic</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>

            {/* Notification Toggles */}
            <div className="p-5 border border-gray-200 rounded-2xl bg-white space-y-6">
              <h3 className="font-bold text-gray-800">Alert Preferences</h3>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-500">Receive alerts directly on your device regarding ride status.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" checked={notifPush} onChange={() => setNotifPush(!notifPush)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2FCA71]"></div>
                </label>
              </div>

              <div className="w-full h-px bg-gray-100" />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">SMS Alerts</h4>
                  <p className="text-sm text-gray-500">Get text messages when your driver arrives or delays occur.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" checked={notifSMS} onChange={() => setNotifSMS(!notifSMS)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2FCA71]"></div>
                </label>
              </div>

              <div className="w-full h-px bg-gray-100" />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Email Marketing & Offers</h4>
                  <p className="text-sm text-gray-500">Receive promotional codes, payment receipts, and platform updates.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" checked={notifEmail} onChange={() => setNotifEmail(!notifEmail)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2FCA71]"></div>
                </label>
              </div>

            </div>
          </motion.div>
        );

      case "security":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">Account & Security</h2>

            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gray-100 text-gray-600 rounded-xl group-hover:bg-[#2FCA71]/10 group-hover:text-[#2FCA71] transition"><KeySquare size={20} /></div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Change Password</h4>
                    <p className="text-xs text-gray-500">Secure your account with a strong password.</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-[#2FCA71] transition" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gray-100 text-gray-600 rounded-xl group-hover:bg-[#2FCA71]/10 group-hover:text-[#2FCA71] transition"><Shield size={20} /></div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Privacy Settings</h4>
                    <p className="text-xs text-gray-500">Manage what information is shared and tracked regarding your rides.</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-[#2FCA71] transition" />
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-4">
              <button onClick={() => toast("Signing out...")} className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold transition border border-gray-200">
                <LogOut size={18} /> Log Out
              </button>

              <button onClick={() => toast.error("Account Deletion requested.")} className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-xl font-bold transition border border-red-100">
                <AlertTriangle size={18} /> Delete Account
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile & Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account configurations, preferences, and personal information.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 relative items-start">

        {/* ===================== SIDEBAR NAVIGATION ===================== */}
        <div className="w-full lg:w-72 shrink-0 sticky top-24 z-10 space-y-2 bg-white/50 backdrop-blur-md lg:bg-transparent p-2 lg:p-0 rounded-2xl border border-gray-100 lg:border-none shadow-sm lg:shadow-none overflow-x-auto lg:overflow-visible flex lg:flex-col items-stretch">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all text-left whitespace-nowrap outline-none
                  ${isActive
                    ? "bg-[#2FCA71]/10 text-[#2FCA71] border border-[#2FCA71]/20 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"}
                `}
              >
                <Icon size={18} className={isActive ? "text-[#2FCA71]" : "text-gray-400"} />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ===================== CONTENT AREA ===================== */}
        <div className="flex-1 w-full bg-white rounded-[32px] border border-gray-200 shadow-sm p-6 md:p-8 min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}