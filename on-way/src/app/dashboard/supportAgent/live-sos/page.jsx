"use client";
import React, { useState, useEffect } from "react";
import { ShieldAlert, MapPin, Phone, User, Clock, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import SupportLoading from "../SupportLoading";

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
    return <SupportLoading />;
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
              <div key={alert._id} className="bg-white/70 backdrop-blur-xl rounded-[32px] border-l-4 border-red-500 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <User className="text-gray-600 shrink-0" size={18} />
                      <h3 className="text-base font-semibold text-gray-800 break-all">{alert.name || alert.userName || "Anonymous"}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full shrink-0 ${
                        alert.status?.toLowerCase() === "active" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {alert.status?.charAt(0).toUpperCase() + alert.status?.slice(1) || "Active"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 text-sm text-gray-600 mb-2">
                      <div className="flex items-start gap-1">
                        <MapPin size={15} className="shrink-0 mt-0.5" />
                        <span className="break-all">{alert.location?.address || `${alert.location?.latitude || ""}, ${alert.location?.longitude || ""}` || "Location unavailable"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={15} className="shrink-0" />
                        <span>{new Date(alert.timestamp || alert.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone size={15} className="shrink-0" />
                        <span>{alert.phone || alert.userPhone || "N/A"}</span>
                      </div>
                    </div>
                    {alert.message && (
                      <p className="text-sm text-gray-700"><strong>Message:</strong> {alert.message}</p>
                    )}
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                    {alert.status?.toLowerCase() === "active" && (
                      <button
                        onClick={() => updateAlertStatus(alert._id, "responding")}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-xl text-sm hover:shadow-lg transition-all"
                      >
                        Respond
                      </button>
                    )}
                    {alert.status?.toLowerCase() === "responding" && (
                      <button
                        onClick={() => updateAlertStatus(alert._id, "resolved")}
                        className="px-4 py-2 bg-[#2FCA71] text-white rounded-xl text-sm hover:shadow-lg transition-all"
                      >
                        Resolve
                      </button>
                    )}
                    {(alert.phone || alert.userPhone) && (
                      <a
                        href={`tel:${alert.phone || alert.userPhone}`}
                        className="px-4 py-2 bg-[#2FCA71] text-white rounded-xl text-sm hover:shadow-lg transition-all text-center"
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
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 bg-white/70 backdrop-blur-xl rounded-4xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-4 gap-3">
                <div className="text-sm text-gray-600 text-center sm:text-left">
                  Showing {indexOfFirstAlert + 1} to {Math.min(indexOfLastAlert, activeAlerts.length)} of {activeAlerts.length} alerts
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg flex items-center gap-1 text-sm ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-[#2FCA71] text-white hover:shadow-lg transition-all"
                    }`}
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => goToPage(index + 1)}
                      className={`w-9 h-9 rounded-lg text-sm ${
                        currentPage === index + 1
                          ? "bg-[#2FCA71] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg flex items-center gap-1 text-sm ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-[#2FCA71] text-white hover:shadow-lg transition-all"
                    }`}
                  >
                    Next
                    <ChevronRight size={16} />
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
