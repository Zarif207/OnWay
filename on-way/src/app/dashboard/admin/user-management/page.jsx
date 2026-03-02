import React from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Ban,
} from 'lucide-react';

import { mockUsers } from '../../../../data/mockData.js';
import { Button } from '../../../../app/root-components/Button'; // adjust if needed

const UserManagement = () => {

  const getStatusStyle = (status) => {
    if (status === 'Active') {
      return 'bg-green-100 text-green-700';
    }
    if (status === 'Suspended') {
      return 'bg-red-100 text-red-700';
    }
    if (status === 'Inactive') {
      return 'bg-gray-200 text-gray-700';
    }
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2FCA71]">
              User Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Complete passenger account control
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" className="w-full md:w-auto">
              Bulk Actions
            </Button>
            <Button variant="primary" className="w-full md:w-auto">
              Add New User
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <select className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Suspended</option>
            </select>

            <Button variant="outline" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>

          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">

              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Rides</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Rating</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>

              <tbody>
                {mockUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-gray-600">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {user.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-sm">
                      <p className="text-gray-800">{user.email}</p>
                      <p className="text-gray-500">{user.phone}</p>
                    </td>

                    <td className="py-4 px-4 font-semibold text-gray-800">
                      {user.totalRides}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-primary">★</span>
                        <span className="font-semibold text-gray-800">
                          {user.rating}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <Ban className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-white">
            <p className="text-sm text-gray-600 text-center sm:text-left">
              Showing 1 to {mockUsers.length} of {mockUsers.length} users
            </p>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="primary" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default UserManagement;