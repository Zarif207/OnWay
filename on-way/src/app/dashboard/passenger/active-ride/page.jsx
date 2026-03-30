"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MapPin,
  Phone,
  MessageCircle,
  ShieldAlert,
  Share2,
  Car,
  Clock,
  Star,
  Loader2,
  ChevronLeft,
  CheckCircle2,
  XCircle
} from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const LiveTrackingMap = dynamic(() => import("./_components/LiveTrackingMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-3xl flex items-center justify-center">
    <Loader2 className="animate-spin text-primary" size={32} />
  </div>
});

function ActiveRideContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | searching | accepted | started | completed | cancelled
  const [loading, setLoading] = useState(true);

  // 1. Fetch Booking Initial State
  useEffect(() => {
    if (!bookingId) {
      router.push("/onway-book");
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`);
        if (res.data.success) {
          setBooking(res.data.booking);
          setStatus(res.data.booking.bookingStatus);
        }
      } catch (error) {
        toast.error("Failed to load ride details");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // 2. Socket Synchronization
  const { socket, on, off, emit } = useSocket('user');

  useEffect(() => {
    if (!bookingId || !socket) return;

    const onRideAccepted = (data) => {
      console.log("🚕 [RIDE ACCEPTED]", data);
      if (data.bookingId === bookingId || data.rideId === bookingId) {
        setStatus("accepted");
        setBooking(prev => ({
          ...prev,
          riderId: data.riderId || data.driverId,
          driverInfo: data.driver,
          otp: data.otp || prev?.otp
        }));
        toast.success("Driver found!");
        emit("join:room", { room: `ride:${bookingId}` });
      }
    };

    const onLocationUpdate = (data) => {
      console.log("📍 [LOCATION UPDATE]", data);
      if (data.rideId === bookingId || data.bookingId === bookingId) {
        // Handle both lat/lng (old) and latitude/longitude (new) formats
        const lat = data.latitude || data.lat;
        const lng = data.longitude || data.lng;
        if (lat && lng) {
          setDriverLocation([lat, lng]);
        }
        if (data.eta) setEta(data.eta);
        if (data.distance) setDistance(data.distance);
      }
    };

    const onRiderLocationUpdate = (data) => {
      console.log("🚗 [RIDER LOCATION]", data);
      if (data.rideId === bookingId || data.bookingId === bookingId) {
        const lat = data.latitude || data.lat;
        const lng = data.longitude || data.lng;
        if (lat && lng) {
          setDriverLocation([lat, lng]);
        }
        if (data.eta) setEta(data.eta);
        if (data.distance) setDistance(data.distance);
      }
    };

    const onDriverLocationUpdate = (data) => {
      console.log("📡 [DRIVER LIVE TRACKING]", data);
      if (data.rideId === bookingId || data.bookingId === bookingId) {
        setDriverLocation([data.latitude, data.longitude]);
        if (data.eta) setEta(data.eta);
        if (data.distance) setDistance(data.distance);
      }
    };

    const onRiderArrived = (data) => {
      console.log("✅ [RIDER ARRIVED]", data);
      if (data.rideId === bookingId || data.bookingId === bookingId) {
        setStatus("arrived");
        toast.success(data.message || "Driver has arrived!");
      }
    };

    const handleStatusUpdate = (data) => {
      if (data.bookingId === bookingId || !data.bookingId) {
        if (data.status) setStatus(data.status);
      }
    };

    on("ride:accepted", onRideAccepted);
    on("rideAccepted", onRideAccepted);
    on("driver:location:updated", onLocationUpdate);
    on("riderLocationUpdate", onRiderLocationUpdate);
    on("driver-location-update", onDriverLocationUpdate);
    on("riderArrived", onRiderArrived);
    on("driver:arrived", (data) => {
      if (data.bookingId === bookingId || data.rideId === bookingId) {
        setStatus("arrived");
        toast.success("Driver has arrived!");
      }
    });

    on("ride:started", (data) => {
      if (data.bookingId === bookingId || data.rideId === bookingId) {
        setStatus("started");
        toast.success("Ride started!");
      }
    });

    on("ride:completed", (data) => {
      if (data.bookingId === bookingId || data.rideId === bookingId) {
        setStatus("completed");
        toast.success("Ride completed!");
      }
    });

    on("ride:status:updated", handleStatusUpdate);

    // Initial Join
    emit("join:room", { room: `ride:${bookingId}` });

    return () => {
      off("ride:accepted", onRideAccepted);
      off("rideAccepted", onRideAccepted);
      off("driver:location:updated", onLocationUpdate);
      off("riderLocationUpdate", onRiderLocationUpdate);
      off("driver-location-update", onDriverLocationUpdate);
      off("riderArrived", onRiderArrived);
    };
  }, [bookingId, socket, emit, on, off]);

  // 3. Passenger Live Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPassengerLocation([latitude, longitude]);
      },
      (error) => {
        console.error("Passenger Geolocation Error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleSOS = async () => {
    try {
      await axios.post(`${API_BASE_URL}/emergency/sos`, {
        userId: session.user.id,
        userRole: "user",
        location: driverLocation || [booking?.pickupLocation?.lat, booking?.pickupLocation?.lng]
      });
      toast.error("SOS Alert Sent! Authorities have been notified.", { duration: 5000 });
    } catch (error) {
      toast.error("Failed to send SOS. Please call emergency services.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-gray-500 font-bold uppercase tracking-widest">Initializing tracking...</p>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-[3rem] shadow-xl border border-gray-100">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <XCircle size={48} />
        </div>
        <h2 className="text-4xl font-black text-secondary mb-4 tracking-tighter">No Drivers Found</h2>
        <p className="text-gray-500 font-medium mb-8 max-w-md">We couldn't find a driver for your request within 60 seconds. Please try again or choose a different vehicle type.</p>
        <button onClick={() => router.push('/onway-book')} className="px-10 py-5 bg-[#011421] text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-2xl">
          Try Again
        </button>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-[3rem] shadow-xl border border-gray-100">
        <div className="w-24 h-24 bg-green-100 text-[#2FCA71] rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-4xl font-black text-secondary mb-4 tracking-tighter">Ride Finished!</h2>
        <p className="text-gray-500 font-medium mb-8 max-w-md">How was your trip with Michael Johnson? Your feedback helps us improve.</p>
        <button onClick={() => router.push('/dashboard/passenger/ride-history')} className="px-10 py-5 bg-secondary text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-[#011421] transition-colors shadow-2xl">
          Rate & Review
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-secondary transition-colors shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tighter">Ride in Progress</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">ID: #{bookingId?.slice(-6).toUpperCase()}</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${status === 'searching' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
          status === 'accepted' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
            status === 'arrived' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
              'bg-green-50 text-green-600 border border-green-200'
          }`}>
          {status === 'searching' ? 'Finding Driver' : status === 'arrived' ? 'Driver Arriving Soon' : status.toUpperCase()}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* MAP SECTION */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden h-[500px] relative group transition-all">
            <LiveTrackingMap
              pickup={[booking.pickupLocation.lat, booking.pickupLocation.lng]}
              dropoff={[booking.dropoffLocation.lat, booking.dropoffLocation.lng]}
              driverLocation={driverLocation}
              passengerLocation={passengerLocation}
              eta={eta}
              distance={distance}
            />
            {status === 'searching' && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 border-8 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={32} />
                </div>
                <h3 className="text-3xl font-black text-secondary mb-2 tracking-tighter">Seeking Nearby Drivers</h3>
                <p className="text-gray-500 max-w-xs font-medium">Please stay on this page. We're matching you with the best available driver.</p>
              </div>
            )}
          </div>

          {/* STATUS CARDS */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldAlert size={60} />
              </div>
              <div className="h-20 w-20 rounded-[1.8rem] bg-secondary text-white flex items-center justify-center shadow-2xl shadow-secondary/20">
                <span className="text-2xl font-black">OTP</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Safety Code</p>
                <div className="flex gap-2">
                  {booking?.otp?.split('').map((digit, i) => (
                    <div key={i} className="w-8 h-10 bg-gray-50 rounded-lg flex items-center justify-center font-black text-secondary border border-gray-100 italic">
                      {digit}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
              <div className="h-20 w-20 rounded-[1.8rem] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/20">
                <Car size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                <p className="text-lg font-black text-secondary tracking-tight line-clamp-1">{booking.dropoffLocation.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          {/* DRIVER INFO */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
            {status === 'searching' && <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[2px] z-10" />}
            <h3 className="text-lg font-black text-secondary uppercase tracking-widest mb-6">Driver Info</h3>

            <div className="flex items-center gap-6 mb-8">
              <div className="h-24 w-24 rounded-[2rem] bg-gray-50 border-4 border-white shadow-xl flex items-center justify-center relative overflow-hidden">
                {status === 'searching' ? (
                  <Car size={40} className="text-gray-300" />
                ) : (
                  <img
                    src={booking?.driverInfo?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking?.driverInfo?.name || 'Driver'}`}
                    className="h-full w-full object-cover"
                    alt="Driver"
                  />
                )}
                <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-white font-black text-xs">
                  {booking?.driverInfo?.rating || "4.9"}
                </div>
              </div>
              <div>
                <h4 className="text-2xl font-black text-secondary tracking-tighter">
                  {status === 'searching' ? 'Driver TBD' : (booking?.driverInfo?.name || 'Driver')}
                </h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#2FCA71]">Elite Partner</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Vehicle</p>
                <p className="font-bold text-secondary text-xs uppercase">
                  {booking?.driverInfo?.vehicle?.type || booking?.vehicleType || "Ride"} • {booking?.driverInfo?.vehicle?.brand || "Toyota"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Plate</p>
                <p className="font-bold text-secondary text-xs uppercase">
                  {booking?.driverInfo?.vehicle?.plate || "DHK-R 5678"}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 h-16 rounded-2xl bg-secondary text-white flex items-center justify-center hover:bg-[#011421] transition-transform active:scale-95 shadow-xl shadow-secondary/10">
                <Phone size={20} />
              </button>
              <button className="flex-1 h-16 rounded-2xl bg-white border border-gray-100 text-secondary flex items-center justify-center hover:bg-gray-50 transition-transform active:scale-95 shadow-sm">
                <MessageCircle size={20} />
              </button>
            </div>
          </div>

          {/* SAFETY & ACTIONS */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-secondary uppercase tracking-widest mb-6 text-center">Safety Shield</h3>
            <div className="space-y-4">
              <button
                onClick={handleSOS}
                className="w-full h-20 bg-red-500 text-white rounded-[2rem] flex items-center justify-center gap-4 font-black uppercase tracking-widest hover:bg-red-600 shadow-2xl shadow-red-500/20 active:scale-95 transition-all"
              >
                <ShieldAlert size={28} />
                Panic Button (SOS)
              </button>
              <button className="w-full h-16 bg-white border border-gray-100 rounded-[1.5rem] flex items-center justify-center gap-3 font-black text-gray-500 uppercase tracking-widest hover:bg-gray-50 transition-colors">
                <Share2 size={18} />
                Share Trip
              </button>
            </div>
          </div>

          {/* RIDE SUMMARY */}
          <div className="bg-secondary p-8 rounded-[3rem] text-white shadow-2xl shadow-secondary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Car size={80} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 opacity-60">Ride Summary</h3>
            <div className="space-y-4 relative z-10">
              <div className="pb-4 border-b border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Your Fare</p>
                <p className="text-3xl font-black tracking-tighter">৳{booking.price}</p>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-black uppercase tracking-widest opacity-60">Payment</span>
                <span className="font-black uppercase tracking-widest">{booking.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* CANCEL BUTTON */}
          {status === 'searching' && (
            <button className="w-full h-16 bg-white border border-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center gap-2 font-black uppercase tracking-widest hover:bg-red-50 transition-colors">
              <XCircle size={18} />
              Cancel Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ActiveRide() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    }>
      <ActiveRideContent />
    </Suspense>
  );
}