"use client";
import React from "react";

const RideSharingGuidelines = () => {
  return (
    <div className=" mx-auto px-4 pt-20">

      {/* ✅ Banner Section */}
      <div className="">
        <div className="relative h-[600px] w-full overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/guildelince.jpeg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Gradient Overlay (Makes text pop without ruining image quality) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
            <h1 className="text-5xl font-bold">Ride Sharing Guidelines</h1>
            <p>Follow rules, stay safe, and enjoy a smooth ride experience.</p>
          </div>
        </div>
      </div>
      {/* Intro */}
      <div className="w-7xl mx-auto">
        <div className="rounded-xl p-6 mb-8 shadow-md border border-gray-100 bg-white/60 backdrop-blur-sm">
          <p className="text-lg">
            This page provides important information about ride-sharing policies,
            traffic rules, and safety guidelines to ensure a secure and smooth experience.
          </p>
        </div>

        {/* Traffic Rules */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            🚦 Traffic Rules & Penalties
          </h2>

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-100 text-black">
                <tr>
                  <th className="p-4 text-left border-b">Offense</th>
                  <th className="p-4 text-left border-b">Penalty (New Law)</th>
                </tr>
              </thead>
              <tbody className="text-sm md:text-base">
                {[
                  ["Driving without a license", "6 months imprisonment and 25,000 BDT fine"],
                  ["Unregistered vehicle", "6 months imprisonment or 50,000 BDT fine or both"],
                  ["Unfit vehicle", "6 months imprisonment or 25,000 BDT fine or both"],
                  ["Vehicle body modification", "Up to 3 years imprisonment or 300,000 BDT fine or both"],
                  ["No route/fitness permit", "6 months imprisonment or 25,000 BDT fine or both"],
                  ["Over speeding", "3 months imprisonment or 10,000 BDT fine or both"],
                  ["Using prohibited horn", "3 months imprisonment or 15,000 BDT fine or both"],
                  ["Driving on the wrong side", "3 months imprisonment or 10,000 BDT fine or both"],
                  ["Ignoring traffic signals", "3 months imprisonment or 10,000 BDT fine or both"],
                  ["Using fake license", "100,000–500,000 BDT fine or 6 months to 2 years imprisonment"],
                  ["Illegal parking", "Up to 5,000 BDT fine"],
                  ["No helmet", "Up to 10,000 BDT fine"],
                  ["No seatbelt", "Up to 5,000 BDT fine"],
                  ["Using phone while driving", "Up to 5,000 BDT fine"],
                ].map(([offense, penalty], i, arr) => (
                  <tr key={offense} className="hover:bg-gray-50">
                    <td className={`p-4 ${i < arr.length - 1 ? "border-b" : ""}`}>
                      {offense}
                    </td>
                    <td className={`p-4 font-medium ${i < arr.length - 1 ? "border-b" : ""}`}>
                      {penalty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rider */}
        <div className="rounded-xl p-6 mb-8 shadow-md border border-gray-100">
          <h2 className="text-xl font-bold mb-3">🧍 Rider Guidelines</h2>
          <ul className="list-disc ml-5 space-y-2 text-gray-700">
            <li>Verify driver details before starting the ride</li>
            <li>Use OTP verification</li>
            <li>Share live location with trusted contacts</li>
            <li>Use SOS button in emergencies</li>
            <li>Prefer digital payments</li>
          </ul>
        </div>

        {/* Driver */}
        <div className="rounded-xl p-6 mb-8 shadow-md border border-gray-100">
          <h2 className="text-xl font-bold mb-3">🚗 Driver Guidelines</h2>
          <ul className="list-disc ml-5 space-y-2 text-gray-700">
            <li>Follow all traffic rules strictly</li>
            <li>Be polite and professional</li>
            <li>Maintain vehicle cleanliness</li>
            <li>Avoid unnecessary ride cancellations</li>
          </ul>
        </div>

        {/* Safety */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-3 text-red-700">🛡️ Safety & Health</h2>
          <ul className="list-disc ml-5 space-y-2 text-red-900">
            <li>Use sanitizer regularly</li>
            <li>Avoid physical contact</li>
            <li>Do not travel if sick</li>
            <li>Follow WHO and national guidelines</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-gray-100 rounded-xl p-8 text-center border border-gray-200">
          <h2 className="text-xl font-bold mb-2">📞 Contact Support</h2>
          <p className="text-lg font-semibold text-blue-600">Helpline: 13301</p>
          <p className="text-gray-600 italic">Email: support@rideshare.com</p>
        </div>
      </div>

    </div>
  );
};

export default RideSharingGuidelines;