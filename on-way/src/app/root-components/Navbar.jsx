"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Tag
} from "lucide-react";
import logoImage from "../../../public/icon2.png";


import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const baseNav = [
  { label: "Home", href: "/", icon: Home },
  { label: "OnWay Book", href: "/onway-book", icon: BookOpen },
  { label: "Earn With OnWay", href: "/earn-with-onway", icon: DollarSign },
  { label: "About", href: "/about", icon: Info },
  { label: "Blog", href: "/blog", icon: Newspaper },
];

const moreNav = [
  { label: "Ride Sharing Guidelines", href: "/rideSharing-guidlines", icon: FileText },
  { label: "Safety Coverage", href: "/Safety-Coverage", icon: ShieldCheck },
  { label: "Pricing", href: "/pricing", icon: Tag },
];

/**
 * Navbar Component (V4)
 * Premium Glassmorphism SaaS style with right-side drawer.
 * Strictly preserves route names and link paths.
 */
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { data: session } = useSession();
  const { user } = useCurrentUser();
  const pathname = usePathname();
  const scrollDirection = useScrollDirection();

  const role = user?.role || "passenger";
  const dashboardHref = useMemo(() => `/dashboard/${role}`, [role]);

  // Handle scroll for glass effect saturation/opacity
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const isActive = (path) => pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-100 transition-all duration-500 h-20 flex items-center justify-center px-4 sm:px-8 md:px-12 ${scrollDirection === "down" && !isMobileMenuOpen ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
          }`}
      >
        <div
          className={`w-full max-w-7xl flex items-center justify-between px-6 py-2.5 rounded-2xl border transition-all duration-300 ${isScrolled
            ? "bg-white/70 dark:bg-black/70 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-2xl"
            : "bg-transparent border-transparent"
            }`}
        >
          {/* ================= LEFT: LOGO ================= */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-25 h-25 flex-shrink-0">
              <Image
                src={logoImage}
                alt="OnWay Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* ================= CENTER: NAVIGATION ================= */}
          <div className="hidden lg:flex items-center gap-1">
            {baseNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-bold tracking-tight transition-colors duration-300 rounded-lg hover:bg-[#22c55e]/5 ${isActive(item.href)
                  ? "text-[#22c55e]"
                  : "text-[#0A1F3D]/70 dark:text-white/70 hover:text-[#22c55e]"
                  }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.div
                    layoutId="navbarIndicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#22c55e] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            {session && (
              <Link
                href={dashboardHref}
                className={`relative px-4 py-2 text-sm font-bold tracking-tight transition-colors duration-300 rounded-lg hover:bg-[#22c55e]/5 ${pathname.startsWith("/dashboard")
                  ? "text-[#22c55e]"
                  : "text-[#0A1F3D]/70 dark:text-white/70 hover:text-[#22c55e]"
                  }`}
              >
                Dashboard
                {pathname.startsWith("/dashboard") && (
                  <motion.div
                    layoutId="navbarIndicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#22c55e] rounded-full"
                  />
                )}
              </Link>
            )}

            {/* "More" Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setIsMoreOpen(true)}
                onMouseLeave={() => setIsMoreOpen(false)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold tracking-tight transition-all duration-300 rounded-lg ${isMoreOpen ? "text-[#22c55e] bg-[#22c55e]/5" : "text-[#0A1F3D]/70 dark:text-white/70 hover:text-[#22c55e]"
                  }`}
              >
                More <ChevronDown size={14} className={`transition-transform duration-300 ${isMoreOpen ? "rotate-180" : ""}`} />

                <AnimatePresence>
                  {isMoreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#0A1F3D]/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-110"
                    >
                      {moreNav.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#0A1F3D]/70 dark:text-white/70 hover:text-[#22c55e] hover:bg-[#22c55e]/5 rounded-xl transition-all"
                        >
                          <link.icon size={16} className="text-[#22c55e]" />
                          {link.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* ================= RIGHT: AUTH ================= */}
          <div className="flex items-center gap-4">

            {!session ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:block px-5 py-2 text-sm font-bold text-[#0A1F3D] dark:text-white hover:text-[#22c55e] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 bg-[#22c55e] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#22c55e]/20"
                >
                  Join Now
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                {/* Profile Avatar */}
                <Link
                  href="/dashboard/profile"
                  className="w-10 h-10 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-[#22c55e] text-sm font-black overflow-hidden hover:border-[#22c55e] transition-all shadow-sm"
                >
                  {session?.user?.name?.charAt(0) || <User size={18} />}
                </Link>

                {/* Logout Button (Icon + Text) */}
                <button
                  onClick={handleSignOut}
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/10"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#0A1F3D] dark:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE DRAWER (RIGHT) ================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-150 bg-[#0A1F3D]/60 backdrop-blur-md"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[85%] max-w-sm z-160 bg-white dark:bg-[#0A1F3D] shadow-2xl p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                  <Image src={logoImage} alt="OnWay" width={40} height={40} />
                  <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tighter text-[#0A1F3D] dark:text-white leading-none">OnWay</span>
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-[#22c55e]">Premium</span>
                  </div>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-[#0A1F3D]/5 dark:bg-white/5 text-[#0A1F3D] dark:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-1 overflow-y-auto pr-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 px-4">Menu</span>

                {baseNav.map((item, idx) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-black transition-all ${isActive(item.href)
                        ? "bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/20"
                        : "text-[#0A1F3D]/60 dark:text-white/60 hover:text-[#22c55e] hover:bg-[#22c55e]/5"
                        }`}
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
                    transition={{ delay: 0.1 + baseNav.length * 0.05 }}
                  >
                    <Link
                      href={dashboardHref}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-black transition-all ${pathname.startsWith("/dashboard")
                        ? "bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/20"
                        : "text-[#0A1F3D]/60 dark:text-white/60 hover:text-[#22c55e] hover:bg-[#22c55e]/5"
                        }`}
                    >
                      <LayoutDashboard size={22} />
                      Dashboard
                    </Link>
                  </motion.div>
                )}

                <div className="h-px bg-zinc-100 dark:bg-white/10 my-6 mx-4" />

                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 px-4">Resources</span>
                {moreNav.map((item, idx) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (baseNav.length + idx) * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-6 py-3 text-base font-bold text-[#0A1F3D]/60 dark:text-white/60 hover:text-[#22c55e] transition-colors"
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Auth Bottom */}
              <div className="mt-auto pt-10">
                {!session ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center h-14 bg-[#22c55e] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#22c55e]/20"
                    >
                      Join Now
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center h-14 bg-zinc-100 dark:bg-white/5 text-[#0A1F3D] dark:text-white rounded-2xl font-black text-sm uppercase tracking-widest"
                    >
                      Sign In
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center justify-center gap-3 h-14 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
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