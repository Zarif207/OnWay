"use client";
import React, { useState } from "react";
import { Shield, Search, CheckCircle, XCircle, Eye, FileText } from "lucide-react";

export default function VerificationPage() {
  const [verifications, setVerifications] = useState([
    { id: 1, user: "David Lee", type: "Driver License", status: "Pending", date: "2024-03-08", documents: 2 },
    { id: 2, user: "Maria Garcia", type: "Vehicle Registration", status: "Approved", date: "2024-03-07", documents: 3 },
    { id: 3, user: "Chris Taylor", type: "Insurance", status: "Rejected", date: "2024-03-06", documents: 1 },
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="text-green-500" />
          Document Verification
        </h1>
        <p className="text-gray-600 mt-2">Review and verify user documents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-semibold">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-700">8</p>
            </div>
            <FileText className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-semibold">Verified</p>
              <p className="text-2xl font-bold text-green-700">45</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-semibold">Rejected</p>
              <p className="text-2xl font-bold text-red-700">7</p>
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
              placeholder="Search verifications..."
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Documents</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {verifications.map((verification) => (
                <tr key={verification.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">#{verification.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{verification.user}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{verification.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{verification.documents} files</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      verification.status === "Approved" ? "bg-green-100 text-green-700" :
                      verification.status === "Rejected" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {verification.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{verification.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-blue-500 hover:text-blue-700">
                        <Eye size={18} />
                      </button>
                      {verification.status === "Pending" && (
                        <>
                          <button className="text-green-500 hover:text-green-700">
                            <CheckCircle size={18} />
                          </button>
                          <button className="text-red-500 hover:text-red-700">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
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
