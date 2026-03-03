"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Phone, MapPin, Camera, User, Car } from "lucide-react";
import Swal from "sweetalert2";

export default function EmergencySOSPage() {
  const [location, setLocation] = useState(null);
  const [isActivating, setIsActivating] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Location error:", error);
        }
      );
    }
  }, []);

  const handleSOSPress = () => {
    Swal.fire({
      title: "Activate Emergency SOS?",
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-700">This will:</p>
          <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Alert emergency contacts</li>
            <li>Notify admin & support team</li>
            <li>Share your live location</li>
            <li>Send ride details (if active)</li>
            <li>Enable quick call to emergency services</li>
          </ul>
          <p class="text-red-600 font-semibold mt-4">⚠️ Only use in real emergencies</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Activate SOS",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        activateSOS();
      }
    });
  };

  const activateSOS = async () => {
    setIsActivating(true);
    
    // Countdown before activation
    let count = 3;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        triggerSOS();
      }
    }, 1000);
  };

  const triggerSOS = async () => {
    try {
      // Collect all emergency data
      const emergencyData = {
        timestamp: new Date().toISOString(),
        location: location,
        userAgent: navigator.userAgent,
        // Add user info, ride details from context/session
      };

      // Send to backend
      const response = await fetch("http://localhost:4000/api/emergency/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emergencyData),
      });

      if (response.ok) {
        setSosActive(true);
        setIsActivating(false);
        
        Swal.fire({
          icon: "success",
          title: "SOS Activated!",
          html: `
            <p class="text-green-600 font-semibold">Emergency services have been notified</p>
            <p class="text-sm text-gray-600 mt-2">Your location is being shared</p>
          `,
          confirmButtonColor: "#DC2626",
        });
      }
    } catch (error) {
      console.error("SOS Error:", error);
      setIsActivating(false);
      
      Swal.fire({
        icon: "error",
        title: "Failed to activate SOS",
        text: "Please call emergency services directly",
        confirmButtonColor: "#DC2626",
      });
    }
  };

  const callEmergency = (number, service) => {
    Swal.fire({
      title: `Call ${service}?`,
      text: `Calling ${number}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      confirmButtonText: "Call Now",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = `tel:${number}`;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Emergency SOS
          </h1>
          <p className="text-gray-600">
            Quick access to emergency services and support
          </p>
        </div>

        {/* SOS Status */}
        {sosActive && (
          <div className="bg-red-600 text-white rounded-2xl p-6 mb-6 animate-pulse">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-bold">SOS ACTIVE</h2>
            </div>
            <p className="text-sm">Emergency services have been notified</p>
            <p className="text-sm">Your location is being shared</p>
          </div>
        )}

        {/* Main SOS Button */}
        {!sosActive && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center">
              {countdown !== null ? (
                <div className="mb-6">
                  <div className="text-6xl font-bold text-red-600 mb-2">
                    {countdown}
                  </div>
                  <p className="text-gray-600">Activating SOS...</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleSOSPress}
                    disabled={isActivating}
                    className="w-64 h-64 mx-auto bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="w-20 h-20 mb-4" />
                      <span className="text-3xl font-bold">SOS</span>
                      <span className="text-sm mt-2">Press for Emergency</span>
                    </div>
                  </button>
                  <p className="text-sm text-gray-500 mt-6">
                    Press and confirm to activate emergency services
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Emergency Contacts */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-600" />
            Emergency Contacts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => callEmergency("999", "Police")}
              className="flex items-center gap-3 p-4 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Police</div>
                <div className="text-sm text-gray-600">999</div>
              </div>
            </button>

            <button
              onClick={() => callEmergency("999", "Ambulance")}
              className="flex items-center gap-3 p-4 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Ambulance</div>
                <div className="text-sm text-gray-600">999</div>
              </div>
            </button>

            <button
              onClick={() => callEmergency("102", "Fire Service")}
              className="flex items-center gap-3 p-4 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Fire Service</div>
                <div className="text-sm text-gray-600">102</div>
              </div>
            </button>

            <button
              onClick={() => callEmergency("333", "Women Helpline")}
              className="flex items-center gap-3 p-4 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Women Helpline</div>
                <div className="text-sm text-gray-600">333</div>
              </div>
            </button>
          </div>
        </div>

        {/* Current Location */}
        {location && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              Your Current Location
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Latitude</p>
              <p className="font-mono text-gray-900 mb-3">{location.latitude}</p>
              <p className="text-sm text-gray-600 mb-1">Longitude</p>
              <p className="font-mono text-gray-900 mb-3">{location.longitude}</p>
              <a
                href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
              >
                <MapPin className="w-4 h-4" />
                View on Google Maps
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
