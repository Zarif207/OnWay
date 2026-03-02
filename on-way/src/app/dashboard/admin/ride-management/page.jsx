import React from "react";
import { Search, Download } from "lucide-react";

const RideManagement = () => {
  const rides = [
    {
      id: "R001",
      passenger: "Sarah Johnson",
      passengerId: "U001",
      driver: "Robert Martinez",
      driverId: "D001",
      routeFrom: "123 Main St, Downtown",
      routeTo: "456 Oak Ave, Westside",
      distance: "5.2 km",
      fare: 12.5,
      status: "completed",
    },
    {
      id: "R002",
      passenger: "Michael Chen",
      passengerId: "U002",
      driver: "Linda Thompson",
      driverId: "D002",
      routeFrom: "789 Pine Rd, Northside",
      routeTo: "321 Elm St, Southside",
      distance: "8.7 km",
      fare: 18.75,
      status: "ongoing",
    },
    {
      id: "R003",
      passenger: "Emma Davis",
      passengerId: "U003",
      driver: "Not assigned",
      driverId: "",
      routeFrom: "555 Cedar Ln, Eastside",
      routeTo: "777 Maple Dr, Central",
      distance: "3.5 km",
      fare: 9.5,
      status: "pending",
    },
    {
      id: "R004",
      passenger: "Sarah Johnson",
      passengerId: "U001",
      driver: "David Garcia",
      driverId: "D003",
      routeFrom: "888 Birch St, Midtown",
      routeTo: "999 Spruce Ave, Uptown",
      distance: "6.3 km",
      fare: 14.25,
      status: "completed",
    },
    {
      id: "R005",
      passenger: "James Wilson",
      passengerId: "U004",
      driver: "Patricia Lee",
      driverId: "D004",
      routeFrom: "222 Walnut Blvd, Harbor",
      routeTo: "444 Chestnut Ct, Heights",
      distance: "10.1 km",
      fare: 22.0,
      status: "completed",
    },
  ];

  const getStatusStyle = (status) => {
    if (status === "completed")
      return "bg-green-100 text-green-700";
    if (status === "ongoing")
      return "bg-blue-100 text-blue-700";
    if (status === "pending")
      return "bg-primary text-primary";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] px-6 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">
              Ride History
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage all ride requests
            </p>
          </div>

          <button className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg hover:opacity-90 transition">
            <Download size={18} />
            Export Data
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Rides" value="5" />
          <StatCard title="Completed" value="3" color="text-green-600" />
          <StatCard title="Ongoing" value="1" color="text-blue-600" />
          <StatCard title="Pending" value="1" color="text-primary" />
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search rides..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <select className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]">
            <option>All Status</option>
            <option>Completed</option>
            <option>Ongoing</option>
            <option>Pending</option>
          </select>

          <input
            type="date"
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">

              <thead className="bg-gray-100">
                <tr>
                  {["Ride ID","Passenger","Driver","Route","Distance","Fare","Status"].map((head) => (
                    <th key={head} className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rides.map((ride) => (
                  <tr key={ride.id} className="border-b hover:bg-gray-50 transition">

                    <td className="px-6 py-4 font-medium">{ride.id}</td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-[var(--color-primary)]">
                        {ride.passenger}
                      </p>
                      <p className="text-xs text-gray-500">{ride.passengerId}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-[var(--color-primary)]">
                        {ride.driver}
                      </p>
                      {ride.driverId && (
                        <p className="text-xs text-gray-500">{ride.driverId}</p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      <p>{ride.routeFrom}</p>
                      <p className="text-sm text-gray-500">
                        → {ride.routeTo}
                      </p>
                    </td>

                    <td className="px-6 py-4">{ride.distance}</td>

                    <td className="px-6 py-4 text-green-600 font-semibold">
                      ${ride.fare.toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium capitalize ${getStatusStyle(ride.status)}`}>
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

const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <p className="text-gray-500 text-sm">{title}</p>
    <h2 className={`text-3xl font-bold mt-2 ${color || "text-[var(--color-primary)]"}`}>
      {value}
    </h2>
  </div>
);

export default RideManagement;