"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Clock, Wrench, ArrowLeft, Info, Search, X } from "lucide-react";

const supportCenters = [
  {
    name: "OnWay Tangail Support Center",
    address: "Zubaear's House, Tangail Sadar, Tangail 1900",
    phone: "+880 1700-000000",
    hours: "9:00 AM - 8:00 PM (7 days a week)",
    services: ["Account Issues", "Payment Problems", "Driver Registration", "Vehicle Inspection"],
  },
  {
    name: "OnWay Bogura Branch",
    address: "Minhajer's House, Bogura Sadar, Bogura 5800",
    phone: "+880 1700-000001",
    hours: "10:00 AM - 7:00 PM (Closed on Fridays)",
    services: ["General Support", "Lost & Found", "Complaint Resolution"],
  },
  {
    name: "OnWay Kishoreganj Office",
    address: "Zarif's House, Kishoreganj Sadar, Kishoreganj 2300",
    phone: "+880 1800-000000",
    hours: "9:00 AM - 6:00 PM (Closed on Fridays)",
    services: ["Driver Registration", "Account Support", "Payment Issues"],
  },
  {
    name: "OnWay Jamalpur Center",
    address: "Shourove's House, Jamalpur Sadar, Jamalpur 2000",
    phone: "+880 1800-000001",
    hours: "10:00 AM - 6:00 PM (Closed on Fridays)",
    services: ["General Support", "Driver Onboarding", "Account Issues"],
  },
  {
    name: "OnWay Chittagong Hub",
    address: "Ishteak's House, Chittagong Sadar, Chittagong 4000",
    phone: "+880 1900-000002",
    hours: "9:00 AM - 9:00 PM (7 days a week)",
    services: ["Account Issues", "Driver Registration", "Lost & Found", "Payment Problems", "App Technical Support"],
  },
];

const remoteOptions = [
  { icon: "💬", title: "Live Chat", desc: "Available 24/7 in the app" },
  { icon: "📧", title: "Email Support", desc: "support@onway.com" },
  { icon: "📞", title: "Phone Support", desc: "+880 1700-ONWAY" },
];

export default function WalkInSupportCenters() {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? supportCenters.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.address.toLowerCase().includes(query.toLowerCase()) ||
          c.services.some((s) => s.toLowerCase().includes(query.toLowerCase()))
      )
    : supportCenters;
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-secondary text-white py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #259461 0%, transparent 50%), radial-gradient(circle at 80% 20%, #2cbe6b 0%, transparent 40%)",
          }}
        />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Help Center
          </Link>
          <div className="w-16 h-16 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin size={32} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Walk-In Support Centers</h1>
          <p className="text-lg text-gray-300">Visit our physical locations for in-person assistance</p>
          <p className="text-sm text-gray-500 mt-2">Please bring a valid ID and any relevant documents</p>
          {/* Search */}
          <div className="relative max-w-2xl mx-auto mt-8">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city, service, or center name..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white/15 transition-all text-sm"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Info size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-secondary mb-2">Before You Visit</h3>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• Bring your government-issued ID</li>
              <li>• Have your OnWay account details ready</li>
              <li>• For driver registration, bring vehicle documents</li>
              <li>• Walk-ins are welcome, but appointments are recommended for faster service</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Centers Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-black text-secondary text-center mb-10 tracking-tight">Our Support Centers</h2>
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <p className="text-gray-400 text-sm">No centers found for &quot;{query}&quot;. Try searching by city or service.</p>
          </div>
        ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((center, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all overflow-hidden"
            >
              <div className="bg-secondary px-6 py-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-primary" />
                </div>
                <h3 className="text-white font-black text-base tracking-tight">{center.name}</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Address</p>
                    <p className="text-sm text-gray-700">{center.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                    <p className="text-sm text-gray-700">{center.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Hours</p>
                    <p className="text-sm text-gray-700">{center.hours}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Wrench size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Services</p>
                    <div className="flex flex-wrap gap-2">
                      {center.services.map((s, idx) => (
                        <span
                          key={idx}
                          className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="w-full mt-2 bg-secondary text-white py-3 rounded-xl text-sm font-bold hover:bg-primary transition-all active:scale-95">
                  Get Directions
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Remote Support */}
      <div className="bg-secondary py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
            {"Can't Visit in Person?"}
          </h2>
          <p className="text-gray-400 mb-10 text-sm">We offer multiple ways to get support</p>
          <div className="grid md:grid-cols-3 gap-6">
            {remoteOptions.map((opt, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="text-3xl mb-3">{opt.icon}</div>
                <h3 className="font-bold text-white mb-1">{opt.title}</h3>
                <p className="text-gray-400 text-sm">{opt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
