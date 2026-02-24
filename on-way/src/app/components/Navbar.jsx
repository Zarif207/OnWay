"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  MapPin,
  Shield,
  Headphones,
  Car,
  Wallet,
  History,
  LayoutDashboard,
} from "lucide-react";
import Image from "next/image";
import logoImage from "../../../public/icon2.png";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const baseNav = [
  { label: "Home", href: "/" },
  { label: "OnWay Book", href: "/onway-book" },
  { label: "Earn With OnWay", href: "/earn-with-onway" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Help", href: "/help" },
];

const more = [
  { label: "rideSharing-Guidlines", href: "/RideSharing-Guidlines" },
  { label: "Safety-Coverage", href: "/Safety-Coverage" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const { data: session } = useSession();
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard");
  const role = session?.user?.role;

  // ✅ Dynamic Dashboard Link
  const dashboardHref = useMemo(() => {
    if (!role) return "/dashboard/passenger";
    return `/dashboard/${role}`;
  }, [role]);

  // ✅ Role-based dashboard page icons
  const roleIcons = {
    passenger: [
      { href: "/dashboard/passenger/book-ride", icon: <Car className="h-5 w-5" />, label: "Book Ride" },
      { href: "/dashboard/passenger/ride-history", icon: <History className="h-5 w-5" />, label: "My Rides" },
      { href: "/dashboard/passenger/active-ride", icon: <LayoutDashboard className="h-5 w-5" />, label: "Tracking" },
      { href: "/dashboard/passenger/wallet", icon: <Wallet className="h-5 w-5" />, label: "Wallet" },
      { href: "/dashboard/passenger/profile", icon: <User className="h-5 w-5" />, label: "Profile" },
    ],
    rider: [
      { href: "/dashboard/rider/requests", icon: <Car className="h-5 w-5" />, label: "Ride Requests" },
      { href: "/dashboard/rider/trips", icon: <History className="h-5 w-5" />, label: "My Trips" },
      { href: "/dashboard/rider/earnings", icon: <Wallet className="h-5 w-5" />, label: "Earnings" },
      { href: "/dashboard/rider/profile", icon: <User className="h-5 w-5" />, label: "Profile" },
    ],
    admin: [
      { href: "/dashboard/admin", icon: <Shield className="h-5 w-5" />, label: "Admin Panel" },
    ],
    supportAgent: [
      { href: "/dashboard/supportAgent", icon: <Headphones className="h-5 w-5" />, label: "Support Panel" },
    ],
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setOpenMenu(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center text-2xl font-extrabold">
          <Image src={logoImage} alt="OnWay" width={120} height={94} />
        </Link>

        {/* Center Menu */}
        <div className="hidden items-center gap-7 text-sm font-semibold text-zinc-700 md:flex">
          
          {baseNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-zinc-950"
            >
              {item.label}
            </Link>
          ))}

          {/* Show Dashboard only when NOT inside dashboard */}
          {session && !isDashboard && (
            <Link
              href={dashboardHref}
              className="transition hover:text-zinc-950"
            >
              Dashboard
            </Link>
          )}

          {/* More Dropdown */}
          <div className="relative">
            <button
              className="inline-flex items-center gap-2 transition hover:text-zinc-950"
              onClick={() => setOpenMenu((v) => !v)}
              type="button"
            >
              More <ChevronDown className="h-4 w-4" />
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg">
                {more.map((m) => (
                  <Link
                    key={m.label}
                    href={m.href}
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
                    onClick={() => setOpenMenu(false)}
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden items-center gap-6 md:flex">
          {isDashboard && session ? (
            <>
              {roleIcons[role]?.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative group text-zinc-700 hover:text-black"
                >
                  {item.icon}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                    {item.label}
                  </span>
                </Link>
              ))}

              <button onClick={() => signOut()}>
                <LogOut className="h-5 w-5 text-red-500 hover:text-red-600" />
              </button>
            </>
          ) : session ? (
            <>
              <MapPin className="h-5 w-5 text-zinc-700" />
              <button onClick={() => signOut()} className="text-sm font-semibold">
                Logout
              </button>
            </>
          ) : (
            <>
              <MapPin className="h-5 w-5 text-zinc-700" />
              <Link
                href="/login"
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden rounded-xl border border-zinc-200 bg-white p-2 text-zinc-900"
          onClick={() => setIsOpen((v) => !v)}
          type="button"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;