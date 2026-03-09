"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";
import axios from "axios";

let socket = null;

export const useNotifications = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";

  // Initialize socket connection with authentication
  useEffect(() => {
    if (!session?.user?.id || !session?.user?.role) return;

    // Only allow admin and supportAgent to connect
    if (session.user.role !== "admin" && session.user.role !== "supportAgent") {
      console.log("❌ Socket connection denied: User is not admin");
      return;
    }

    // Create socket connection if not exists
    if (!socket) {
      console.log("🔌 Attempting Socket connection to:", SOCKET_URL);
      socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 10,
        // ✅ Send authentication data
        auth: {
          token: session.user.id, // In production, use actual JWT token
          role: session.user.role,
          userId: session.user.id,
        },
      });

      socket.on("connect", () => {
        console.log("🔌 Socket connected:", socket.id);
        console.log("✅ Authenticated as:", session.user.role);
        setConnected(true);

        // Join user-specific notification room
        socket.emit("joinNotifications", session.user.id);
      });

      socket.on("joinedNotifications", (data) => {
        console.log("✅ Joined notification room:", data);
      });

      socket.on("disconnect", () => {
        console.log("🔌 Socket disconnected");
        setConnected(false);
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error.message);
        setConnected(false);
      });

      socket.on("error", (error) => {
        console.error("❌ Socket error:", error);
      });
    }

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      console.log("🔔 New notification received:", notification);

      // Add to notifications list
      setNotifications((prev) => [notification, ...prev]);

      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Optional: Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("OnWay Notification", {
          body: notification.message,
          icon: "/favicon.png",
        });
      }
    };

    socket.on("newNotification", handleNewNotification);

    // Cleanup
    return () => {
      if (socket) {
        socket.off("newNotification", handleNewNotification);
      }
    };
  }, [session, SOCKET_URL]);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/notifications`, {
          params: {
            userId: session.user.id,
            limit: 20,
          },
        });

        if (response.data.success) {
          setNotifications(response.data.data);
          setUnreadCount(response.data.unreadCount);
        }
      } catch (error) {
        console.error("Fetch notifications error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [session, API_URL]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        await axios.patch(`${API_URL}/notifications/${notificationId}/read`);

        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );

        // Decrement unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Mark as read error:", error);
      }
    },
    [API_URL]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      await axios.patch(`${API_URL}/notifications/mark-all-read`, {
        userId: session.user.id,
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all as read error:", error);
    }
  }, [session, API_URL]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        await axios.delete(`${API_URL}/notifications/${notificationId}`);

        // Update local state
        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notificationId)
        );

        // Decrement unread count if notification was unread
        const notification = notifications.find((n) => n._id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Delete notification error:", error);
      }
    },
    [API_URL, notifications]
  );

  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      await axios.delete(`${API_URL}/notifications/clear-all`, {
        params: { userId: session.user.id },
      });

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Clear all notifications error:", error);
    }
  }, [session, API_URL]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    connected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    requestNotificationPermission,
  };
};
