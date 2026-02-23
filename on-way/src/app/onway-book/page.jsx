"use client";

import React, { useState } from "react";
import { Clock, ChevronDown, User } from "lucide-react";

const OnWayBookPage = () => {
  const [pickupTime, setPickupTime] = useState("Pick up now");
  const [pickupTimeOpen, setPickupTimeOpen] = useState(false);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedTime, setSelectedTime] = useState("Now");

  const [rideFor, setRideFor] = useState("For me");
  const [rideForOpen, setRideForOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-white flex justify-center px-4 sm:px-6 pt-6 pb-6">
      <div className="w-full max-w-[1300px] flex flex-col lg:flex-row gap-20">
        {/* LEFT SIDEBAR */}
        <div className="w-full lg:w-[380px] bg-white rounded-2xl shadow-sm flex flex-col p-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Find a ride</h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your trip details
            </p>
          </div>

          <div className="bg-green-50 text-green-600 text-xs px-3 py-2 rounded-lg mb-4">
            30% off your next ride. Up to BDT 75.
          </div>

          <div className="space-y-4">
            {/* Pickup */}
            <div className="flex items-center gap-4 bg-neutral rounded-2xl px-5 py-4 hover:bg-accent transition cursor-text">
              <div className="w-4 h-4 rounded-full border-[3px] border-black"></div>
              <input
                type="text"
                placeholder="Pick-up location"
                className="bg-transparent outline-none text-base w-full placeholder:text-gray-600 text-black"
              />
            </div>

            {/* Dropoff */}
            <div className="flex items-center gap-4 bg-neutral rounded-2xl px-5 py-4 hover:bg-accent transition cursor-text">
              <div className="w-4 h-4 bg-black"></div>
              <input
                type="text"
                placeholder="Drop-off location"
                className="bg-transparent outline-none text-base w-full placeholder:text-gray-600 text-black"
              />
            </div>

            {/* Pickup Time Dropdown */}
            <div className="relative">
              <div
                onClick={() => setPickupTimeOpen(!pickupTimeOpen)}
                className="flex items-center justify-between bg-gray-200 rounded-2xl px-5 py-4 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <Clock size={18} />
                  <span className="text-base font-medium">{pickupTime}</span>
                </div>
                <ChevronDown size={18} />
              </div>

              {pickupTimeOpen && (
                <div className="absolute w-full mt-2 bg-white rounded-2xl shadow-lg border z-30 overflow-hidden">
                  <div
                    onClick={() => {
                      setPickupTime("Pick up now");
                      setSelectedDate("Today");
                      setSelectedTime("Now");
                      setPickupTimeOpen(false);
                      setScheduleOpen(true);
                    }}
                    className="px-5 py-4 hover:bg-gray-100 cursor-pointer transition"
                  >
                    Pick up now
                  </div>

                  <div
                    onClick={() => {
                      setPickupTimeOpen(false);
                      setScheduleOpen(true);
                    }}
                    className="px-5 py-4 hover:bg-gray-100 cursor-pointer transition"
                  >
                    Schedule for later
                  </div>
                </div>
              )}
            </div>

            {/* Ride For Dropdown */}
            <div className="relative w-fit">
              <div
                onClick={() => setRideForOpen(!rideForOpen)}
                className="inline-flex items-center gap-3 bg-gray-200 rounded-full px-5 py-3 cursor-pointer"
              >
                <User size={16} />
                <span className="text-base font-medium">{rideFor}</span>
                <ChevronDown size={16} />
              </div>

              {rideForOpen && (
                <div className="absolute mt-2 bg-white rounded-xl shadow-md border w-52 z-20">
                  <div
                    onClick={() => {
                      setRideFor("For me");
                      setRideForOpen(false);
                    }}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                  >
                    For me
                  </div>

                  <div
                    onClick={() => {
                      setRideFor("For someone else");
                      setRideForOpen(false);
                    }}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                  >
                    For someone else
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ride Types */}
          <div className="pt-6 space-y-2">
            {[
              {
                name: "Standard",
                desc: "Affordable everyday rides",
                price: "BDT 180",
              },
              { name: "Premium", desc: "Comfortable rides", price: "BDT 320" },
              {
                name: "Bike",
                desc: "Fast & budget friendly",
                price: "BDT 120",
              },
            ].map((ride) => (
              <div
                key={ride.name}
                className="border rounded-xl p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {ride.name}
                  </p>
                  <p className="text-xs text-gray-500">{ride.desc}</p>
                </div>
                <span className="text-sm font-medium">{ride.price}</span>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 bg-black text-white text-sm py-3 rounded-xl font-medium hover:bg-gray-900 transition">
            Search
          </button>
        </div>

        {/* RIGHT MAP */}
        <div className="hidden lg:block flex-1 rounded-2xl overflow-hidden shadow-sm min-h-[500px]">
          <iframe
            src="https://maps.google.com/maps?q=dhaka&t=&z=13&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>
      </div>

      {/* SCHEDULE MODAL */}
      {scheduleOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setScheduleOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              >
                ←
              </button>

              <button
                onClick={() => {
                  setSelectedDate("Today");
                  setSelectedTime("Now");
                }}
                className="text-sm font-medium"
              >
                Clear
              </button>
            </div>

            <h2 className="text-2xl font-semibold leading-snug">
              When do you want to be picked up?
            </h2>

            {/* Date Selector (REAL DATE) */}
            <div className="bg-gray-100 rounded-2xl p-4 relative">
              <input
                type="date"
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex justify-between items-center pointer-events-none">
                <span className="flex items-center gap-3">
                  📅 {selectedDate}
                </span>
                ⌄
              </div>
            </div>

            {/* Time Selector (REAL TIME) */}
            <div className="bg-gray-100 rounded-2xl p-4 relative">
              <input
                type="time"
                onChange={(e) => setSelectedTime(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex justify-between items-center pointer-events-none">
                <span className="flex items-center gap-3">
                  🕒 {selectedTime}
                </span>
                ⌄
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex gap-3">
                📅 Choose your pick-up time up to 30 days in advance
              </div>
              <div className="flex gap-3">
                ⏳ Extra wait time included to meet your trip
              </div>
              <div className="flex gap-3">
                ▬ Cancel at no charge up to 60 minutes in advance
              </div>
            </div>

            <button
              onClick={() => {
                setPickupTime(`${selectedDate} • ${selectedTime}`);
                setScheduleOpen(false);
              }}
              className="w-full bg-black text-white rounded-2xl py-4 text-lg font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnWayBookPage;
