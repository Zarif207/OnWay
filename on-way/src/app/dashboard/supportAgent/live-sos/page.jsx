"use client";
import React, { useState, useEffect } from "react";
import { ShieldAlert, MapPin, Phone, User, Clock, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

export default function LiveSOSPage() {
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    active: 0,
    responding: 0,
    resolvedToday: 0
  });

  const alertsPerPage = 10;

  // Fetch SOS alerts from backend
  const fetchSOSAlerts = async () => {
    console.log("🔄 Fetching SOS alerts...");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      
      const response = await fetch(`${apiUrl}/emergency/alerts`);
      
      const data = await response.json();
      
      if (data.success) {
        const alerts = data.alerts || [];
        
        setSosAlerts(alerts);
        
        // Calculate stats (case-insensitive)
        const active = alerts.filter(alert => 
          alert.status?.toLowerCase() === "active"
        ).length;
        
        const responding = alerts.filter(alert => 
          alert.status?.toLowerCase() === "responding"
        ).length;
        
        const resolved = alerts.filter(alert => 
          alert.status?.toLowerCase() === "resolved"
        ).length;
        
        setStats({ active, responding, resolvedToday: resolved });
      }
    } catch (error) {
      console.error("❌ Error fetching SOS alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount only
  useEffect(() => {
    setLoading(true);
    fetchSOSAlerts();
  }, []);

  // Update alert status
  const updateAlertStatus = async (alertId, newStatus) => {
    console.log(`🔄 Updating alert ${alertId} to ${newStatus}`);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/emergency/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus.toLowerCase() })
      });
      
      console.log("Update response:", response.status);
      
      if (response.ok) {
        console.log("✅ Alert updated successfully");
        fetchSOSAlerts();
      } else {
        console.error("❌ Failed to update alert");
      }
    } catch (error) {
      console.error("❌ Error updating alert:", error);
    }
  };

  // Filter out resolved alerts
  const activeAlerts = sosAlerts.filter(alert => alert.status?.toLowerCase() !== "resolved");
  
  // Pagination logic
  const totalPages = Math.ceil(activeAlerts.length / alertsPerPage);
  const indexOfLastAlert = currentPage * alertsPerPage;
  const indexOfFirstAlert = indexOfLastAlert - alertsPerPage;
  const currentAlerts = activeAlerts.slice(indexOfFirstAlert, indexOfLastAlert);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2FCA71] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SOS alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2FCA71] flex items-center gap-2">
            <ShieldAlert />
            Live SOS Alerts
          </h1>
          <p className="text-gray-600 mt-2">Monitor and respond to emergency alerts in real-time</p>
        </div>
        <button 
          onClick={fetchSOSAlerts}
          className="px-4 py-2 bg-[#2FCA71] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-semibold">Active Alerts</p>
              <p className="text-2xl font-bold text-red-700">{stats.active}</p>
            </div>
            <ShieldAlert className="text-red-500" size={32} />
          </div>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-semibold">Responding</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.responding}</p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-green-50 border-l-4 border-[#2FCA71] p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#2FCA71] font-semibold">Total Resolved</p>
              <p className="text-2xl font-bold text-[#28b863]">{stats.resolvedToday}</p>
            </div>
            <ShieldAlert className="text-[#2FCA71]" size={32} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {currentAlerts.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-12 text-center">
            <ShieldAlert className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No SOS alerts at the moment</p>
          </div>
        ) : (
          <>
            {currentAlerts.map((alert) => (
              <div key={alert._id} className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 border-l-4 border-red-500">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="text-gray-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-800">{alert.name || alert.userName || "Anonymous"}</h3>
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        alert.status?.toLowerCase() === "active" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {alert.status?.charAt(0).toUpperCase() + alert.status?.slice(1) || "Active"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{alert.location?.address || "Location unavailable"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{new Date(alert.timestamp || alert.createdAt).toLocaleString()}</span>
                      </div>
                      {(alert.phone || alert.userPhone) && (
                        <div className="flex items-center gap-1">
                          <Phone size={16} />
                          <span>{alert.phone || alert.userPhone}</span>
                        </div>
                      )}
                    </div>
                    {alert.message && (
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Message:</strong> {alert.message}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {alert.status?.toLowerCase() === "active" && (
                      <button 
                        onClick={() => updateAlertStatus(alert._id, "responding")}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:shadow-lg transition-all"
                      >
                        Respond
                      </button>
                    )}
                    {alert.status?.toLowerCase() === "responding" && (
                      <button 
                        onClick={() => updateAlertStatus(alert._id, "resolved")}
                        className="px-4 py-2 bg-[#2FCA71] text-white rounded-xl hover:shadow-lg transition-all"
                      >
                        Resolve
                      </button>
                    )}
                    {(alert.phone || alert.userPhone) && (
                      <a 
                        href={`tel:${alert.phone || alert.userPhone}`}
                        className="px-4 py-2 bg-[#2FCA71] text-white rounded-xl hover:shadow-lg transition-all"
                      >
                        Call
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-4">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstAlert + 1} to {Math.min(indexOfLastAlert, activeAlerts.length)} of {activeAlerts.length} alerts
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
          </>
        )}
      </div>
    </div>
  );
}
