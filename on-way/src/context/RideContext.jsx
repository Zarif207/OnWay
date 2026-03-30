"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const RideContext = createContext();

const MOCK_DRIVERS = [
  { id: 1, name: "Rahim", car: "Toyota Axio", plate: "DHK-12-3456", rating: 4.8, phone: "+8801700000001", avatar: "adventurer/svg?seed=Felix", vehicleType: "car", color: "#259461" },
  { id: 2, name: "Karim", car: "Honda Fit", plate: "DHK-56-7890", rating: 4.7, phone: "+8801700000002", avatar: "adventurer/svg?seed=Aneka", vehicleType: "suv", color: "#0a1f3d" },
  { id: 3, name: "Sakib", car: "Nissan Sunny", plate: "DHK-23-4567", rating: 4.9, phone: "+8801700000003", avatar: "adventurer/svg?seed=Jack", vehicleType: "bike", color: "#2cbe6b" },
  { id: 4, name: "Dr. Asif", car: "Emergency Unit", plate: "AMB-99-1122", rating: 5.0, phone: "+8801700000004", avatar: "adventurer/svg?seed=Doc", vehicleType: "ambulance", color: "#e11d48" }
];

export const RideProvider = ({ children }) => {
  const [rideStatus, setRideStatus] = useState("idle");
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState([]);
  const [otp, setOtp] = useState("");
  const [fare, setFare] = useState(0);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [rideType, setRideType] = useState("classic");
  const [isPaid, setIsPaid] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  // Load from localStorage on mount & AUTO-SYNC with Backend
  useEffect(() => {
    const savedRide = localStorage.getItem("onway_current_ride");
    if (savedRide) {
      const data = JSON.parse(savedRide);
      setRideStatus(data.rideStatus);
      setPickup(data.pickup);
      setDropoff(data.dropoff);
      setAssignedDriver(data.assignedDriver);
      setRouteGeometry(data.routeGeometry || []);
      setOtp(data.otp);
      setFare(data.fare);
      setDuration(data.duration);
      setDistance(data.distance);
      setRideType(data.rideType || "classic");
      setIsPaid(data.isPaid || false);
      setBookingId(data.bookingId || null);

      // --- AUTO-SYNC: If ride is not marked as paid, check backend immediately ---
      if (data.bookingId && !data.isPaid) {
        checkPaymentStatus(data.bookingId);
      }
    }
  }, []);

  // Sync with localStorage
  useEffect(() => {
    if (rideStatus !== "idle") {
      const rideData = {
        rideStatus, pickup, dropoff, assignedDriver,
        routeGeometry, otp, fare, duration, distance, rideType, isPaid, bookingId
      };
      localStorage.setItem("onway_current_ride", JSON.stringify(rideData));
    } else if (isPaid === false && bookingId) {
      // Keep context if unpaid but ride cleared (important for dashboard enforcement)
      const rideData = {
        rideStatus: "completed", pickup, dropoff, assignedDriver,
        routeGeometry, otp, fare, duration, distance, rideType, isPaid, bookingId
      };
      localStorage.setItem("onway_current_ride", JSON.stringify(rideData));
    } else {
      localStorage.removeItem("onway_current_ride");
    }
  }, [rideStatus, pickup, dropoff, assignedDriver, routeGeometry, otp, fare, duration, distance, rideType, isPaid, bookingId]);

  const startSearching = (details) => {
    setPickup(details.pickup);
    setDropoff(details.dropoff);
    setRouteGeometry(details.routeGeometry);
    setFare(details.fare);
    setDuration(details.duration);
    setDistance(details.distance);
    setRideType(details.rideType);
    setBookingId(details.bookingId || null);
    setRideStatus("searching");
    setIsPaid(false);
  };

  const setMatched = (driverData) => {
    const driver = driverData || MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
    setAssignedDriver(driver);
    setRideStatus("accepted");
    // Use driver's OTP if provided, otherwise generate one
    if (driver.otp) {
      setOtp(driver.otp);
    } else {
      setOtp(Math.floor(1000 + Math.random() * 9000).toString());
    }
  };

  const setArriving = () => setRideStatus("arriving");

  const setOtpPending = () => setRideStatus("otp_pending");

  const verifyOtp = () => setRideStatus("ongoing");

  const completeRide = () => setRideStatus("completed");

  const markAsPaid = () => {
    // Save bookingId so payment success page can redirect to active-ride
    if (bookingId) localStorage.setItem("onway_pending_bookingId", bookingId);
    const params = new URLSearchParams();
    if (bookingId) params.set("bookingId", bookingId);
    if (fare) params.set("amount", fare);
    window.location.href = `/payment?${params.toString()}`;
  };

  const checkPaymentStatus = async (id) => {
    const checkId = id || bookingId;
    if (!checkId) return null;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const res = await axios.get(`${API_BASE_URL}/bookings/${checkId}`);
      if (res.data.success && res.data.booking) {
        const backendStatus = res.data.booking.paymentStatus;
        if (backendStatus === "paid") {
          setIsPaid(true);
          // Sync localStorage immediately so other components/layouts see it
          const saved = localStorage.getItem("onway_current_ride");
          if (saved) {
            const data = JSON.parse(saved);
            data.isPaid = true;
            localStorage.setItem("onway_current_ride", JSON.stringify(data));
          }
        }
        return backendStatus;
      }
    } catch (err) {
      console.error("Error checking payment status:", err);
    }
    return null;
  };

  const cancelRide = () => {
    setRideStatus("idle");
    setPickup(null);
    setDropoff(null);
    setAssignedDriver(null);
    setRouteGeometry([]);
    setOtp("");
    setFare(0);
    setIsPaid(false);
  };

  return (
    <RideContext.Provider value={{
      rideStatus, pickup, dropoff, assignedDriver, routeGeometry, otp, fare, duration, distance, rideType, isPaid, bookingId,
      startSearching, setMatched, setArriving, setOtpPending, verifyOtp, completeRide, markAsPaid, cancelRide, setIsPaid,
      checkPaymentStatus, MOCK_DRIVERS
    }}>
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => {
  const context = useContext(RideContext);
  if (!context) throw new Error("useRide must be used within a RideProvider");
  return context;
};
