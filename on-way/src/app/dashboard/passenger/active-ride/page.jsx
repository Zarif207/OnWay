"use client";

import {
  MapPin,
  Phone,
  MessageCircle,
  ShieldAlert,
  Share2,
  Car,
  Clock,
  Star,
} from "lucide-react";

export default function ActiveRide() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">
            Active Ride
          </h1>
          <p className="text-gray-500 mt-2">
            Track your ride in real time and stay connected
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">

            {/* Live Map */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-black mb-4">
                Live Tracking
              </h3>

              <div className="w-full h-96 bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p>Live GPS Map</p>
                  <p className="text-sm">
                    Driver location updating in real-time
                  </p>
                </div>
              </div>

              {/* ETA */}
              <div className="mt-6 flex justify-between items-center bg-yellow-50 border border-[#FFD600] rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Clock className="text-black w-5 h-5" />
                  <span className="font-semibold text-black">
                    Arriving in 6 minutes
                  </span>
                </div>

                <span className="text-sm text-gray-600">
                  ETA: 4:25 PM
                </span>
              </div>
            </div>

            {/* Communication */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-black mb-6">
                Driver Communication
              </h3>

              <div className="flex gap-4">
                <button className="flex-1 bg-black text-white py-3 rounded-lg flex items-center justify-center hover:bg-[#222] transition">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Driver
                </button>

                <button className="flex-1 border border-black text-black py-3 rounded-lg flex items-center justify-center hover:bg-[#FFD600] transition">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-1 space-y-6">

            {/* Driver Info */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-black mb-4">
                Driver Details
              </h3>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                  <Car className="w-6 h-6 text-gray-600" />
                </div>

                <div>
                  <h4 className="font-semibold text-black">
                    Michael Johnson
                  </h4>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-[#FFD600]" />
                    4.9 Rating
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p><span className="font-medium text-black">Vehicle:</span> Toyota Corolla</p>
                <p><span className="font-medium text-black">Plate:</span> AB-1234</p>
              </div>
            </div>

            {/* Safety */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-black mb-4">
                Safety
              </h3>

              <div className="space-y-4">

                <button className="w-full bg-red-500 text-white py-3 rounded-lg flex items-center justify-center hover:bg-red-600 transition">
                  <ShieldAlert className="w-5 h-5 mr-2" />
                  Panic Button
                </button>

                <button className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center hover:bg-gray-100 transition">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Trip
                </button>

              </div>
            </div>

            {/* Ride Summary */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-black mb-4">
                Ride Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pickup</span>
                  <span className="font-medium text-black">Central Mall</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Drop-off</span>
                  <span className="font-medium text-black">Airport Terminal 2</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Fare</span>
                  <span className="font-semibold text-black">$12.50</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}