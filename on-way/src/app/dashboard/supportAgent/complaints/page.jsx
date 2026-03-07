"use client";
import React, { useState } from "react";
import { FileText, Search, Filter, Eye, CheckCircle, XCircle } from "lucide-react";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([
    { id: 1, user: "John Doe", type: "Driver Behavior", status: "Pending", date: "2024-03-08", priority: "High" },
    { id: 2, user: "Jane Smith", type: "Payment Issue", status: "In Progress", date: "2024-03-07", priority: "Medium" },
    { id: 3, user: "Mike Johnson", type: "Route Problem", status: "Resolved", date: "2024-03-06", priority: "Low" },
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#2FCA71] flex items-center gap-2">
          <FileText />
          Complaints Management
        </h1>
        <p className="text-gray-600 mt-2">Handle and resolve user complaints</p>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search complaints..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FCA71]"
            />
          </div>
          <button className="px-4 py-2 bg-[#2FCA71] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Filter size={20} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">#{complaint.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{complaint.user}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{complaint.type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      complaint.priority === "High" ? "bg-red-100 text-red-700" :
                      complaint.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      complaint.status === "Resolved" ? "bg-green-100 text-green-700" :
                      complaint.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{complaint.date}</td>
                  <td className="px-4 py-3">
                    <button className="text-[#2FCA71] hover:text-[#28b863] mr-2">
                      <Eye size={18} />
                    </button>
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
