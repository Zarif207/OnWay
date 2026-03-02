"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  Bike,
  Users,
  DollarSign,
  Tag,
  Loader2,
  AlertCircle
} from "lucide-react";

// Dynamically import RideMap
const RideMap = dynamic(() => import("@/components/Map/RideMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-2xl animate-pulse">
      <span className="text-gray-500 font-medium tracking-wide">Loading Route Map...</span>
    </div>
  ),
});

export default function PassengerBookRide() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [selectedVehicle, setSelectedVehicle] = useState("sedan");
  const [scheduleType, setScheduleType] = useState("now");
  const [promoCode, setPromoCode] = useState("");
  
  // States for autofill
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fare, setFare] = useState(0);
  const [routeGeometry, setRouteGeometry] = useState([]);
  
  const [loading, setLoading] = useState(!!bookingId);
  const [error, setError] = useState("");

  const vehicleTypes = [
    { id: "bike", name: "OnWay Bike", icon: Bike, base: 8.5 },
    { id: "sedan", name: "OnWay Sedan", icon: Car, base: 12.5 },
    { id: "suv", name: "OnWay SUV", icon: Car, base: 18.75 },
    { id: "share", name: "OnWay Share", icon: Users, base: 6.5 },
  ];

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;

      setLoading(true);
      setError("");

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
        const response = await fetch(`${apiUrl}/bookings/${bookingId}`);
        const result = await response.json();

        if (result.success) {
          const b = result.booking;
          setPickupLocation({
            lat: b.pickupLocation.lat,
            lon: b.pickupLocation.lng,
            name: b.pickupLocation.name
          });
          setDropoffLocation({
            lat: b.dropoffLocation.lat,
            lon: b.dropoffLocation.lng,
            name: b.dropoffLocation.name
          });
          setDistance(b.distance);
          setDuration(b.duration);
          setFare(b.price);
          // Convert routeGeometry back to [lat, lng] arrays for RideMap
          setRouteGeometry(b.routeGeometry.map(coord => [coord.lat, coord.lng]));
        } else {
          setError(result.message || "Failed to load booking details.");
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("An error occurred while fetching your ride details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const selected = vehicleTypes.find((v) => v.id === selectedVehicle);
  const displayFare = fare > 0 ? fare : (selected.base + distance * 1.2).toFixed(2);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-black animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your ride details...</p>
        </div>
      </div>
    );
  }

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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

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
                    value={pickupLocation?.name || ""}
                    readOnly
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD600] bg-gray-50"
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Drop-off location"
                    value={dropoffLocation?.name || ""}
                    readOnly
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD600] bg-gray-50"
                  />
                </div>
              </div>

              {/* Real Route Map */}
              <div className="mt-6 h-96 rounded-xl overflow-hidden border border-gray-200 relative z-0">
                <RideMap 
                  pickup={pickupLocation} 
                  dropoff={dropoffLocation} 
                  routeGeometry={routeGeometry}
                  durationMin={duration}
                />
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
              Confirm Booking
            </button>

          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">
                Ride Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Distance</span>
                  <span className="font-semibold">
                    {distance} km
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-semibold">
                    {duration} min
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="font-semibold">
                    {selected.name}
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-gray-100 text-lg">
                  <span className="font-semibold text-black">
                    Estimated Fare
                  </span>
                  <span className="font-bold text-black">
                    {displayFare} ৳
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
