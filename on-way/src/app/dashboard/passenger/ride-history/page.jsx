'use client';

import { useState } from 'react';
import { MapPin, Calendar, Star, Download, AlertCircle } from 'lucide-react';

/* ---------------------------------------------------------------- */
/* Simple Card Component (No external import needed) */
/* ---------------------------------------------------------------- */
function Card({ children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Simple Button Component */
/* ---------------------------------------------------------------- */
function Button({ children, variant = 'primary', onClick }) {
  const base =
    'px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center';

  const styles = {
    primary: 'bg-[#011421] text-white hover:opacity-90',
    outline:
      'border border-gray-300 text-gray-700 hover:bg-gray-100',
    danger:
      'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- */
/* Mock Data (Now Included Here — No Import Needed) */
/* ---------------------------------------------------------------- */
const mockRides = [
  {
    id: 'R001',
    passengerId: 'U001',
    pickupLocation: 'Downtown Mall',
    dropLocation: 'Airport Terminal 1',
    requestedAt: '2025-02-10',
    distance: 12,
    paymentMethod: 'Card',
    fare: 25,
    status: 'completed',
    driverName: 'John Smith',
    rating: 4,
  },
  {
    id: 'R002',
    passengerId: 'U001',
    pickupLocation: 'Central Park',
    dropLocation: 'City Hospital',
    requestedAt: '2025-02-12',
    distance: 6,
    paymentMethod: 'Cash',
    fare: 12,
    status: 'completed',
    driverName: 'Michael Brown',
    rating: null,
  },
  {
    id: 'R003',
    passengerId: 'U001',
    pickupLocation: 'University Gate',
    dropLocation: 'Home',
    requestedAt: '2025-02-15',
    distance: 8,
    paymentMethod: 'Card',
    fare: 16,
    status: 'cancelled',
    driverName: null,
    rating: null,
  },
];

/* ---------------------------------------------------------------- */
/* Main Ride History Component */
/* ---------------------------------------------------------------- */
export default function RideHistory() {
  const [filter, setFilter] = useState('all');

  const userRides = mockRides.filter(
    (r) => r.passengerId === 'U001'
  );

  const filteredRides =
    filter === 'all'
      ? userRides
      : userRides.filter((r) => r.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#011421]">
            Ride History
          </h1>
          <p className="text-gray-600 mt-2">
            View past rides, download receipts, rate drivers, or dispute rides.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-8">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>

          <Button
            variant={filter === 'completed' ? 'primary' : 'outline'}
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>

          <Button
            variant={filter === 'cancelled' ? 'primary' : 'outline'}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </Button>
        </div>

        {/* Ride Cards */}
        <div className="space-y-6">
          {filteredRides.map((ride) => (
            <Card key={ride.id}>
              <div className="flex flex-col lg:flex-row lg:justify-between gap-6">

                {/* LEFT SIDE */}
                <div className="flex-1">

                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-semibold text-lg text-[#011421]">
                      Ride #{ride.id}
                    </h3>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ride.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {ride.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-[#FF5A1F] mt-1" />
                      <p className="text-sm text-gray-700">
                        {ride.pickupLocation}
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-green-600 mt-1" />
                      <p className="text-sm text-gray-700">
                        {ride.dropLocation}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(
                          ride.requestedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <span>📍 {ride.distance} km</span>
                    <span>💳 {ride.paymentMethod}</span>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="lg:text-right space-y-3">

                  <p className="text-2xl font-bold text-green-600">
                    ${ride.fare}
                  </p>

                  {ride.driverName && (
                    <p className="text-sm text-gray-600">
                      Driver: {ride.driverName}
                    </p>
                  )}

                  {ride.status === 'completed' && (
                    <div className="space-y-2">

                      {/* Rating */}
                      {ride.rating ? (
                        <div className="flex items-center gap-1 lg:justify-end">
                          {[...Array(ride.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                      ) : (
                        <Button variant="outline">
                          Rate Driver
                        </Button>
                      )}

                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Receipt
                      </Button>

                      <Button variant="danger">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Dispute Ride
                      </Button>

                    </div>
                  )}
                </div>

              </div>
            </Card>
          ))}
        </div>

        {filteredRides.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            No rides found.
          </div>
        )}

      </div>
    </div>
  );
}