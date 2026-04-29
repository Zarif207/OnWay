"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getPassengerSocket } from "@/lib/socket";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Notification type → UI style mapping
export const NOTIF_STYLES = {
  RIDE_COMPLETED:              { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: "✅" },
  PAYMENT_SUCCESS:             { color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100",    icon: "💳" },
  PAYMENT_FAILED:              { color: "text-red-600",     bg: "bg-red-50",     border: "border-red-100",     icon: "❌" },
  BOOKING_CANCELLED_PASSENGER: { color: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-100",  icon: "🚫" },
  DRIVER_ASSIGNED:             { color: "text-primary",     bg: "bg-primary/5",  border: "border-primary/20",  icon: "🚗" },
  DRIVER_ARRIVED:              { color: "text-primary",     bg: "bg-primary/5",  border: "border-primary/20",  icon: "📍" },
};

export function usePassengerNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications]   = useState([]);
  const [unreadCount,   setUnreadCount]     = useState(0);
  const [loading,       setLoading]         = useState(true);

  const passengerId = session?.user?.id;

  // ── Fetch persisted notifications from DB ──────────────────────────────────
  useEffect(() => {
    if (!passengerId) { setLoading(false); return; }
    if (!/^[a-f\d]{24}$/i.test(passengerId)) { setLoading(false); return; }

    (async () => {
      try {
        const res = await axios.get(`${API_URL}/notifications`, {
          params: { userId: passengerId, limit: 30 },
        });
        if (res.data.success) {
          // Only show passenger-role notifications
          const passengerNotifs = (res.data.data || []).filter(
            (n) => !n.role || n.role === "passenger"
          );
          setNotifications(passengerNotifs);
          setUnreadCount(passengerNotifs.filter((n) => !n.isRead).length);
        }
      } catch (err) {
        console.error("Failed to fetch passenger notifications:", err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [passengerId]);

  // ── Real-time socket listener ──────────────────────────────────────────────
  useEffect(() => {
    if (!passengerId) return;

    const socket = getPassengerSocket(passengerId);

    // Ensure the passenger is in both room formats
    const ensureRooms = () => {
      socket.emit("joinNotifications", passengerId);   // joins user_<id>
      socket.emit("joinRoom", { roomId: `passenger:${passengerId}` }); // joins passenger:<id>
    };

    if (socket.connected) {
      ensureRooms();
    } else {
      socket.once("connect", ensureRooms);
    }

    const handleNotification = (notif) => {
      console.log("🔔 passenger:notification received:", notif);
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("passenger:notification", handleNotification);
    return () => {
      socket.off("passenger:notification", handleNotification);
      socket.off("connect", ensureRooms);
    };
  }, [passengerId]);

  // ── Mark single as read ────────────────────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("markAsRead error:", err.message);
    }
  }, []);

  // ── Mark all as read ───────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    if (!passengerId) return;
    try {
      await axios.patch(`${API_URL}/notifications/mark-all-read`, { userId: passengerId });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("markAllAsRead error:", err.message);
    }
  }, [passengerId]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
