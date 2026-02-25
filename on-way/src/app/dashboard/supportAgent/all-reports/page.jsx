'use client';

import {
  BarChart3,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';

export default function Reports() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="text-yellow-500 w-7 h-7" />
            Safety & Performance Reports
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor SOS activity, response efficiency, and agent performance metrics.
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Today's SOS"
            value="12"
            icon={<AlertTriangle className="text-red-500 w-6 h-6" />}
            color="red"
          />
          <StatCard
            title="Avg Response Time"
            value="2.3 min"
            icon={<Clock className="text-yellow-500 w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Avg Resolution Time"
            value="18 min"
            icon={<CheckCircle className="text-green-500 w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Escalations"
            value="3"
            icon={<ShieldAlert className="text-purple-500 w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Daily SOS Summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Daily SOS Summary
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <MiniCard title="Critical" value="4" badge="bg-red-100 text-red-600" />
            <MiniCard title="Medium" value="5" badge="bg-yellow-100 text-yellow-700" />
            <MiniCard title="Low" value="3" badge="bg-blue-100 text-blue-600" />
          </div>
        </div>

        {/* Agent Performance Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-500" />
            Agent Performance
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">Agent</th>
                  <th className="pb-3">Tickets Handled</th>
                  <th className="pb-3">Avg Response</th>
                  <th className="pb-3">Resolution Rate</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 font-medium">Agent John</td>
                  <td>18</td>
                  <td>2.1 min</td>
                  <td className="text-green-600 font-medium">94%</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 font-medium">Agent Sarah</td>
                  <td>14</td>
                  <td>2.8 min</td>
                  <td className="text-green-600 font-medium">91%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 font-medium">Agent Mark</td>
                  <td>10</td>
                  <td>3.4 min</td>
                  <td className="text-yellow-600 font-medium">82%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Escalation Log */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Critical Escalation Log
          </h2>

          <div className="space-y-4">
            <EscalationItem
              title="Unsafe Route Deviation"
              user="Sarah Johnson"
              status="Escalated to Admin"
              time="Today, 10:30 AM"
            />
            <EscalationItem
              title="Driver Misconduct Report"
              user="Michael Chen"
              status="Under Review"
              time="Yesterday, 4:20 PM"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

/* Reusable Stat Card */
function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* Mini Summary Card */
function MiniCard({ title, value, badge }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge}`}>
        {value}
      </span>
    </div>
  );
}

/* Escalation Item */
function EscalationItem({ title, user, status, time }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition bg-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">
            Reported by {user}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-red-600">{status}</p>
          <p className="text-xs text-gray-500">{time}</p>
        </div>
      </div>
    </div>
  );
}