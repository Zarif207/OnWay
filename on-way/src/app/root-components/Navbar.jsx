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
  MapPin
} from "lucide-react";
import logoImage from "../../../public/icon2.png";
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
  { label: "Rider Help Center", href: "/help?tab=rider", icon: Bike, desc: "Help for riders" },
  { label: "Passenger Help Center", href: "/help?tab=passenger", icon: Users, desc: "Help for passengers" },
  { label: "Walk-In Support Centers", href: "/help?tab=walkin", icon: MapPin, desc: "Find a support center" },
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

// ================= MAIN COMPONENT =================

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const dropdownRef = useRef(null);
  const helpRef = useRef(null);

  const { data: session } = useSession();
  const { user } = useCurrentUser();
  const pathname = usePathname();

  const role = user?.role || "passenger";
  const dashboardHref = useMemo(() => `/dashboard/${role}`, [role]);

  // Handle Scroll Behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setIsHelpOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] h-20 transition-all duration-500 flex items-center justify-center px-4 sm:px-8 
        ${isScrolled ? "translate-y-2" : "translate-y-0"}`}
      >
        <div
          className={`w-full max-w-7xl flex items-center justify-between px-6 py-2 rounded-3xl transition-all duration-500
          ${isScrolled
              ? "bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
              : "bg-transparent border-transparent"}`}
        >
          {/* ================= LEFT: LOGO ================= */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-transform duration-500 group-hover:scale-110">
              <Image src={logoImage} alt="OnWay Logo" fill className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-gray-900 leading-none">OnWay</span>
              <span className="text-[7px] font-black uppercase tracking-[0.3em] text-primary">Premium</span>
            </div>
          </Link>

          {/* ================= CENTER: NAVIGATION ================= */}
          <nav className="hidden lg:flex items-center gap-1 bg-gray-50/50 p-1.5 rounded-full border border-gray-100">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-5 py-2 text-sm font-bold tracking-tight transition-all duration-300 rounded-full
                ${isActive(item.href) ? "text-primary bg-primary/5" : "text-gray-500 hover:text-primary"}`}
              >
                {isActive(item.href) && <NavIndicator />}
                {item.label}
              </Link>
            ))}

            {session && (
              <Link
                href={dashboardHref}
                className={`relative px-5 py-2 text-sm font-bold tracking-tight transition-all duration-300 rounded-full
                ${pathname.startsWith("/dashboard") ? "text-primary bg-primary/5" : "text-gray-500 hover:text-primary"}`}
              >
                {pathname.startsWith("/dashboard") && <NavIndicator />}
                Dashboard
              </Link>
            )}

            {/* More Dropdown */}
            <div className="relative group" ref={dropdownRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`flex items-center gap-1.5 px-5 py-2 text-sm font-bold tracking-tight transition-all duration-300 rounded-full lg:group-hover:bg-primary/5 lg:group-hover:text-primary
                ${isMoreOpen ? "bg-primary/5 text-primary" : "text-gray-500 hover:text-primary"}`}
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
                <div className="rounded-3xl shadow-xl p-4 border border-white/20 relative" style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none rounded-3xl" />
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
                            <div className="rounded-2xl shadow-xl p-3 border border-white/20 w-64 flex flex-col gap-1" style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
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

          {/* ================= RIGHT: AUTH ================= */}
          <div className="flex items-center gap-3">
            {!session ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-6 py-2.5 text-sm font-bold text-gray-700 hover:text-gray-950 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-3 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-gray-900/10 hover:shadow-primary/30"
                >
                  Join OnWay
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                  <Bell size={20} />
                </button>

                <Link
                  href="/dashboard/profile"
                  className="relative w-10 h-10 rounded-full bg-gray-100 border-2 border-transparent hover:border-primary transition-all overflow-hidden flex items-center justify-center group"
                >
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-gray-900 font-black text-sm relative z-10 transition-colors group-hover:text-primary">
                    {session?.user?.name?.charAt(0) || <User size={18} />}
                  </span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all transform active:scale-95"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
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

              <div className="mt-auto pt-10">
                {!session ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center h-14 bg-gray-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl"
                    >
                      Join Now
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center h-14 bg-gray-100 text-gray-900 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em]"
                    >
                      Sign In
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-3 h-14 bg-red-50 text-red-600 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em]"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;