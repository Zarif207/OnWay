'use client';

import {
  Car,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

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
} from 'recharts';

const mockStats = {
  activeRides: 234,
  revenueToday: 12540,
  sosCount: 6,
  userGrowth: 12.5,
};

const revenueData = [
  { day: 'Mon', revenue: 4000 },
  { day: 'Tue', revenue: 5200 },
  { day: 'Wed', revenue: 4800 },
  { day: 'Thu', revenue: 6100 },
  { day: 'Fri', revenue: 7200 },
  { day: 'Sat', revenue: 8500 },
  { day: 'Sun', revenue: 9100 },
];

const peakHours = [
  { hour: '8AM', rides: 120 },
  { hour: '12PM', rides: 200 },
  { hour: '5PM', rides: 340 },
  { hour: '9PM', rides: 260 },
];

const rideStatus = [
  { name: 'Completed', value: 8450 },
  { name: 'Ongoing', value: 234 },
  { name: 'Cancelled', value: 156 },
];

export default function DashboardOverview() {
  return (
    <div className="min-h-screen bg-gray-50 text-black p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight">
            Dashboard <span className="text-yellow-500">Overview</span>
          </h1>
          <p className="text-gray-500 mt-3 text-lg">
            Real-time monitoring of system performance and safety metrics.
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Active Rides" value={mockStats.activeRides} icon={Car} />
          <StatCard title="Revenue Today" value={`$${mockStats.revenueToday}`} icon={DollarSign} />
          <StatCard title="SOS Count" value={mockStats.sosCount} icon={AlertTriangle} danger />
          <StatCard title="User Growth" value={`${mockStats.userGrowth}%`} icon={TrendingUp} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">

          {/* Revenue */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-6">
              Weekly Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid stroke="#eee" />
                <XAxis dataKey="day" stroke="#555" />
                <YAxis stroke="#555" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#facc15"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Ride Status */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-6">
              Ride Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rideStatus}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#facc15" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-6">
            Peak Hours Activity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHours}>
              <CartesianGrid stroke="#eee" />
              <XAxis dataKey="hour" stroke="#555" />
              <YAxis stroke="#555" />
              <Tooltip />
              <Bar dataKey="rides" fill="#facc15" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

/* Improved Stat Card */
function StatCard({ title, value, icon: Icon, danger }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            danger ? 'bg-red-500' : 'bg-yellow-400'
          }`}
        >
          <Icon className="w-6 h-6 text-black" />
        </div>
      </div>

      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}