'use client';

import { useState, useEffect } from 'react';
import { useRequireRole } from '@/hooks/useAuth';
import SupportLoading from "./SupportLoading";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SupportAgentDashboard() {
  const { user, isLoading } = useRequireRole("supportAgent");
  const [stats, setStats] = useState({
    totalComplaints: 0,
    activeSOS: 0,
    pendingRefunds: 0,
    resolvedToday: 0,
  });
  const [complaintsData, setComplaintsData] = useState([]);
  const [sosData, setSosData] = useState([]);

  // Fetch dashboard stats and data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        
        // Fetch stats
        const statsResponse = await fetch(`${apiUrl}/support-agent/stats`);
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }

        // Fetch complaints for pie chart
        const complaintsResponse = await fetch(`${apiUrl}/support-agent/complaints`);
        const complaintsResult = await complaintsResponse.json();
        if (complaintsResult.success) {
          const complaints = complaintsResult.data;
          const pending = complaints.filter(c => c.status === "Pending").length;
          const inProgress = complaints.filter(c => c.status === "In Progress").length;
          const resolved = complaints.filter(c => c.status === "Resolved").length;
          
          setComplaintsData([
            { name: 'Pending', value: pending, color: '#EF4444' },
            { name: 'In Progress', value: inProgress, color: '#F59E0B' },
            { name: 'Resolved', value: resolved, color: '#2FCA71' },
          ]);
        }

        // Fetch SOS alerts for bar chart
        const sosResponse = await fetch(`${apiUrl}/emergency/alerts`);
        const sosResult = await sosResponse.json();
        if (sosResult.success) {
          const alerts = sosResult.alerts;
          
          // Group by day of week
          const weekData = {
            Mon: { active: 0, responding: 0, resolved: 0 },
            Tue: { active: 0, responding: 0, resolved: 0 },
            Wed: { active: 0, responding: 0, resolved: 0 },
            Thu: { active: 0, responding: 0, resolved: 0 },
            Fri: { active: 0, responding: 0, resolved: 0 },
            Sat: { active: 0, responding: 0, resolved: 0 },
            Sun: { active: 0, responding: 0, resolved: 0 },
          };

          alerts.forEach(alert => {
            const date = new Date(alert.timestamp || alert.createdAt);
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const day = days[date.getDay()];
            
            const status = alert.status?.toLowerCase();
            if (status === 'active') weekData[day].active++;
            else if (status === 'responding') weekData[day].responding++;
            else if (status === 'resolved') weekData[day].resolved++;
          });

          const sosChartData = Object.keys(weekData).map(day => ({
            day,
            active: weekData[day].active,
            responding: weekData[day].responding,
            resolved: weekData[day].resolved,
          }));

          setSosData(sosChartData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  // Pie Chart Data - Complaint Status (from real data)
  const complaintStatusData = complaintsData.length > 0 ? complaintsData : [
    { name: 'Pending', value: 8, color: '#EF4444' },
    { name: 'In Progress', value: 5, color: '#F59E0B' },
    { name: 'Resolved', value: 12, color: '#2FCA71' },
  ];

  // Bar Chart Data - SOS Alerts (from real data)
  const sosAlertsData = sosData.length > 0 ? sosData : [
    { day: 'Mon', active: 3, responding: 2, resolved: 5 },
    { day: 'Tue', active: 2, responding: 3, resolved: 4 },
    { day: 'Wed', active: 4, responding: 1, resolved: 6 },
    { day: 'Thu', active: 1, responding: 4, resolved: 3 },
    { day: 'Fri', active: 5, responding: 2, resolved: 7 },
    { day: 'Sat', active: 2, responding: 1, resolved: 3 },
    { day: 'Sun', active: 1, responding: 0, resolved: 2 },
  ];

  // Line Chart Data - Chat Support Response Time
  const chatResponseData = [
    { time: '9 AM', messages: 15, avgResponse: 2 },
    { time: '12 PM', messages: 25, avgResponse: 3 },
    { time: '3 PM', messages: 20, avgResponse: 2.5 },
    { time: '6 PM', messages: 30, avgResponse: 4 },
    { time: '9 PM', messages: 18, avgResponse: 3 },
  ];

  // Bar Chart Data - Refunds
  const refundsData = [
    { month: 'Jan', approved: 45, pending: 12, rejected: 3 },
    { month: 'Feb', approved: 52, pending: 8, rejected: 5 },
    { month: 'Mar', approved: 61, pending: 15, rejected: 4 },
  ];

  // Pie Chart Data - Verification Status
  const verificationData = [
    { name: 'Approved', value: 65, color: '#2FCA71' },
    { name: 'Pending', value: 20, color: '#F59E0B' },
    { name: 'Rejected', value: 15, color: '#EF4444' },
  ];

  if (isLoading) {
    return <SupportLoading />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#2FCA71]">
          Support Agent Dashboard 👋
        </h1>
        <p className="text-gray-600 mt-2">Monitor and manage support activities</p>
      </div>

      {/* Charts Row 1 - Complaints & SOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Complaint Status */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">📋 Complaints Status</h3>
            <a 
              href="/dashboard/supportAgent/complaints"
              className="text-sm text-[#2FCA71] hover:underline"
            >
              View All →
            </a>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={complaintStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {complaintStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - SOS Alerts */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">🚨 Live SOS Alerts (Weekly)</h3>
            <a 
              href="/dashboard/supportAgent/live-sos"
              className="text-sm text-[#2FCA71] hover:underline"
            >
              View All →
            </a>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sosAlertsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="active" fill="#EF4444" name="Active" />
              <Bar dataKey="responding" fill="#F59E0B" name="Responding" />
              <Bar dataKey="resolved" fill="#2FCA71" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 - Chat Support & Refunds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Chat Support */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">💬 Chat Support Activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chatResponseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="messages" stroke="#3B82F6" strokeWidth={3} name="Messages" />
              <Line type="monotone" dataKey="avgResponse" stroke="#2FCA71" strokeWidth={3} name="Avg Response (min)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Refunds */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">💰 Refunds (Monthly)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={refundsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="approved" fill="#2FCA71" name="Approved" />
              <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
              <Bar dataKey="rejected" fill="#EF4444" name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3 - Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Verification Status */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">✅ Verification Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={verificationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {verificationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Overall Performance */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">📊 Overall Performance</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={[
              { category: 'Complaints', count: 25 },
              { category: 'SOS', count: 18 },
              { category: 'Chat', count: 108 },
              { category: 'Refunds', count: 75 },
              { category: 'Verification', count: 100 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2FCA71" name="Total Handled" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
