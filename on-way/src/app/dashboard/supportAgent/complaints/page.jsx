"use client";
import React, { useState, useEffect } from "react";
import { FileText, Search, Eye, CheckCircle, RefreshCw, ChevronLeft, ChevronRight, MapPin, Phone, Mail, MessageSquare } from "lucide-react";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
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
        if (selectedComplaint && selectedComplaint._id === complaintId) {
          setShowDetails(false);
          setSelectedComplaint(null);
        }
      }
    } catch (error) {
      console.error("Error updating complaint:", error);
    }
  };

  // View complaint details
  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetails(true);
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
      {/* Details Modal */}
      {showDetails && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Complaint Details</h2>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  selectedComplaint.status === "Resolved" ? "bg-green-100 text-green-700" :
                  selectedComplaint.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {selectedComplaint.status}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  selectedComplaint.priority === "High" ? "bg-red-100 text-red-700" :
                  selectedComplaint.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {selectedComplaint.priority} Priority
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-gray-600" />
                  <span className="font-semibold">ID:</span>
                  <span>{selectedComplaint.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">User:</span>
                  <span>{selectedComplaint.user}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Type:</span>
                  <span>{selectedComplaint.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Date:</span>
                  <span>{selectedComplaint.date}</span>
                </div>
              </div>

              {selectedComplaint.description && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare size={18} className="text-gray-600 mt-1" />
                    <span className="font-semibold">Description:</span>
                  </div>
                  <p className="text-gray-700 ml-6">{selectedComplaint.description}</p>
                </div>
              )}

              {selectedComplaint.location && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin size={18} className="text-gray-600 mt-1" />
                    <span className="font-semibold">Location:</span>
                  </div>
                  <p className="text-gray-700 ml-6">
                    {selectedComplaint.location.address || 
                     `Lat: ${selectedComplaint.location.latitude}, Lng: ${selectedComplaint.location.longitude}`}
                  </p>
                </div>
              )}

              {selectedComplaint.phone && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-gray-600" />
                    <span className="font-semibold">Phone:</span>
                    <a href={`tel:${selectedComplaint.phone}`} className="text-[#2FCA71] hover:underline">
                      {selectedComplaint.phone}
                    </a>
                  </div>
                </div>
              )}

              {selectedComplaint.email && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-gray-600" />
                    <span className="font-semibold">Email:</span>
                    <a href={`mailto:${selectedComplaint.email}`} className="text-[#2FCA71] hover:underline">
                      {selectedComplaint.email}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {selectedComplaint.status === "Pending" && (
                  <button 
                    onClick={() => updateComplaintStatus(selectedComplaint._id, "In Progress")}
                    className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Mark as In Progress
                  </button>
                )}
                {selectedComplaint.status !== "Resolved" && (
                  <button 
                    onClick={() => updateComplaintStatus(selectedComplaint._id, "Resolved")}
                    className="flex-1 px-4 py-3 bg-[#2FCA71] text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Mark as Resolved
                  </button>
                )}
                {selectedComplaint.phone && (
                  <a 
                    href={`tel:${selectedComplaint.phone}`}
                    className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:shadow-lg transition-all text-center"
                  >
                    Call User
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
                        onClick={() => viewComplaintDetails(complaint)}
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
