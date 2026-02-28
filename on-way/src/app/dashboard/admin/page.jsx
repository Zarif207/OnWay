"use client";
import React from "react";
import Link from "next/link";

const menuItems = [
  {
    title: "Manage Users",
    description: "View and manage all platform users.",
    path: "/dashboard/admin/users",
  },
  {
    title: "Manage Rides",
    description: "Monitor and control ride activities.",
    path: "/dashboard/admin/rides",
  },
  {
    title: "Reports",
    description: "View analytics and reports.",
    path: "/dashboard/admin/reports",
  },
];

const AdminDashboard = () => {
  return (
    <div className="h-screen mt-20 px-6">
      {/* Header */}
      <div>
        <h1 className="text-6xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage and monitor your entire platform from here.
        </p>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {menuItems.map((item, index) => (
          <Link key={index} href={item.path}>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 cursor-pointer border-l-4 border-orange-500">
              <h2 className="text-xl font-semibold text-gray-800">
                {item.title}
              </h2>
              <p className="text-gray-600 mt-2 text-sm">
                {item.description}
              </p>

              <div className="mt-4 text-orange-500 font-semibold">
                Open →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;