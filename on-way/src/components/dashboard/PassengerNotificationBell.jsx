"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePassengerNotifications, NOTIF_STYLES } from "@/hooks/usePassengerNotifications";

export default function PassengerNotificationBell() {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    usePassengerNotifications();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatTime = (date) => {
    if (!date) return "";
    const secs = Math.floor((Date.now() - new Date(date)) / 1000);
    if (secs < 60)   return "Just now";
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          open ? "bg-primary/10 text-primary" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
        }`}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[120]"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-black text-gray-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-black uppercase tracking-wider text-primary hover:opacity-70 transition-opacity"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto">
              {loading ? (
                <div className="py-10 flex justify-center">
                  <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 px-6 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Bell className="text-gray-300" size={22} />
                  </div>
                  <p className="text-sm font-bold text-gray-900">All caught up!</p>
                  <p className="text-xs text-gray-400 mt-1">No new notifications.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const style = NOTIF_STYLES[notif.type] || NOTIF_STYLES.RIDE_COMPLETED;
                  return (
                    <div
                      key={notif._id}
                      onClick={() => !notif.isRead && markAsRead(notif._id)}
                      className={`p-4 flex gap-3 transition-all hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 ${
                        !notif.isRead ? "bg-primary/5" : ""
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-base ${style.bg} border ${style.border}`}>
                        {style.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!notif.isRead ? "font-bold text-gray-900" : "text-gray-600"}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
                          {formatTime(notif.createdAt)}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
