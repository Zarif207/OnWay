"use client";

import React from 'react';
import { StatCard } from '@/components/dashboard/DashboardUi';
import { Activity, History, Wallet, User } from 'lucide-react';
import { useRequireRole } from '@/hooks/useAuth';

const RiderDashboard = () => {
  // ✅ Protect this page - only riders can access
  const { user, isLoading } = useRequireRole("rider");

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
    { label: "Active Ride", value: "Toyota Camry", icon: Activity, percentage: 100, trend: "up", color: "bg-blue-600 text-blue-600" },
    { label: "Today's Earnings", value: "$120.50", icon: Wallet, percentage: 15, trend: "up", color: "bg-green-600 text-green-600" },
    { label: "Trips Today", value: "8", icon: History, percentage: 5, trend: "down", color: "bg-orange-600 text-orange-600" },
    { label: "Rating", value: "4.9", icon: User, percentage: 2, trend: "up", color: "bg-yellow-600 text-yellow-600" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-50">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Welcome back, Driver!</h3>
        <p className="text-gray-500">You are currently online. Stay safe on the road.</p>
      </div>
    </div>
  );
};

export default RiderDashboard;