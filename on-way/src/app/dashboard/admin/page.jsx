"use client";

import { useState, useEffect } from "react";
import {
  Car,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Users,
  MapPin,
  Star,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import OnWayLoading from "@/app/components/Loading/page";

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Dashboard stats error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <OnWayLoading></OnWayLoading>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const { overview, today, week, month, growth, charts, recent } = stats;


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Dashboard <span className="text-[#2FCA71]">Overview</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time monitoring of your ride-sharing platform
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Activity className="w-5 h-5 text-[#2FCA71] animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Live</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={overview.totalUsers}
            icon={Users}
            color="bg-blue-500"
            trend={growth.userGrowth}
            subtitle={`${today.bookings} rides today`}
          />
          <MetricCard
            title="Active Drivers"
            value={overview.totalDrivers}
            icon={Car}
            color="bg-[#2FCA71]"
            subtitle={`${overview.ongoingBookings} ongoing`}
          />
          <MetricCard
            title="Total Revenue"
            value={`$${overview.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            color="bg-green-500"
            trend={growth.bookingGrowth}
            subtitle={`$${today.revenue.toFixed(2)} today`}
          />
          <MetricCard
            title="SOS Alerts"
            value={overview.emergencyCount}
            icon={AlertTriangle}
            color="bg-red-500"
            danger
            subtitle={`${today.emergency} today`}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SmallStatCard
            title="Total Rides"
            value={overview.totalBookings}
            icon={MapPin}
          />
          <SmallStatCard
            title="Completed"
            value={overview.completedBookings}
            icon={CheckCircle}
            color="text-green-600"
          />
          <SmallStatCard
            title="Avg Rating"
            value={overview.avgRating.toFixed(1)}
            icon={Star}
            color="text-yellow-500"
          />
          <SmallStatCard
            title="Reviews"
            value={overview.totalReviews}
            icon={Star}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <ChartCard title="Revenue Trend (Last 7 Days)">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.dailyBookings}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2FCA71" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2FCA71" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2FCA71"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Ride Status Distribution */}
          <ChartCard title="Ride Status Distribution">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {charts.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Peak Hours */}
          <ChartCard title="Today's Hourly Activity">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.hourlyBookings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#2FCA71"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Weekly Bookings */}
          <ChartCard title="Weekly Bookings Trend">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.dailyBookings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2FCA71"
                    strokeWidth={3}
                    dot={{ fill: "#2FCA71", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#2FCA71]" />
              Recent Bookings
            </h3>
           
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2FCA71]" />
              Quick Stats
            </h3>
            <div className="space-y-4">
              <QuickStat
                label="Today's Bookings"
                value={today.bookings}
                icon={Calendar}
              />
              <QuickStat
                label="This Week"
                value={week.bookings}
                icon={Activity}
              />
              <QuickStat
                label="This Month"
                value={month.bookings}
                icon={TrendingUp}
              />
              <QuickStat
                label="Pending Rides"
                value={overview.pendingBookings}
                icon={Clock}
                color="text-yellow-600"
              />
              <QuickStat
                label="Cancelled"
                value={overview.cancelledBookings}
                icon={XCircle}
                color="text-red-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, icon: Icon, color, trend, subtitle, danger }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trend >= 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-gray-600 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}

// Small Stat Card
function SmallStatCard({ title, value, icon: Icon, color = "text-gray-600" }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Chart Card
function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <h3 className="text-lg font-semibold mb-6 text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

// Quick Stat
function QuickStat({ label, value, icon: Icon, color = "text-gray-600" }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-lg font-bold text-gray-900">{value}</span>
    </div>
  );
}
