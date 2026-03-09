"use client";
import React, { useState, useEffect } from "react";
import { FileText, Search, Filter, Eye, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const complaintsPerPage = 10;

  // Fetch complaints from backend
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/support-agent/complaints`);
      const data = await response.json();
      
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || complaint.status === filterStatus;
    const matchesPriority = filterPriority === "All" || complaint.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / complaintsPerPage);
  const indexOfLastComplaint = currentPage * complaintsPerPage;
  const indexOfFirstComplaint = indexOfLastComplaint - complaintsPerPage;
  const currentComplaints = filteredComplaints.slice(indexOfFirstComplaint, indexOfLastComplaint);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Update complaint status
  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/support-agent/complaints/${complaintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        fetchComplaints();
      }
    } catch (error) {
      console.error("Error updating complaint:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2FCA71] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2FCA71] flex items-center gap-2">
            <FileText />
            Complaints Management
          </h1>
          <p className="text-gray-600 mt-2">Handle and resolve user complaints</p>
        </div>
        <button 
          onClick={fetchComplaints}
          className="px-4 py-2 bg-[#2FCA71] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 backdrop-blur-xl rounded-[24px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-4">
          <p className="text-sm text-gray-600">Total Complaints</p>
          <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 rounded-[24px] p-4">
          <p className="text-sm text-red-600 font-semibold">Pending</p>
          <p className="text-2xl font-bold text-red-700">
            {complaints.filter(c => c.status === "Pending").length}
          </p>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-[24px] p-4">
          <p className="text-sm text-yellow-600 font-semibold">In Progress</p>
          <p className="text-2xl font-bold text-yellow-700">
            {complaints.filter(c => c.status === "In Progress").length}
          </p>
        </div>
        <div className="bg-green-50 border-l-4 border-[#2FCA71] rounded-[24px] p-4">
          <p className="text-sm text-[#2FCA71] font-semibold">Resolved</p>
          <p className="text-2xl font-bold text-[#28b863]">
            {complaints.filter(c => c.status === "Resolved").length}
          </p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6">
        {/* Search and Filter */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by user or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FCA71]"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FCA71]"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FCA71]"
          >
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Table */}
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
              {currentComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No complaints found
                  </td>
                </tr>
              ) : (
                currentComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{complaint.id}</td>
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
                    <td className="px-4 py-3 flex gap-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {complaint.status !== "Resolved" && (
                        <button 
                          onClick={() => updateComplaintStatus(complaint._id, "Resolved")}
                          className="text-green-600 hover:text-green-800"
                          title="Mark as Resolved"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstComplaint + 1} to {Math.min(indexOfLastComplaint, filteredComplaints.length)} of {filteredComplaints.length} complaints
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#2FCA71] text-white hover:shadow-lg transition-all"
                }`}
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => goToPage(index + 1)}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === index + 1
                        ? "bg-[#2FCA71] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#2FCA71] text-white hover:shadow-lg transition-all"
                }`}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
