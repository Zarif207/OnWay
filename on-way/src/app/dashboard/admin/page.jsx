"use client";
import React from "react";
import { Users, Car, MapPin, BarChart3, Star, Map as MapIcon } from "lucide-react";
import { StatCard, ActivityPanel } from "@/components/dashboard/DashboardUi";
import { useRequireRole } from "@/hooks/useAuth";

const AdminDashboard = () => {
  // ✅ Protect this page - only admins can access
  const { user, isLoading } = useRequireRole("admin");

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  const stats = [
    { label: "Customers", value: "$50,101", icon: Users, percentage: 20, trend: "up", color: "bg-blue-600 text-blue-600" },
    { label: "Booking", value: "92 /100", icon: Car, percentage: 11, trend: "up", color: "bg-orange-600 text-orange-600" },
    { label: "Trips", value: "1540 /1800", icon: MapPin, percentage: 11, trend: "up", color: "bg-green-600 text-green-600" },
    { label: "Car owners", value: "20", icon: Star, percentage: 23, trend: "up", color: "bg-yellow-600 text-yellow-600" },
  ];

  const recentRides = [
    { id: "01", car: "G48C", driver: "Alex", location: "Mumbai", booking: "$450", status: "Completed", rating: 4.8 },
    { id: "02", car: "E32S", driver: "Pia", location: "Mumbai", booking: "$521", status: "Ongoing", rating: 4.2 },
    { id: "03", car: "O95X", driver: "Ryan", location: "Ahmedabad", booking: "$210", status: "Completed", rating: 4.5 },
    { id: "04", car: "Z22L", driver: "Nohan", location: "Mumbai", booking: "$332", status: "Pending", rating: 4.0 },
    { id: "05", car: "B18K", driver: "Sam", location: "Pune", booking: "$580", status: "Completed", rating: 4.7 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Car Booking List & Table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-50">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Car-Booking List</h3>
                <p className="text-xs text-gray-400 font-medium">Today and yesterday lists 186/32770</p>
              </div>
              <button className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
                Location
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-50/50 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-500" />
                <img 
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800" 
                  alt="Car" 
                  className="relative z-10 w-full h-auto rounded-3xl shadow-lg group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Active Now</span>
                  <p className="text-xs font-bold text-gray-900">Porsche 911 GT3</p>
                </div>
              </div>
              
              <div className="bg-gray-50/50 rounded-3xl p-6 h-full overflow-hidden relative">
                <div className="absolute inset-0 opacity-20 hover:opacity-100 transition-opacity">
                   {/* Simplified Map Replacement */}
                   <div className="w-full h-full bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s+ff4444(72.57,23.02)/72.57,23.02,12/400x300?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJleGFtcGxlIn0=')] bg-cover bg-center" />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm self-start px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
                    <MapPin size={12} className="text-blue-600" />
                    <span className="text-[10px] font-bold text-gray-900 tracking-tight">Mumbai, Maharashtra</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-4xl shadow-sm border border-gray-50 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Rides Booking</h3>
              <select className="bg-gray-100/50 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border-none focus:ring-0 outline-none">
                <option>Calendar</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">No.</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Car No.</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Driver</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booking</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentRides.map((ride, i) => (
                    <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-4 text-xs font-bold text-gray-400">{ride.id}</td>
                      <td className="px-8 py-4 text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercaseTracking-tight">{ride.car}</td>
                      <td className="px-8 py-4 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                          <img src={`https://i.pravatar.cc/150?u=${ride.driver}`} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-gray-900">{ride.driver}</span>
                      </td>
                      <td className="px-8 py-4 text-xs font-medium text-gray-500">{ride.location}</td>
                      <td className="px-8 py-4 text-xs font-bold text-gray-900">{ride.booking}</td>
                      <td className="px-8 py-4">
                        <div className={`w-2 h-2 rounded-full mx-auto ${
                          ride.status === 'Completed' ? 'bg-green-500' : 
                          ride.status === 'Ongoing' ? 'bg-blue-500' : 'bg-orange-500'
                        }`} />
                      </td>
                      <td className="px-8 py-4 text-center text-xs font-bold text-gray-400">{ride.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Actives */}
        <div className="lg:col-span-1 h-full">
          <ActivityPanel />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;