"use client";

import React, { useState } from "react";
import { Star, Car, DollarSign } from "lucide-react";

const Overview = () => {
  const [isOnline, setIsOnline] = useState(true);

  const recentRides = [
    { id: 1, passenger: "Sarah Johnson", fare: "$18.50", status: "Completed" },
    { id: 2, passenger: "Michael Chen", fare: "$22.00", status: "Completed" },
    { id: 3, passenger: "Emma Davis", fare: "$15.75", status: "Completed" },
  ];

  const ongoingRide = {
    passenger: "David Wilson",
    pickup: "Downtown Mall",
    dropoff: "Airport Terminal 2",
    fare: "$32.40",
  };

  return (
    <div className="min-h-screen bg-[var(--color-accent)] p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's your activity summary.
            </p>
          </div>

          {/* Online Toggle */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-6 py-2.5 rounded-xl font-semibold transition shadow-sm ${
              isOnline
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-400 text-white hover:bg-gray-500"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            icon={<DollarSign size={22} />}
            title="Today's Earnings"
            value="$124.80"
          />
          <StatCard
            icon={<DollarSign size={22} />}
            title="Total Earnings"
            value="$8,540.00"
          />
          <StatCard
            icon={<Car size={22} />}
            title="Completed Rides"
            value="342"
          />
          <StatCard
            icon={<Star size={22} />}
            title="Average Rating"
            value="4.9 ⭐"
          />
        </div>

        {/* Ongoing Ride */}
        {isOnline && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-10">
            <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-4">
              Ongoing Ride
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500 text-sm">Passenger</p>
                <p className="font-semibold text-lg">
                  {ongoingRide.passenger}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Estimated Fare</p>
                <p className="font-semibold text-lg">
                  {ongoingRide.fare}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Pickup Location</p>
                <p className="font-medium">
                  {ongoingRide.pickup}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Dropoff Location</p>
                <p className="font-medium">
                  {ongoingRide.dropoff}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg hover:opacity-90 transition">
                View Ride Details
              </button>
            </div>
          </div>
        )}

        {/* Recent Rides */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-6">
            Recent Rides
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Ride ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Passenger
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Fare
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRides.map((ride) => (
                  <tr
                    key={ride.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium">
                      #{ride.id}
                    </td>
                    <td className="px-6 py-4">
                      {ride.passenger}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {ride.fare}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-700 px-3 py-1 text-xs rounded-full font-medium">
                        {ride.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
    <div className="flex items-center gap-3 mb-3 text-[var(--color-primary)]">
      {icon}
      <p className="text-sm text-gray-500">{title}</p>
    </div>
    <h2 className="text-2xl font-bold text-[var(--color-primary)]">
      {value}
    </h2>
  </div>
);

export default Overview;