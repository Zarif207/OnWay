"use client";
import React, { useState } from "react";
import { ShieldAlert, MapPin, Phone, User, Clock } from "lucide-react";

export default function LiveSOSPage() {
  const [sosAlerts, setSosAlerts] = useState([
    { id: 1, user: "Sarah Wilson", location: "Downtown Area", time: "2 mins ago", status: "Active", phone: "+1234567890" },
    { id: 2, user: "Tom Brown", location: "Airport Road", time: "5 mins ago", status: "Responding", phone: "+1234567891" },
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldAlert className="text-red-500" />
          Live SOS Alerts
        </h1>
        <p className="text-gray-600 mt-2">Monitor and respond to emergency alerts in real-time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-semibold">Active Alerts</p>
              <p className="text-2xl font-bold text-red-700">2</p>
            </div>
            <ShieldAlert className="text-red-500" size={32} />
          </div>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-semibold">Responding</p>
              <p className="text-2xl font-bold text-yellow-700">1</p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-semibold">Resolved Today</p>
              <p className="text-2xl font-bold text-green-700">8</p>
            </div>
            <ShieldAlert className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sosAlerts.map((alert) => (
          <div key={alert.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <User className="text-gray-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">{alert.user}</h3>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    alert.status === "Active" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {alert.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{alert.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{alert.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone size={16} />
                    <span>{alert.phone}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                  Respond
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  Call
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
