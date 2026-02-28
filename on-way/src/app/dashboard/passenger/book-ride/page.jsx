"use client";

import { useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  Bike,
  Users,
  DollarSign,
  Tag,
} from "lucide-react";

export default function PassengerBookRide() {
  const [selectedVehicle, setSelectedVehicle] = useState("sedan");
  const [scheduleType, setScheduleType] = useState("now");
  const [promoCode, setPromoCode] = useState("");

  const vehicleTypes = [
    { id: "bike", name: "OnWay Bike", icon: Bike, base: 8.5 },
    { id: "sedan", name: "OnWay Sedan", icon: Car, base: 12.5 },
    { id: "suv", name: "OnWay SUV", icon: Car, base: 18.75 },
    { id: "share", name: "OnWay Share", icon: Users, base: 6.5 },
  ];

  const distanceKm = 5.2;

  const selected = vehicleTypes.find((v) => v.id === selectedVehicle);
  const estimatedFare = (selected.base + distanceKm * 1.2).toFixed(2);

  return (
    <div className="min-h-screen bg-[#F4F5F7] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">
            Book a Ride
          </h1>
          <p className="text-gray-500 mt-2">
            Quick and intuitive ride booking
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">

            {/* Location + Map Picker */}
            <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-6">Where to?</h3>

              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Pickup location"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71]"
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Drop-off location"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71]"
                  />
                </div>
              </div>

              {/* Map Picker */}
              <div className="mt-6 h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MapPin className="w-10 h-10 mx-auto mb-2" />
                  <p>Map Picker (Google Maps API ready)</p>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-6">When?</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setScheduleType("now")}
                  className={`py-3 px-4 rounded-lg flex items-center ${
                    scheduleType === "now"
                      ? "bg-black text-white"
                      : "border border-black text-black"
                  }`}
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Ride Now
                </button>

                <button
                  onClick={() => setScheduleType("later")}
                  className={`py-3 px-4 rounded-lg flex items-center ${
                    scheduleType === "later"
                      ? "bg-black text-white"
                      : "border border-black text-black"
                  }`}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Later
                </button>
              </div>

              {scheduleType === "later" && (
                <input
                  type="datetime-local"
                  className="mt-4 w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#2FCA71]"
                />
              )}
            </div>

            {/* Vehicle Selection */}
            <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-6">
                Choose your ride
              </h3>

              <div className="space-y-3">
                {vehicleTypes.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition ${
                      selectedVehicle === vehicle.id
                        ? "border-[#2FCA71] bg-primary"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <vehicle.icon className="w-6 h-6 text-black" />
                        <h4 className="font-semibold">
                          {vehicle.name}
                        </h4>
                      </div>
                      <span className="font-bold text-black">
                        ${vehicle.base.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-6">
                Promo Code
              </h3>

              <div className="relative">
                <Tag className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71]"
                />
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-6">
                Payment Method
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                <button className="bg-black text-white py-3 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Wallet
                </button>

                <button className="border border-gray-300 py-3 rounded-lg hover:bg-gray-100">
                  Card
                </button>

                <button className="border border-gray-300 py-3 rounded-lg hover:bg-gray-100">
                  Cash
                </button>
              </div>
            </div>

            {/* Confirm */}
            <button className="w-full bg-[#2FCA71] text-black font-semibold py-4 rounded-xl hover:opacity-90 transition">
              Confirm Booking - ${estimatedFare}
            </button>

          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">
                Fare Estimator
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Distance</span>
                  <span className="font-semibold">
                    {distanceKm} km
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="font-semibold">
                    {selected.name}
                  </span>
                </div>

                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-black">
                    Estimated Fare
                  </span>
                  <span className="font-bold text-black">
                    ${estimatedFare}
                  </span>
                </div>
              </div>

              {promoCode && (
                <div className="mt-4 p-3 bg-primary border border-[#2FCA71] rounded-lg text-sm">
                  Promo code applied
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}