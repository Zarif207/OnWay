"use client";
import React from "react";

const OnWayBookPage = () => {
  return (
    <div className="min-h-screen w-full bg-[#ffffff] flex justify-center pt-15 pb-6">
      
      {/* Main Container */}
      <div className="w-full max-w-[1300px] flex gap-6 mx-auto">
        
        {/* LEFT SIDEBAR */}
        <div className="
          w-full 
          sm:w-[360px] 
          bg-white 
          rounded-2xl 
          shadow-sm 
          flex 
          flex-col
          overflow-hidden
        ">
          
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Find a ride
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your trip details
            </p>
          </div>

          {/* Body */}
          <div className="flex-1 px-6 pb-6 space-y-4">

            {/* Offer */}
            <div className="bg-green-50 text-green-600 text-xs px-3 py-2 rounded-lg">
              30% off your next ride. Up to BDT 75.
            </div>

            {/* Pickup */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Pick-up location"
                className="w-full bg-gray-100 text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-black transition"
              />
              <input
                type="text"
                placeholder="Drop-off location"
                className="w-full bg-gray-100 text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-black transition"
              />
            </div>

            {/* Time */}
            <select className="w-full bg-gray-100 text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-black transition">
              <option>Pick up now</option>
              <option>Schedule for later</option>
            </select>

            {/* Ride Types */}
            <div className="pt-2 space-y-2">

              <div className="group border rounded-xl p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Standard
                  </p>
                  <p className="text-xs text-gray-500">
                    Affordable everyday rides
                  </p>
                </div>
                <span className="text-sm font-medium">BDT 180</span>
              </div>

              <div className="group border rounded-xl p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Premium
                  </p>
                  <p className="text-xs text-gray-500">
                    Comfortable rides
                  </p>
                </div>
                <span className="text-sm font-medium">BDT 320</span>
              </div>

              <div className="group border rounded-xl p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Bike
                  </p>
                  <p className="text-xs text-gray-500">
                    Fast & budget friendly
                  </p>
                </div>
                <span className="text-sm font-medium">BDT 120</span>
              </div>

            </div>

            {/* Button */}
            <button className="w-full mt-4 bg-black text-white text-sm py-3 rounded-xl font-medium hover:bg-gray-900 transition">
              Search
            </button>

          </div>
        </div>

        {/* RIGHT MAP */}
        <div className="hidden sm:block flex-1 rounded-2xl overflow-hidden shadow-sm">
          <iframe
            src="https://maps.google.com/maps?q=dhaka&t=&z=13&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0"
            loading="lazy"
          ></iframe>
        </div>

      </div>
    </div>
  );
};

export default OnWayBookPage;