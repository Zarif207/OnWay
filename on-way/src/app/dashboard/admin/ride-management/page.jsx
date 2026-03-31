"use client";

import React, { useState, useEffect } from "react";
import { Search, Download, Loader2, Trash2, Eye, MapPin } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { Button } from "@/app/root-components/Button";
import OnWayLoading from "@/app/components/Loading/page";

const RideManagement = () => {
  const [bookings, setBookings] = useState([]);
  console.log("State Data", bookings);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rideManagementPage = 10;

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/bookings`;

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log("Fetching from:", API_URL);

      const response = await axios.get(API_URL, {
        timeout: 10000, // 10 second timeout
      });

      console.log("Response received:", response.data);

      if (response.data.success) {
        setBookings(response.data.data);
        console.log("Bookings set:", response.data.data);
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);

      // Only show error if it's not an abort error
      if (error.code !== 'ERR_CANCELED') {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to fetch bookings data. Make sure backend is running on port 4000.",
          footer: `<small>API URL: ${API_URL}</small>`
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Use AbortController to prevent double-fetch in React Strict Mode
    const controller = new AbortController();

    const loadBookings = async () => {
      try {
        setLoading(true);
        console.log("Fetching from:", API_URL);

        const response = await axios.get(API_URL, {
          timeout: 10000,
          signal: controller.signal,
        });

        console.log("Response received:", response.data);

        if (response.data.success) {
          setBookings(response.data.data);
          console.log("Bookings set:", response.data.data);
        }
      } catch (error) {
        // Ignore abort errors (from React Strict Mode double render)
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
          console.log("Request was cancelled (likely due to React Strict Mode)");
          return;
        }

        console.error("Fetch bookings error:", error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to fetch bookings data. Make sure backend is running on port 4000.",
          footer: `<small>API URL: ${API_URL}</small>`
        });
      } finally {
        setLoading(false);
      }
    };

    loadBookings();

    // Cleanup function to abort request if component unmounts
    return () => {
      controller.abort();
    };
  }, []);

  // Delete single booking
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2FCA71",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${API_URL}/${id}`);
        if (res.data.success) {
          setBookings(bookings.filter((b) => b._id !== id));
          Swal.fire("Deleted!", "Booking has been removed.", "success");
        }
      } catch (err) {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  // Bulk delete bookings
  const handleBulkDelete = async () => {
    if (selectedBookings.length === 0) {
      return Swal.fire("Wait", "Please select bookings first", "info");
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete ${selectedBookings.length} selected bookings?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete all!",
    });

    if (result.isConfirmed) {
      try {
        await axios.post(`${API_URL}/bulk-delete`, { ids: selectedBookings });
        setBookings(bookings.filter((b) => !selectedBookings.includes(b._id)));
        setSelectedBookings([]);
        Swal.fire("Deleted!", "Selected bookings removed.", "success");
      } catch (err) {
        Swal.fire("Error", "Bulk delete failed", "error");
      }
    }
  };

  // Update booking status
  const handleUpdateStatus = async (id, currentStatus) => {
    const { value: newStatus } = await Swal.fire({
      title: "Update Booking Status",
      input: "select",
      inputOptions: {
        pending: "Pending",
        confirmed: "Confirmed",
        ongoing: "Ongoing",
        completed: "Completed",
        cancelled: "Cancelled",
      },
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonColor: "#2FCA71",
      inputValidator: (value) => {
        if (!value) {
          return "You need to select a status!";
        }
      },
    });

    if (newStatus) {
      try {
        await axios.patch(`${API_URL}/${id}`, { bookingStatus: newStatus });
        setBookings(
          bookings.map((b) =>
            b._id === id ? { ...b, bookingStatus: newStatus } : b
          )
        );
        Swal.fire("Updated!", "Booking status has been updated.", "success");
      } catch (err) {
        Swal.fire("Error", "Status update failed", "error");
      }
    }
  };

  // View booking details
  const handleViewDetails = (booking) => {
    Swal.fire({
      title: "Booking Details",
      html: `
        <div style="text-align: left; padding: 10px;">
          <p><strong>Booking ID:</strong> ${booking._id}</p>
          <p><strong>Pickup:</strong> ${booking.pickupLocation?.address || "N/A"}</p>
          <p><strong>Dropoff:</strong> ${booking.dropoffLocation?.address || "N/A"}</p>
          <p><strong>Distance:</strong> ${(booking.distance / 1000).toFixed(2)} km</p>
          <p><strong>Duration:</strong> ${Math.round(booking.duration / 60)} min</p>
          <p><strong>Price:</strong> $${booking.price?.toFixed(2) || "0.00"}</p>
          <p><strong>Status:</strong> ${booking.bookingStatus}</p>
          <p><strong>Passenger ID:</strong> ${booking.passengerId || "N/A"}</p>
          <p><strong>Created:</strong> ${new Date(booking.createdAt).toLocaleString()}</p>
        </div>
      `,
      confirmButtonColor: "#2FCA71",
    });
  };

  // Export data to CSV
  const handleExportData = () => {
    if (bookings.length === 0) {
      return Swal.fire("No Data", "No bookings to export", "info");
    }

    const csvContent = [
      ["ID", "Pickup", "Dropoff", "Distance (km)", "Duration (min)", "Price", "Status", "Created"],
      ...bookings.map((b) => [
        b._id,
        b.pickupLocation?.address || "N/A",
        b.dropoffLocation?.address || "N/A",
        (b.distance / 1000).toFixed(2),
        Math.round(b.duration / 60),
        b.price?.toFixed(2) || "0.00",
        b.bookingStatus,
        new Date(b.createdAt).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Checkbox handlers
  const toggleSelectBooking = (id) => {
    setSelectedBookings((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedBookings(filteredBookings.map((b) => b._id));
    } else {
      setSelectedBookings([]);
    }
  };

  // Filter bookings
  const getLocationString = (loc) => {
    if (!loc) return "";
    if (typeof loc === "string") return loc;
    return loc.name || loc.address?.road || loc.address?.suburb || loc.address?.city || "";
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLocationString(booking.pickupLocation).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLocationString(booking.dropoffLocation).toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passengerId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || booking.bookingStatus === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });
  console.log("filter  booking.pickupLocation", filteredBookings);
  // Calculate stats
  const stats = {
    total: bookings.length,
    completed: bookings.filter((b) => b.bookingStatus === "completed").length,
    ongoing: bookings.filter((b) => b.bookingStatus === "ongoing").length,
    pending: bookings.filter((b) => b.bookingStatus === "pending").length,
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "ongoing":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-purple-100 text-purple-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };
  // Pagination logic
  const itemsPerPage = rideManagementPage;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  if (loading) {
    return (
      <OnWayLoading></OnWayLoading>

    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">
              Ride Management
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage all ride bookings
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              className={`w-full md:w-auto ${selectedBookings.length > 0 ? "border-red-500 text-red-500" : ""
                }`}
              onClick={handleBulkDelete}
            >
              {selectedBookings.length > 0
                ? `Delete (${selectedBookings.length})`
                : "Bulk Actions"}
            </Button>
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg hover:opacity-90 transition"
            >
              <Download size={18} />
              Export Data
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Rides" value={stats.total} />
          <StatCard
            title="Completed"
            value={stats.completed}
            color="text-green-600"
          />
          <StatCard title="Ongoing" value={stats.ongoing} color="text-blue-600" />
          <StatCard title="Pending" value={stats.pending} color="text-yellow-600" />
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by ID, location, passenger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Ongoing</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>

            <Button variant="outline" onClick={fetchBookings}>
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 flex justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-20 text-center text-gray-500">
              <p className="text-lg font-semibold mb-2">No bookings found</p>
              <p className="text-sm">
                {bookings.length === 0
                  ? "No bookings have been created yet"
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          selectedBookings.length === filteredBookings.length &&
                          filteredBookings.length > 0
                        }
                      />
                    </th>
                    {[
                      "Booking ID",
                      "Pickup Location",
                      "Dropoff Location",
                      "Distance",
                      "Duration",
                      "Price",
                      "Status",
                      "Actions",
                    ].map((head) => (
                      <th
                        key={head}
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {currentBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className={`border-b hover:bg-gray-50 transition ${selectedBookings.includes(booking._id) ? "bg-green-50" : ""
                        }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking._id)}
                          onChange={() => toggleSelectBooking(booking._id)}
                        />
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {booking._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {booking.pickupLocation?.name || "N/A"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {booking.dropoffLocation?.name || "N/A"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {(booking.distance).toFixed(2)} km
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {Math.round(booking.duration / 60)} hr
                      </td>

                      <td className="px-6 py-4 text-green-600 font-semibold">
                        ৳ {booking.price?.toFixed(2) || "0.00"}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleUpdateStatus(booking._id, booking.bookingStatus)
                          }
                          className="w-full"
                        >
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium capitalize ${getStatusStyle(
                              booking.bookingStatus
                            )}`}
                          >
                            {booking.bookingStatus}
                          </span>
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="p-2 hover:bg-blue-50 rounded-lg group"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                          </button>

                          <button
                            onClick={() => handleDelete(booking._id)}
                            className="p-2 hover:bg-red-50 rounded-lg group"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-end mt-8">
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-2xl">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-gray-500 font-medium rounded-xl hover:bg-gray-200 disabled:opacity-40 flex items-center gap-1"
            >
              ‹ Prev
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl font-semibold transition-all
                            ${currentPage === i + 1
                  ? "bg-green-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-white bg-green-500 rounded-xl font-medium hover:bg-green-600 disabled:opacity-40 flex items-center gap-1"
            >
              Next ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <p className="text-gray-500 text-sm">{title}</p>
    <h2
      className={`text-3xl font-bold mt-2 ${color || "text-[var(--color-primary)]"
        }`}
    >
      {value}
    </h2>
  </div>
);

export default RideManagement;
