"use client";
import React from "react";
import Link from "next/link";

const AdminDashboard = () => {
  const menuItems = [
    {
      title: "Dashboard Overview",
      description: "View platform performance and statistics",
      path: "/dashboard/admin/dashboard-overview",
    },
    {
      title: "Driver Management",
      description: "Manage drivers and approvals",
      path: "/dashboard/admin/driver-management",
    },
    {
      title: "Ride Management",
      description: "Monitor and manage rides",
      path: "/dashboard/admin/ride-management",
    },
    {
      title: "User Management",
      description: "Manage users and accounts",
      path: "/dashboard/admin/user-management",
    },
    {
      title: "Promo Codes",
      description: "Create and manage discounts",
      path: "/dashboard/admin/promo-codes",
    },
    {
      title: "Reports & Safety",
      description: "Analytics, SOS monitoring and logs",
      path: "/dashboard/admin/reports-safety",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor your entire platform from here.
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
};

export default AdminDashboard;