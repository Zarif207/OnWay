"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, Car, DollarSign, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import React, { useState } from "react";
import { Star, Car, DollarSign } from "lucide-react";

const Overview = ({ riderId = "driver_345678" }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    totalEarnings: 0,
    completedRides: 0,
    avgRating: 0,
  });
  const [recentRides, setRecentRides] = useState([]);
  const [ongoingRide, setOngoingRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriverDashboard = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        const ridesRes = await axios.get(
          `${apiUrl}/rides/driver/${riderId}`
        );

        const ratingRes = await axios.get(
          `${apiUrl}/reviews/driver/${riderId}/rating`
        );

        const allRides = ridesRes.data.data || [];

        const avgRating =
          ratingRes.data.averageRating || 0;

        const todayStr = new Date().toISOString().split("T")[0];

        let todayE = 0;
        let totalE = 0;
        let completedCount = 0;
        let currentOngoing = null;

        allRides.forEach((ride) => {
          const fare = parseFloat(ride.fare) || 0;

          if (ride.status === "completed") {
            completedCount++;
            totalE += fare;

            if (
              ride.createdAt &&
              ride.createdAt.startsWith(todayStr)
            ) {
              todayE += fare;
            }
          }

          if (["ongoing", "pending"].includes(ride.status)) {
            currentOngoing = ride;
          }
        });

        setStats({
          todayEarnings: todayE.toFixed(2),
          totalEarnings: totalE.toFixed(2),
          completedRides: completedCount,
          avgRating: Number(avgRating).toFixed(1),
        });

        setRecentRides(allRides.slice(0, 5));
        setOngoingRide(currentOngoing);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDriverDashboard();
  }, [riderId]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#011421]">Driver Overview</h1>
            <p className="text-gray-600 mt-1">Activity summary for Rider ID: {riderId}</p>
          </div>

          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-6 py-2.5 rounded-xl font-semibold transition shadow-sm ${isOnline ? "bg-green-500 text-white" : "bg-gray-400 text-white"
              }`}
          >
            {isOnline ? "Online" : "Offline"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<DollarSign size={22} />} title="Today's Earnings" value={`$${stats.todayEarnings}`} />
          <StatCard icon={<DollarSign size={22} />} title="Total Earnings" value={`$${stats.totalEarnings}`} />
          <StatCard icon={<Car size={22} />} title="Completed Rides" value={stats.completedRides} />
          <StatCard icon={<Star size={22} />} title="Avg Rating" value={`${stats.avgRating} ⭐`} />
        </div>

        {ongoingRide ? (
          <div className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-500 p-6 mb-10">
            <h2 className="text-xl font-semibold text-[#011421] mb-4">Ongoing Ride</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500 text-sm">Pickup</p>
                <p className="font-medium text-blue-700">{ongoingRide.pickupLocation || ongoingRide.pickup}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Drop-off</p>
                <p className="font-medium text-blue-700">{ongoingRide.dropLocation || ongoingRide.dropoff}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 mb-10 text-center text-gray-400 border-dashed border-2 border-gray-200">
            No active rides right now.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-[#011421]">Recent Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Passenger</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Fare</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentRides.length > 0 ? recentRides.map((ride) => (
                  <tr key={ride._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-mono">#{ride._id.slice(-5)}</td>
                    <td className="px-6 py-4 text-sm">{ride.passengerName || ride.email || "Guest"}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">${ride.fare}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${ride.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {ride.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="p-10 text-center text-gray-400">No ride history found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
    <div className="flex items-center gap-3 mb-3 text-blue-600">
      {icon}
      <p className="text-sm text-gray-500 font-medium">{title}</p>
    </div>
    <h2 className="text-2xl font-bold text-[#011421]">{value}</h2>
  </div>
);

export default Overview;