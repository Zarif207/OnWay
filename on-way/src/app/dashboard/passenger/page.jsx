"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell, MapPin, ChevronRight, Car,
  Wallet, TicketPercent, CheckCircle2,
  XCircle, Clock, ArrowRight, Route,
  MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";

// --- MOCK DATA ---
const USER = {
  name: "Iftekhar",
  date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
  avatar: "https://ui-avatars.com/api/?name=Iftekhar+A&background=2FCA71&color=fff&size=128",
};

const STATS = [
  { label: "Total Rides", value: "42", icon: Car, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Completed", value: "38", icon: CheckCircle2, color: "text-[#2FCA71]", bg: "bg-[#2FCA71]/10" },
  { label: "Cancelled", value: "4", icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
  { label: "Distance", value: "342 km", icon: Route, color: "text-purple-500", bg: "bg-purple-50" },
];

const SCHEDULED_RIDES = [
  { id: 1, pickup: "Navana Tower, Gulshan Ave", dropoff: "Hazrat Shahjalal Int. Airport", date: "Tomorrow, 8:00 AM", vehicle: "Premium" },
];

const RECENT_RIDES = [
  { id: "RD-1042", pickup: "Banani Super Market", dropoff: "Dhanmondi Lake", date: "Mar 07, 2026", fare: 250, status: "Completed" },
  { id: "RD-1041", pickup: "Mirpur 10 Goalchattar", dropoff: "Motijheel Shapla Chottor", date: "Mar 05, 2026", fare: 420, status: "Completed" },
  { id: "RD-1040", pickup: "Gulshan 1 Circle", dropoff: "Banani", date: "Mar 01, 2026", fare: 0, status: "Cancelled" },
];

const StatusBadge = ({ status }) => {
  if (status === "Completed") return <span className="px-2.5 py-1 bg-[#2FCA71]/10 text-[#2FCA71] text-xs font-bold uppercase tracking-wider rounded-md">{status}</span>;
  if (status === "Cancelled") return <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider rounded-md">{status}</span>;
  return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-md">{status}</span>;
};


export default function PassengerDashboard() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 space-y-6 md:space-y-8">

      {/* ===================== SECTION 1: WELCOME HEADER ===================== */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <img src={USER.avatar} alt="Profile" className="w-16 h-16 rounded-full border-2 border-white shadow-sm" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Good afternoon, {USER.name} <span className="inline-block animate-wave origin-bottom-right">👋</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base font-medium">{USER.date}</p>
          </div>
        </div>
        <button className="p-3 bg-gray-50 text-gray-600 hover:text-[#2FCA71] hover:bg-[#2FCA71]/10 rounded-full transition relative">
          <Bell size={24} />
          <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* ===================== LEFT COLUMN (Core Actions & Stats) ===================== */}
        <div className="lg:col-span-2 space-y-6 text-gray-900">

          {/* SECTION 2: QUICK RIDE ACTION */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-[#2FCA71]/20 to-transparent rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition duration-700 pointer-events-none" />

            <h2 className="text-2xl font-bold text-gray-800 mb-6">Where do you want to go today?</h2>

            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:border-[#2FCA71] focus-within:ring-1 focus-within:ring-[#2FCA71] transition">
                <div className="p-2 bg-white text-gray-500 rounded-xl shadow-sm"><MapPin size={20} /></div>
                <input
                  type="text"
                  placeholder="Enter pickup location"
                  value={pickup} onChange={(e) => setPickup(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none px-2 font-medium placeholder:font-normal"
                />
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:border-[#2FCA71] focus-within:ring-1 focus-within:ring-[#2FCA71] transition">
                <div className="p-2 bg-white text-gray-500 rounded-xl shadow-sm"><MapPin size={20} className="text-[#2FCA71]" /></div>
                <input
                  type="text"
                  placeholder="Enter destination"
                  value={dropoff} onChange={(e) => setDropoff(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none px-2 font-medium placeholder:font-normal"
                />
              </div>

              <Link
                href="/dashboard/passenger/book-ride"
                className="mt-2 w-full bg-[#2FCA71] hover:bg-[#25A65B] text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#2FCA71]/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                Book Ride <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          {/* SECTION 3: RIDE SUMMARY STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group flex flex-col items-center text-center">
                <div className={`p-3 rounded-xl mb-3 ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</span>
                <span className="text-sm font-semibold text-gray-500 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* SECTION 5: RECENT RIDE ACTIVITY */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Rides</h2>
              <button className="text-sm font-bold text-[#2FCA71] hover:text-[#25A65B] flex items-center gap-1 transition">
                View All <ChevronRight size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {RECENT_RIDES.map((ride) => (
                <div key={ride.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-gray-400">{ride.id}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Clock size={12} /> {ride.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-800" />
                        <div className="w-0.5 h-6 bg-gray-300" />
                        <div className="w-2 h-2 rounded-sm bg-[#2FCA71]" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="font-bold text-gray-900 text-sm leading-none">{ride.pickup}</span>
                        <span className="font-bold text-gray-900 text-sm leading-none">{ride.dropoff}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 shrink-0">
                    <span className="font-extrabold text-gray-900 text-lg mb-0 md:mb-2 text-left md:text-right w-full md:w-auto">৳{ride.fare}</span>
                    <StatusBadge status={ride.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===================== RIGHT COLUMN (Widgets) ===================== */}
        <div className="lg:col-span-1 space-y-6">

          {/* SECTION 6: WALLET OVERVIEW */}
          <div className="bg-gray-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-gray-900/20">
            {/* Background design */}
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#2FCA71]/20 rounded-full blur-3xl" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2 text-gray-300 font-medium">
                <Wallet size={18} className="text-[#2FCA71]" /> Wallet Balance
              </div>
              <Link href="/dashboard/passenger/wallet" className="p-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition"><MoreHorizontal size={18} /></Link>
            </div>

            <div className="mb-6 relative z-10">
              <span className="text-4xl font-extrabold tracking-tight">৳1,250</span>
              <div className="text-sm text-gray-400 mt-1 font-medium bg-gray-800 inline-block px-2.5 py-1 rounded-md">Includes ৳350 Ride Credits</div>
            </div>

            <div className="flex gap-2 relative z-10">
              <Link href="/dashboard/passenger/wallet" className="flex-1 bg-[#2FCA71] hover:bg-[#25A65B] text-white text-center font-bold py-2.5 rounded-xl transition">
                Add Money
              </Link>
              <Link href="/dashboard/passenger/wallet" className="flex-1 bg-white hover:bg-gray-100 text-gray-900 text-center font-bold py-2.5 rounded-xl transition">
                History
              </Link>
            </div>
          </div>

          {/* SECTION 4: UPCOMING / SCHEDULED RIDES */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-[#2FCA71]" /> Scheduled
            </h2>

            {SCHEDULED_RIDES.length > 0 ? (
              <div className="space-y-4">
                {SCHEDULED_RIDES.map(ride => (
                  <div key={ride.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="font-bold text-[#2FCA71] mb-2">{ride.date}</div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {ride.pickup}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2FCA71]" /> {ride.dropoff}
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-white border border-gray-200 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition">View Details</button>
                      <button className="flex-1 bg-red-50 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-100 transition">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center border-dashed border-2">
                <span className="text-gray-400 font-medium">No upcoming rides scheduled.</span>
              </div>
            )}
          </div>

          {/* SECTION 7: PROMOTIONS / OFFERS */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-blue-600 text-white rounded-3xl p-6 border border-blue-500 shadow-xl shadow-blue-500/20 relative overflow-hidden"
          >
            <div className="absolute right-[-20px] top-[-20px] text-blue-500 opacity-50 rotate-12">
              <TicketPercent size={120} />
            </div>

            <div className="relative z-10">
              <span className="inline-block px-2.5 py-1 bg-white/20 rounded-md text-xs font-bold uppercase tracking-wider mb-3">Limited Offer</span>
              <h3 className="text-xl font-bold leading-tight mb-2">Get 20% off your next ride</h3>
              <p className="text-blue-100 text-sm mb-4 font-medium">Use code <span className="font-mono bg-white/20 px-1 py-0.5 rounded text-white">ONWAY20</span> at checkout</p>

              <Link href="/dashboard/passenger/wallet" className="w-full inline-block text-center bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition shadow-sm">
                Apply Promo
              </Link>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}