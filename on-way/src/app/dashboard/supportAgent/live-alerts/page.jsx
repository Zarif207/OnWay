'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  BellRing,
} from 'lucide-react';

const mockAlerts = [
  {
    id: 1,
    type: 'SOS',
    user: 'John Doe',
    role: 'Passenger',
    description: 'Driver not responding and route deviation detected.',
    location: 'Downtown Street, Block A',
    time: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 2,
    type: 'Complaint',
    user: 'Sarah Khan',
    role: 'Passenger',
    description: 'Driver was rude during trip.',
    location: 'Airport Road',
    time: new Date().toISOString(),
    status: 'active',
  },
];

export default function LiveAlerts() {
  const [alerts, setAlerts] = useState(mockAlerts);

  useEffect(() => {
    if (alerts.some(a => a.status === 'active')) {
      const audio = new Audio('/alert.mp3');
      audio.play().catch(() => {});
    }
  }, [alerts]);

  const resolveAlert = (id) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, status: 'resolved' } : alert
      )
    );
  };

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BellRing className="text-primary w-7 h-7" />
            Live Alerts Monitoring
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time emergency and complaint tracking dashboard.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <StatCard
            icon={<AlertTriangle className="text-red-600 w-6 h-6" />}
            title="Active Alerts"
            value={activeAlerts.length}
            color="red"
          />
          <StatCard
            icon={<Clock className="text-primary w-6 h-6" />}
            title="Avg Response"
            value="2.4 min"
            color="yellow"
          />
          <StatCard
            icon={<CheckCircle className="text-green-600 w-6 h-6" />}
            title="Resolved Today"
            value={resolvedAlerts.length}
            color="green"
          />
        </div>

        {/* Active Alerts Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Active Alerts ({activeAlerts.length})
          </h2>

          {activeAlerts.length === 0 && (
            <div className="bg-white border border-gray-200 p-8 rounded-xl text-center shadow-sm">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-green-700">
                No Active Alerts
              </p>
            </div>
          )}

          {activeAlerts.map(alert => (
            <div
              key={alert.id}
              className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                    alert.type === 'SOS'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-primary text-primary'
                  }`}>
                    {alert.type}
                  </span>

                  <h3 className="text-lg font-bold text-gray-900 mt-3">
                    {alert.user} ({alert.role})
                  </h3>

                  <p className="text-gray-600 mt-2">
                    {alert.description}
                  </p>
                </div>

                <span className="text-sm text-gray-500">
                  {new Date(alert.time).toLocaleTimeString()}
                </span>
              </div>

              {/* Location */}
              <div className="bg-gray-100 border border-gray-200 p-4 rounded-lg mb-4 flex items-center gap-3">
                <MapPin className="text-primary w-5 h-5" />
                <span className="text-gray-700">{alert.location}</span>
              </div>

              {/* Map Placeholder */}
              <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                Live Map Preview
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button className="bg-primary hover:bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Call User
                </button>

                <button className="bg-primary hover:bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Call Driver
                </button>

                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition border">
                  View Details
                </button>

                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  <CheckCircle className="inline w-4 h-4 mr-2" />
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resolved Alerts */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Recently Resolved ({resolvedAlerts.length})
          </h2>

          {resolvedAlerts.map(alert => (
            <div
              key={alert.id}
              className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {alert.user}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {alert.description}
                  </p>
                </div>
                <span className="text-green-600 text-sm font-medium">
                  Resolved
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* Reusable Stat Card */
function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
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