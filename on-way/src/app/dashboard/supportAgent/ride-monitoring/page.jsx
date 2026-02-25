'use client';

import { useState } from 'react';
import {
  Car,
  AlertTriangle,
  Star,
  MapPin,
  User,
  Send,
} from 'lucide-react';

const mockRides = [
  {
    id: 'R001',
    passenger: 'Sarah Johnson',
    driver: 'David Miller',
    status: 'Active',
    location: 'Downtown',
    rating: 4.8,
  },
  {
    id: 'R002',
    passenger: 'Michael Chen',
    driver: 'Robert King',
    status: 'Active',
    location: 'Airport Area',
    rating: 3.2,
  },
  {
    id: 'R003',
    passenger: 'Emma Davis',
    driver: 'Chris Lee',
    status: 'Completed',
    location: 'City Mall',
    rating: 4.1,
  },
];

export default function RideMonitoring() {
  const [rides] = useState(mockRides);
  const [filter, setFilter] = useState('All');
  const [dispatchArea, setDispatchArea] = useState('');

  const filteredRides =
    filter === 'All'
      ? rides
      : rides.filter(ride => ride.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Car className="text-yellow-500 w-7 h-7" />
            Ride Monitoring
          </h1>
          <p className="text-gray-600 mt-2">
            Supervise ongoing platform activity and manage performance alerts.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex gap-3 mb-8">
          {['All', 'Active', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === status
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white border text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Ride List */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {filteredRides.map(ride => (
            <div
              key={ride.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold text-gray-800">
                  Ride ID: {ride.id}
                </h3>
                <StatusBadge status={ride.status} />
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  Passenger: {ride.passenger}
                </p>

                <p className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-gray-500" />
                  Driver: {ride.driver}
                </p>

                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  Location: {ride.location}
                </p>

                <p className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${
                    ride.rating < 3.5 ? 'text-red-500' : 'text-yellow-500'
                  }`} />
                  Driver Rating: {ride.rating}
                </p>
              </div>

              {/* Low Rating Alert */}
              {ride.rating < 3.5 && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Performance Warning: Low Driver Rating
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Manual Dispatch Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Manual Dispatch (High Demand Areas)
          </h2>

          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Enter Area (e.g. Airport, Downtown)"
              value={dispatchArea}
              onChange={(e) => setDispatchArea(e.target.value)}
              className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />

            <button
              onClick={() => {
                alert(`Manual dispatch triggered for ${dispatchArea}`);
                setDispatchArea('');
              }}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-600 transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Dispatch Drivers
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Use this option during peak hours to allocate drivers manually to specific zones.
          </p>
        </div>

      </div>
    </div>
  );
}

/* Status Badge */
function StatusBadge({ status }) {
  const styles = {
    Active: 'bg-green-100 text-green-600',
    Completed: 'bg-blue-100 text-blue-600',
  };

  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}