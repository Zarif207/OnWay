"use client";
import React, { useState } from "react";
import { DollarSign, Search, CheckCircle, XCircle, Clock } from "lucide-react";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([
    { id: 1, user: "Emma Davis", amount: "$25.50", reason: "Cancelled Ride", status: "Pending", date: "2024-03-08" },
    { id: 2, user: "James Wilson", amount: "$18.00", reason: "Overcharged", status: "Approved", date: "2024-03-07" },
    { id: 3, user: "Lisa Anderson", amount: "$32.75", reason: "Driver No-Show", status: "Rejected", date: "2024-03-06" },
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <DollarSign className="text-green-500" />
          Refund Management
        </h1>
        <p className="text-gray-600 mt-2">Process and manage refund requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-semibold">Pending</p>
              <p className="text-2xl font-bold text-yellow-700">5</p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-semibold">Approved</p>
              <p className="text-2xl font-bold text-green-700">12</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-semibold">Rejected</p>
              <p className="text-2xl font-bold text-red-700">3</p>
            </div>
            <XCircle className="text-red-500" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search refunds..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reason</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {refunds.map((refund) => (
                <tr key={refund.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">#{refund.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{refund.user}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">{refund.amount}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{refund.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      refund.status === "Approved" ? "bg-green-100 text-green-700" :
                      refund.status === "Rejected" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {refund.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{refund.date}</td>
                  <td className="px-4 py-3">
                    {refund.status === "Pending" && (
                      <div className="flex gap-2">
                        <button className="text-green-500 hover:text-green-700">
                          <CheckCircle size={18} />
                        </button>
                        <button className="text-red-500 hover:text-red-700">
                          <XCircle size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
