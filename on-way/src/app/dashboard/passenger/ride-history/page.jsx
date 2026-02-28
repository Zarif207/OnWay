"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { MapPin, Calendar, Star, Download, AlertCircle, X } from "lucide-react";
import AddReviewForm from "../addReviewForm/addReviewForm";

function Card({ children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      {children}
    </div>
  );
}

function Button({ children, variant = "primary", onClick, className }) {
  const base = "px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center";
  const styles = {
    primary: "bg-[#011421] text-white hover:opacity-90",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
  };
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

export default function RideHistory() {
  const [filter, setFilter] = useState("all");
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const res = await axios.get(`${apiUrl}/rides`);

        if (res.data.success) {
          setRides(res.data.data);
        }
      } catch (err) {
        console.error("Axios Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  const filteredRides = filter === "all" ? rides : rides.filter((r) => r.status === filter);

  if (loading) return <div className="text-center py-20">Loading your journey...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#011421]">Ride History</h1>
          <p className="text-gray-600 mt-2">View past rides and share your experience.</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-8">
          {["all", "completed", "cancelled"].map((type) => (
            <Button
              key={type}
              variant={filter === type ? "primary" : "outline"}
              onClick={() => setFilter(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>

        {/* Ride Cards */}
        <div className="space-y-6">
          {filteredRides.map((ride) => (
            <Card key={ride.id || ride._id}>
              <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-semibold text-lg text-[#011421]">Ride #{ride.id || ride._id?.slice(-6)}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${ride.status === "completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {ride.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-orange-500 mt-1" />
                      <p className="text-sm text-gray-700">{ride.pickupLocation}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-green-600 mt-1" />
                      <p className="text-sm text-gray-700">{ride.dropLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Right Side Actions */}
                <div className="lg:text-right space-y-3">
                  <p className="text-2xl font-bold text-gray-900">${ride.fare}</p>

                  {ride.status === "completed" && (
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {!ride.rating ? (
                        <Button
                          variant="primary"
                          onClick={() => setSelectedRide(ride)}
                          className="bg-yellow-400 text-black hover:bg-yellow-500"
                        >
                          <Star className="w-4 h-4 mr-2" /> Rate Driver
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1 text-yellow-500 font-bold">
                          {ride.rating} <Star className="w-4 h-4 fill-current" />
                          <span className="text-gray-400 text-xs ml-2">(Reviewed)</span>
                        </div>
                      )}

                      <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Receipt</Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* --- REVIEW MODAL --- */}
        {selectedRide && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedRide(null)} />
            <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-300">
              <button
                onClick={() => setSelectedRide(null)}
                className="absolute top-5 right-5 text-white flex items-center gap-1 hover:text-yellow-400"
              >
                <X className="w-6 h-6" /> Close
              </button>

              <AddReviewForm
                rideId={selectedRide.id || selectedRide._id}
                driverId={selectedRide.driverId}
                passengerId={selectedRide.passengerId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}