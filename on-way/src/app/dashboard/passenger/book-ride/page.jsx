"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import {
  MapPin, Calendar, Clock, Car, Bike, Users, DollarSign, Tag, Loader2, AlertCircle, CheckCircle2
} from "lucide-react";

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
  const [promoCode, setPromoCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
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
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiUrl}/bookings/${bookingId}`);
        const result = await response.json();

        if (result.success) {
          const b = result.booking;
          setPickupLocation({ lat: b.pickupLocation.lat, lon: b.pickupLocation.lng, name: b.pickupLocation.name });
          setDropoffLocation({ lat: b.dropoffLocation.lat, lon: b.dropoffLocation.lng, name: b.dropoffLocation.name });
          setDistance(b.distance);
          setDuration(b.duration);
          setFare(b.price);
          setRouteGeometry(b.routeGeometry.map(coord => [coord.lat, coord.lng]));
        }
      } catch (err) {
        setError("An error occurred while fetching ride details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setIsApplying(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const currentFare = fare > 0 ? fare : (vehicleTypes.find(v => v.id === selectedVehicle).base + distance * 1.2);

      const response = await axios.post(`${apiUrl}/promo/apply`, {
        code: promoCode,
        rideAmount: currentFare
      });

      if (response.data.success) {
        setAppliedPromo(response.data);
        Swal.fire({
          icon: 'success',
          title: 'Promo Applied!',
          text: `You saved ${response.data.discount} ৳`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      setAppliedPromo(null);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.response?.data?.message || "Invalid Promo Code",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const selected = vehicleTypes.find((v) => v.id === selectedVehicle);
  const baseFare = fare > 0 ? fare : (selected.base + distance * 1.2);
  const finalFare = appliedPromo ? appliedPromo.finalAmount : baseFare;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#F4F5F7] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Book a Ride</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">

            {/* Map Section (Keep as it was) */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold mb-6">Where to?</h3>
              <div className="space-y-4 mb-6">
                <input type="text" value={pickupLocation?.name || ""} readOnly className="w-full pl-4 py-3 border rounded-lg bg-gray-50" />
                <input type="text" value={dropoffLocation?.name || ""} readOnly className="w-full pl-4 py-3 border rounded-lg bg-gray-50" />
              </div>
              <div className="h-96 rounded-xl overflow-hidden border z-0">
                <RideMap pickup={pickupLocation} dropoff={dropoffLocation} routeGeometry={routeGeometry} durationMin={duration} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <h3 className="text-xl font-semibold mb-6">Choose your ride</h3>
              <div className="space-y-3">
                {vehicleTypes.map((vehicle) => (
                  <div key={vehicle.id} onClick={() => { setSelectedVehicle(vehicle.id); setAppliedPromo(null); }}
                    className={`p-4 border-2 rounded-xl cursor-pointer ${selectedVehicle === vehicle.id ? "border-[#2FCA71] bg-green-50" : "border-gray-200"}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <vehicle.icon className="w-6 h-6" />
                        <h4 className="font-semibold">{vehicle.name}</h4>
                      </div>
                      <span className="font-bold">${vehicle.base.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* UPDATED PROMO SECTION */}
            <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-6">Promo Code</h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code (e.g. SAVE50)"
                    disabled={appliedPromo}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] uppercase font-mono"
                  />
                </div>
                {appliedPromo ? (
                  <button onClick={() => { setAppliedPromo(null); setPromoCode(""); }} className="px-4 py-2 text-red-500 font-medium">Remove</button>
                ) : (
                  <button
                    onClick={handleApplyPromo}
                    disabled={isApplying || !promoCode}
                    className="bg-black text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-400"
                  >
                    {isApplying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Apply"}
                  </button>
                )}
              </div>
              {appliedPromo && (
                <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Success! You saved {appliedPromo.discount} ৳ with code {promoCode}</span>
                </div>
              )}
            </div>

            <button className="w-full bg-[#2FCA71] text-black font-semibold py-4 rounded-xl hover:opacity-90">
              Confirm Booking
            </button>
          </div>

          {/* RIGHT SIDE - SUMMARY */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Ride Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Base Fare</span>
                  <span>{baseFare.toFixed(2)} ৳</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Promo Discount</span>
                    <span>-{appliedPromo.discount.toFixed(2)} ৳</span>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-gray-100 text-xl font-bold text-black">
                  <span>Total Payable</span>
                  <span>{finalFare.toFixed(2)} ৳</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}