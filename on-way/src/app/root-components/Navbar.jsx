"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  User,
  LayoutDashboard,
  Home,
  BookOpen,
  DollarSign,
  Info,
  Newspaper,
  ShieldCheck,
  FileText,
  Tag,
  Settings,
  HelpCircle,
  Bell,
  Bike,
  Users,
  MapPin,
  AlertCircle
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import logoImage from "../../../public/onway_logo.png"

import { useCurrentUser } from "@/hooks/useCurrentUser";

// ================= CONSTANTS & DATA =================

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "OnWay Book", href: "/onway-book", icon: BookOpen },
  { label: "Earn", href: "/earn-with-onway", icon: DollarSign },
  { label: "About", href: "/about", icon: Info },
  { label: "Blog", href: "/blog", icon: Newspaper },
];
const HELP_ITEMS = [
  { label: "Passenger Help", href: "/help/user", icon: Users, desc: "Help for passengers" },
  { label: "Rider Help", href: "/help/rider", icon: Bike, desc: "Help for riders" },
  { label: "Walk-In Support", href: "/help/walk-in-support", icon: MapPin, desc: "Find a support center" },
];

const MORE_ITEMS = [
  { label: "Guidelines", href: "/rideSharing-guidlines", icon: FileText, desc: "Ride sharing standards" },
  { label: "Safety", href: "/Safety-Coverage", icon: ShieldCheck, desc: "Our protection policy" },
  { label: "Pricing", href: "/pricing", icon: Tag, desc: "Fare and rate details" },
];

// ================= SUB-COMPONENTS =================

const NavIndicator = () => (
  <motion.div
    layoutId="activeIndicator"
    className="absolute inset-0 bg-gray-100 rounded-full -z-10"
    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
  />
);

const DropdownItem = ({ item, onClick }) => (
  <Link
    href={item.href}
    onClick={onClick}
    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/50 transition-all duration-300 cursor-pointer"
  >
    <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-white/40 group-hover:bg-green-100/70 transition-colors duration-300">
      <item.icon size={20} className="text-gray-500 group-hover:text-green-600 transition-colors" />
    </div>
    <div>
      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
        {item.label}
      </h4>
      <p className="text-[11px] text-gray-500 font-medium">{item.desc}</p>
    </div>
  </Link>
);

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  useEffect(() => {
    const handleEsc = (e) => { e.key === "Escape" && onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] p-8 max-w-[380px] w-full shadow-[0_32px_64px_rgba(0,0,0,0.15)] border border-gray-100"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <LogOut className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">Log out of your account?</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
                You will need to sign in again to access your dashboard, rides, and account features.
              </p>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={onConfirm}
                  className="w-full py-4.5 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-red-600 transition-all transform active:scale-95 shadow-lg shadow-red-500/20"
                >
                  Log Out
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-4.5 bg-gray-50 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-gray-100 transition-all transform active:scale-95 border border-gray-100/50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ================= MAIN COMPONENT =================

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [localImage, setLocalImage] = useState(null);
  const [isDarkPage, setIsDarkPage] = useState(false);
  const dropdownRef = useRef(null);
  const helpRef = useRef(null);

  const { data: session } = useSession();
  const { user } = useCurrentUser();
  const pathname = usePathname();


  useEffect(() => {
    const saved = localStorage.getItem("navbar:profileImage");
    if (saved) setLocalImage(saved);

    const handler = (e) => {
      const img = e.detail?.image || localStorage.getItem("navbar:profileImage");
      if (img) setLocalImage(img);
    };
    window.addEventListener("profile:updated", handler);
    return () => window.removeEventListener("profile:updated", handler);
  }, []);

  const rawRole = user?.role || session?.user?.role || "passenger";
  const role = useMemo(() => rawRole === "user" ? "passenger" : rawRole, [rawRole]);

  const dashboardHref = useMemo(() => {
    const href = `/dashboard/${role}`;
    console.log("ROLE:", role); // Debug log
    console.log("DASHBOARD URL:", href); // Debug log
    return href;
  }, [role]);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    loading: notificationsLoading
  } = useNotifications();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking":
      case "ride_request":
        return <Bike className="w-5 h-5 text-blue-500" />;
      case "driver_arrival":
      case "trip_update":
        return <MapPin className="w-5 h-5 text-green-500" />;
      case "payment":
      case "earnings":
        return <DollarSign className="w-5 h-5 text-yellow-500" />;
      case "system":
        return <AlertCircle size={20} className="text-purple-500" />;
      case "ticket":
      case "message":
        return <Newspaper className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return "";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  // Handle Scroll Behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      if (pathname.startsWith("/about") || pathname.startsWith("/help")) {
        const heroHeight = pathname.startsWith("/about")
          ? window.innerHeight * 0.7
          : 240;
        setIsPastHero(window.scrollY > heroHeight - 80);
      }
    };
    setIsPastHero(false);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Detect dark-page class on body (e.g. 404 page)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkPage(document.body.classList.contains("dark-page"));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    setIsDarkPage(document.body.classList.contains("dark-page"));
    return () => observer.disconnect();
  }, []);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const profileRef = useRef(null);

  const confirmLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const handleSignOut = () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    setIsLogoutModalOpen(true);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setIsHelpOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getProfilePath = (userRole) => {
    switch (userRole?.toLowerCase()) {
      case "admin": return "/dashboard/admin/profile";
      case "rider": return "/dashboard/rider/profile";
      case "passenger":
      case "user": return "/dashboard/passenger/profile";
      case "supportagent":
      case "support": return "/dashboard/supportAgent/settings";
      default: return "/dashboard/passenger/profile";
    }
  };

  const profilePath = useMemo(() => getProfilePath(role), [role]);

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-50 h-20 transition-all duration-500 flex items-center justify-center px-4 sm:px-8 
        ${isScrolled ? "translate-y-2 text-primary" : "translate-y-0 text-gray-500"}`}
      >
        <div
          className={`w-full max-w-7xl relative flex items-center justify-center px-6 py-2 rounded-3xl transition-all duration-500
          ${isScrolled
              ? isDarkPage
                ? "bg-gray-900/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                : "bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
              : (pathname.startsWith("/about") || pathname.startsWith("/help"))
                ? "bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
                : "bg-transparent border-transparent"}`}
        >
          {/* ================= LEFT: LOGO ================= */}
          <Link href="/" className="absolute left-6 flex items-center group">
            <div className="relative h-14 w-38 transition-transform duration-500 group-hover:scale-105">
              <Image
                src={logoImage}
                alt="OnWay Logo"
                fill
                className={`object-contain transition-all duration-300 ${isDarkPage ? "brightness-0 invert" : "mix-blend-multiply"}`}
                priority
              />
            </div>
          </Link>

          {/* ================= CENTER: NAVIGATION ================= */}
          {(() => {
            const isOnHero = isDarkPage;
            return (
              <nav className={`hidden lg:flex items-center gap-1 p-1.5 rounded-full border transition-all duration-300
                ${isOnHero ? "bg-white/10 border-white/20" : "bg-gray-50/50 border-gray-100"}`}>
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-5 py-2 text-sm font-bold tracking-tight transition-all duration-300 rounded-full
                    ${isActive(item.href)
                        ? "text-primary bg-white/90"
                        : isOnHero
                          ? "text-white/80 hover:text-primary hover:bg-white/15"
                          : "text-gray-500 hover:text-primary"
                      }`}
                  >
                    {isActive(item.href) && <NavIndicator />}
                    {item.label}
                  </Link>
                ))}

                {session && (
                  <Link
                    href={dashboardHref}
                    className={`relative px-5 py-2 text-sm font-bold tracking-tight transition-all duration-300 rounded-full
                    ${pathname.startsWith("/dashboard")
                        ? "text-primary bg-white/90"
                        : isOnHero
                          ? "text-white/80 hover:text-primary hover:bg-white/15"
                          : "text-gray-500 hover:text-primary"
                      }`}
                  >
                    {pathname.startsWith("/dashboard") && <NavIndicator />}
                    Dashboard
                  </Link>
                )}

                {/* More Dropdown */}
                <div className="relative group" ref={dropdownRef}>
                  <button
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className={`flex items-center gap-1.5 px-5 py-2 text-sm font-bold tracking-tight transition-all duration-300 rounded-full
                    ${isMoreOpen
                        ? "bg-primary/5 text-primary"
                        : isOnHero
                          ? "text-white/80 hover:text-primary hover:bg-white/15"
                          : "text-gray-500 hover:text-primary lg:group-hover:bg-primary/5 lg:group-hover:text-primary"
                      }`}
                  >
                    More{" "}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${isMoreOpen ? "rotate-180" : ""} lg:group-hover:rotate-180`}
                    />
                  </button>

                  <div
                    className={`absolute top-full right-0 w-85 pt-3 transition-all duration-300 ease-in-out origin-top-right z-[110]
                    ${isMoreOpen
                        ? "opacity-100 visible translate-y-0 scale-100"
                        : "opacity-0 invisible translate-y-4 scale-95 lg:group-hover:opacity-100 lg:group-hover:visible lg:group-hover:translate-y-0 lg:group-hover:scale-100"
                      }`}
                  >
                    <div className="rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-4 border border-gray-100 bg-white relative">
                      <div className="relative flex flex-col gap-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2 px-3">Expertise</p>
                        {MORE_ITEMS.map((item) => (
                          <DropdownItem key={item.href} item={item} onClick={() => setIsMoreOpen(false)} />
                        ))}

                        {/* Help Center with right-side flyout */}
                        <div
                          className="relative"
                          ref={helpRef}
                          onMouseEnter={() => setIsHelpOpen(true)}
                          onMouseLeave={() => setIsHelpOpen(false)}
                        >
                          <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/50 transition-all duration-300 cursor-pointer">
                            <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-white/40 group-hover:bg-green-100/70 transition-colors duration-300">
                              <HelpCircle size={20} className="text-gray-500 group-hover:text-green-600 transition-colors" />
                            </div>
                            <div className="flex-1 text-left">
                              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Help Center</h4>
                              <p className="text-[11px] text-gray-500 font-medium">Support and FAQs</p>
                            </div>
                            <ChevronDown size={14} className="text-gray-400 -rotate-90" />
                          </div>

                          {/* Right flyout */}
                          <AnimatePresence>
                            {isHelpOpen && (
                              <motion.div
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-full top-0 pl-2 z-[120]"
                              >
                                <div className="rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-3 border border-gray-100 w-64 flex flex-col gap-1 bg-white">
                                  {HELP_ITEMS.map((item) => (
                                    <Link
                                      key={item.href}
                                      href={item.href}
                                      onClick={() => { setIsMoreOpen(false); setIsHelpOpen(false); }}
                                      className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/50 transition-all duration-200"
                                    >
                                      <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-white/40 group-hover:bg-green-100/70 transition-colors">
                                        <item.icon size={16} className="text-gray-500 group-hover:text-green-600 transition-colors" />
                                      </div>
                                      <div>
                                        <h4 className="text-xs font-semibold text-gray-800 group-hover:text-green-600 transition-colors">{item.label}</h4>
                                        <p className="text-[10px] text-gray-400">{item.desc}</p>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
            );
          })()}

          {/* ================= RIGHT: AUTH ================= */}
          <div className="absolute right-6 flex items-center gap-3">
            {!session ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-all active:scale-95"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-7 py-3 bg-gray-900 text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-full hover:bg-black transition-all transform hover:scale-[1.03] active:scale-95 shadow-[0_10px_25px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.15)]"
                >
                  Join OnWay
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${isNotificationsOpen ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[120]"
                      >
                        <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                          <h3 className="font-bold text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-[10px] font-black uppercase tracking-wider text-primary hover:opacity-70 transition-opacity"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="py-12 px-6 text-center">
                              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Bell className="text-gray-300" size={24} />
                              </div>
                              <p className="text-sm font-bold text-gray-900">All caught up!</p>
                              <p className="text-xs text-gray-500 mt-1">No new notifications for you right now.</p>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              {notifications.map((notif) => (
                                <div
                                  key={notif._id}
                                  onClick={() => markAsRead(notif._id)}
                                  className={`p-4 flex gap-4 transition-all hover:bg-gray-50 cursor-pointer relative ${!notif.isRead ? "bg-primary/5" : ""}`}
                                >
                                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${!notif.isRead ? "bg-white shadow-sm" : "bg-gray-50"}`}>
                                    {getNotificationIcon(notif.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-snug ${!notif.isRead ? "font-bold text-gray-900" : "text-gray-600"}`}>
                                      {notif.message}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
                                      {formatTimeAgo(notif.createdAt)}
                                    </p>
                                  </div>
                                  {!notif.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {notifications.length > 0 && (
                          <button
                            onClick={clearAll}
                            className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border-t border-gray-50"
                          >
                            Clear All Notifications
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Profile */}
                <div
                  className="relative"
                  ref={profileRef}
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center gap-2 p-1 rounded-full transition-all ${isProfileOpen ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    <div className="relative w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-primary/10 flex items-center justify-center group">
                      {localImage || user?.profileImage || session?.user?.image ? (
                        <Image
                          src={localImage || user?.profileImage || session?.user?.image}
                          alt={user?.name || session?.user?.name || "User"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-primary font-black text-sm uppercase">
                          {user?.name?.charAt(0) || session?.user?.name?.charAt(0) || <User size={18} />}
                        </span>
                      )}
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[120]"
                      >
                        {/* Header with Role Badge */}
                        <div className="p-6 pb-4 border-b border-gray-50 bg-gray-50/30">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-white shadow-sm">
                              {localImage || user?.profileImage || session?.user?.image ? (
                                <Image
                                  src={localImage || user?.profileImage || session?.user?.image}
                                  alt={user?.name || session?.user?.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-primary font-black text-lg uppercase">
                                  {user?.name?.charAt(0) || session?.user?.name?.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-black text-gray-900 truncate">
                                {user?.name || session?.user?.name || "User"}
                              </h4>
                              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider mt-1">
                                {role}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <Link
                            href={profilePath}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 text-gray-600 hover:text-primary transition-all group"
                          >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 group-hover:bg-primary/10 transition-colors">
                              <User size={18} />
                            </div>
                            <span className="text-sm font-bold">Profile</span>
                          </Link>

                          <Link
                            href={`/dashboard/${role}/settings`}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 text-gray-600 hover:text-primary transition-all group"
                          >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 group-hover:bg-primary/10 transition-colors">
                              <Settings size={18} />
                            </div>
                            <span className="text-sm font-bold">Settings</span>
                          </Link>

                          <div className="h-px bg-gray-50 my-2 mx-3" />

                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all group"
                          >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 group-hover:bg-red-100 transition-colors">
                              <LogOut size={18} />
                            </div>
                            <span className="text-sm font-bold">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl text-gray-900 hover:bg-gray-200 transition-all active:scale-90"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE DRAWER ================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[150] bg-gray-900/20 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-[85%] max-w-sm z-[160] bg-white shadow-2xl p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                  <Image src={logoImage} alt="OnWay" width={40} height={40} />
                  <span className="text-xl font-black text-gray-900 tracking-tighter">OnWay</span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 px-4">Navigation</p>
                {NAV_ITEMS.map((item, idx) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-lg font-black transition-all
                      ${isActive(item.href) ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-gray-500 hover:bg-gray-50 hover:text-primary"}`}
                    >
                      <item.icon size={22} />
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                {session && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + NAV_ITEMS.length * 0.05 }}
                  >
                    <Link
                      href={dashboardHref}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-lg font-black transition-all
                      ${pathname.startsWith("/dashboard") ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-gray-500 hover:bg-gray-50 hover:text-primary"}`}
                    >
                      <LayoutDashboard size={22} />
                      Dashboard
                    </Link>
                  </motion.div>
                )}

                <div className="h-px bg-gray-100 my-8 mx-6" />

                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 px-4">Resources</p>
                {MORE_ITEMS.map((item, idx) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (NAV_ITEMS.length + idx) * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-6 py-3 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Help Center */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (NAV_ITEMS.length + MORE_ITEMS.length) * 0.05 }}
                >
                  <button
                    onClick={() => setIsHelpOpen(!isHelpOpen)}
                    className="w-full flex items-center gap-4 px-6 py-3 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
                  >
                    <HelpCircle size={18} />
                    <span className="flex-1 text-left">Help Center</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isHelpOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isHelpOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden ml-6 border-l-2 border-green-100 pl-3"
                      >
                        {HELP_ITEMS.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
                          >
                            <item.icon size={16} />
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              <div class="mt-auto pt-10">
                {!session ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center h-14 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all"
                    >
                      Join OnWay
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center h-14 bg-gray-50 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-all border border-gray-100"
                    >
                      Sign In
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50/50 border border-gray-100 mb-4">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-white shadow-sm">
                        {localImage || user?.profileImage || session?.user?.image ? (
                          <Image
                            src={localImage || user?.profileImage || session?.user?.image}
                            alt={user?.name || session?.user?.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-primary font-black text-lg uppercase">
                            {user?.name?.charAt(0) || session?.user?.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-gray-900 truncate">
                          {user?.name || session?.user?.name}
                        </h4>
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider mt-1">
                          {role}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-4">
                      <Link
                        href={profilePath}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-primary transition-all font-bold"
                      >
                        <User size={20} />
                        Profile
                      </Link>
                      <Link
                        href={`/dashboard/${role}/settings`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-primary transition-all font-bold"
                      >
                        <Settings size={20} />
                        Settings
                      </Link>
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-3 h-14 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-100 transition-all"
                    >
                      <LogOut size={20} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};

export default Navbar;