"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    Car,
    Wallet,
    Gift,
    ShieldAlert,
    CheckCircle2,
    AlertCircle,
    Clock,
    CheckCheck,
    X
} from "lucide-react";

// --- Mock Data Structure ---
// In the future, replace this initial state with a `useQuery` fetch to your backend `/api/riders/notifications`
const INITIAL_NOTIFICATIONS = [
    {
        id: "notif_1",
        type: "ride",
        title: "New Ride Request",
        message: "Passenger John Doe requested a ride from Central Park to Times Square.",
        timestamp: "2 mins ago",
        isRead: false,
    },
    {
        id: "notif_2",
        type: "payment",
        title: "Payment Received",
        message: "$45.50 has been credited to your wallet for Trip #9281.",
        timestamp: "1 hour ago",
        isRead: false,
    },
    {
        id: "notif_3",
        type: "bonus",
        title: "Weekly Quest Completed! 🏆",
        message: "Congratulations! You completed 50 rides this week. A $100 bonus has been applied.",
        timestamp: "5 hours ago",
        isRead: true,
    },
    {
        id: "notif_4",
        type: "system",
        title: "System Maintenance",
        message: "The OnWay app will undergo routine maintenance at 2:00 AM EST. Please anticipate brief outages.",
        timestamp: "1 day ago",
        isRead: true,
    },
    {
        id: "notif_5",
        type: "ride",
        title: "Ride Cancelled",
        message: "Passenger Sarah canceled the trip to Brooklyn Bridge.",
        timestamp: "1 day ago",
        isRead: true,
    }
];

const FILTER_TABS = [
    { id: "all", label: "All" },
    { id: "ride", label: "Ride Updates" },
    { id: "payment", label: "Payments" },
    { id: "bonus", label: "Bonuses" },
    { id: "system", label: "System" }
];

// Helper to pick icons & colors based on notification type
const getNotificationStyles = (type) => {
    switch (type) {
        case "ride": return { icon: Car, bg: "bg-blue-100", color: "text-blue-600" };
        case "payment": return { icon: Wallet, bg: "bg-green-100", color: "text-green-600" };
        case "bonus": return { icon: Gift, bg: "bg-purple-100", color: "text-purple-600" };
        case "system": return { icon: ShieldAlert, bg: "bg-orange-100", color: "text-orange-600" };
        default: return { icon: Bell, bg: "bg-gray-100", color: "text-gray-600" };
    }
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [activeTab, setActiveTab] = useState("all");
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Escape listener for Modal
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setSelectedNotification(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Filter Logic
    const filteredNotifications = useMemo(() => {
        if (activeTab === "all") return notifications;
        return notifications.filter(notif => notif.type === activeTab);
    }, [notifications, activeTab]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Actions
    const handleMarkAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleOpenNotification = (notif) => {
        handleMarkAsRead(notif.id);
        setSelectedNotification(notif);
    };

    return (
        <div className="max-w-[1000px] mx-auto pb-24 pt-4 px-4 xl:px-0 space-y-8">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-12 bg-primary rounded-full" />
                        <span className="text-xs font-black text-primary uppercase tracking-[0.4em]">Inbox</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-secondary">
                        Notifications
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        You have {unreadCount} unread message{unreadCount !== 1 && 's'}
                    </p>
                </div>

                <button
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-black uppercase tracking-wider transition-all
                        ${unreadCount > 0
                            ? "bg-primary/10 text-primary hover:bg-primary hover:text-white active:scale-95"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"}
                    `}
                >
                    <CheckCheck size={18} />
                    Mark All as Read
                </button>
            </header>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">

                {/* Filter Tabs (Horizontal Scroll on Mobile) */}
                <div className="border-b border-gray-100 p-4 md:p-6 pb-0 overflow-x-auto hide-scrollbar">
                    <div className="flex items-center gap-2 md:gap-4 pb-4 md:pb-6 min-w-max">
                        {FILTER_TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative px-6 py-3 rounded-full text-sm font-black uppercase tracking-wider transition-all
                                        ${isActive
                                            ? "text-white shadow-md shadow-primary/20"
                                            : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-secondary"}
                                    `}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeFilterTab"
                                            className="absolute inset-0 bg-primary rounded-full z-0"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="p-4 md:p-8 min-h-[400px]">
                    <AnimatePresence mode="popLayout">
                        {filteredNotifications.length > 0 ? (
                            <div className="space-y-4">
                                {filteredNotifications.map((notif) => {
                                    const styles = getNotificationStyles(notif.type);

                                    return (
                                        <motion.div
                                            key={notif.id}
                                            layout
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            onClick={() => handleOpenNotification(notif)}
                                            className={`group relative flex flex-col md:flex-row gap-4 md:gap-6 p-5 md:p-6 rounded-[2rem] border transition-all duration-300
                                                ${notif.isRead
                                                    ? 'bg-gray-50 border-gray-100'
                                                    : 'bg-white border-primary/20 shadow-sm hover:shadow-md cursor-pointer'}
                                            `}
                                        >
                                            {/* Unread dot indicator */}
                                            {!notif.isRead && (
                                                <div className="absolute top-6 right-6 h-3 w-3 bg-primary rounded-full shadow-[0_0_10px_rgba(37,148,97,0.5)] animate-pulse" />
                                            )}

                                            {/* Icon */}
                                            <div className={`shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${styles.bg}`}>
                                                <styles.icon size={24} className={styles.color} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-grow space-y-2 pr-8">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4">
                                                    <h3 className={`text-lg font-black tracking-tight ${notif.isRead ? 'text-gray-600' : 'text-secondary'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">
                                                        <Clock size={12} />
                                                        {notif.timestamp}
                                                    </span>
                                                </div>
                                                <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-gray-500 font-medium' : 'text-gray-600 font-bold'}`}>
                                                    {notif.message}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            // Empty State
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4"
                            >
                                <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                    <Bell size={40} className="text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-black text-secondary tracking-tight">All Caught Up</h3>
                                <p className="text-gray-500 max-w-sm">
                                    You have no notifications matching this filter category.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Notification Details Modal via Portal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {selectedNotification && (
                        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                            {/* Backdrop Blur Overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedNotification(null)}
                                className="absolute inset-0 bg-[#011421]/60 backdrop-blur-sm"
                            />

                            {/* Modal Container */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white rounded-[2.5rem] p-6 md:p-10 w-full max-w-xl shadow-2xl flex flex-col gap-6"
                                role="dialog"
                                aria-modal="true"
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            {(() => {
                                                const styles = getNotificationStyles(selectedNotification.type);
                                                return (
                                                    <div className={`h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100`}>
                                                        <styles.icon size={20} className={styles.color} />
                                                    </div>
                                                );
                                            })()}
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                                {selectedNotification.type === "ride" ? "Ride Update" :
                                                    selectedNotification.type === "payment" ? "Payment" :
                                                        selectedNotification.type === "bonus" ? "Bonus" : "System Message"}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">
                                            {selectedNotification.title}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setSelectedNotification(null)}
                                        className="h-10 w-10 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center transition-colors shrink-0"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 text-gray-600 font-medium text-sm md:text-base leading-relaxed">
                                    {selectedNotification.message}
                                </div>

                                {/* Footer & Timestamp */}
                                <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <Clock size={14} />
                                        {selectedNotification.timestamp}
                                    </div>
                                    <button
                                        onClick={() => setSelectedNotification(null)}
                                        className="px-8 py-3 bg-secondary text-white text-sm font-black uppercase tracking-wider rounded-full hover:bg-secondary/90 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

        </div>
    );
}
