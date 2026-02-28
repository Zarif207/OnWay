import React from "react";
import { Search, Eye, MoreVertical } from "lucide-react";

const DriverManagement = () => {
  const drivers = [
    {
      id: "D001",
      name: "Robert Martinez",
      phone: "+1234567800",
      vehicle: "Toyota Camry 2022",
      plate: "ABC-1234",
      type: "Sedan",
      rides: 234,
      earnings: 4580.5,
      rating: 4.9,
      status: "Online",
    },
    {
      id: "D002",
      name: "Linda Thompson",
      phone: "+1234567801",
      vehicle: "Honda CR-V 2023",
      plate: "XYZ-5678",
      type: "SUV",
      rides: 198,
      earnings: 5230.75,
      rating: 4.8,
      status: "Online",
    },
    {
      id: "D003",
      name: "David Garcia",
      phone: "+1234567802",
      vehicle: "Honda CBR 2021",
      plate: "MNO-9012",
      type: "Bike",
      rides: 156,
      earnings: 3420.25,
      rating: 4.7,
      status: "Offline",
    },
    {
      id: "D004",
      name: "Patricia Lee",
      phone: "+1234567803",
      vehicle: "Hyundai Elantra 2022",
      plate: "DEF-3456",
      type: "Sedan",
      rides: 167,
      earnings: 3890.0,
      rating: 4.6,
      status: "Online",
    },
  ];

  const getStatusStyle = (status) => {
    if (status === "Online") return "bg-green-100 text-green-700";
    if (status === "Offline") return "bg-gray-200 text-gray-700";
    return "bg-primary text-primary";
  };

  return (
    <div className="min-h-screen bg-[var(--color-accent)] px-6 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">
              Driver Management
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage all registered drivers
            </p>
          </div>

          <button className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg hover:opacity-90 transition">
            Add New Driver
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Total Drivers</p>
            <h2 className="text-3xl font-bold text-[var(--color-primary)] mt-2">
              4
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Online Now</p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              3
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Total Earnings</p>
            <h2 className="text-3xl font-bold text-[var(--color-primary)] mt-2">
              $17,121.50
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search drivers..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <select className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]">
            <option>All Vehicles</option>
            <option>Sedan</option>
            <option>SUV</option>
            <option>Bike</option>
          </select>

          <select className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]">
            <option>All Status</option>
            <option>Online</option>
            <option>Offline</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">

              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Driver</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Vehicle</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rides</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Earnings</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>

              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id} className="border-b hover:bg-gray-50 transition">

                    <td className="px-6 py-4">
                      <p className="font-semibold text-[var(--color-primary)]">
                        {driver.name}
                      </p>
                      <p className="text-xs text-gray-500">{driver.phone}</p>
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      <p>{driver.vehicle}</p>
                      <p className="text-xs text-gray-500">
                        {driver.plate} • {driver.type}
                      </p>
                    </td>

                    <td className="px-6 py-4 font-medium">
                      {driver.rides}
                    </td>

                    <td className="px-6 py-4 text-green-600 font-semibold">
                      ${driver.earnings.toFixed(2)}
                    </td>

                    <td className="px-6 py-4 text-primary font-semibold">
                      ★ {driver.rating}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusStyle(driver.status)}`}>
                        {driver.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <Eye className="w-4 h-4 text-gray-600" />
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
        </div>

      </div>
    </div>
  );
};

export default DriverManagement;