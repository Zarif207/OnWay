"use client";
import Link from "next/link";
import { useEffect, useState, useMemo, useRef } from "react"; // useRef added
import {
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  Headphones,
  Car,
  Wallet,
  History,
  LayoutDashboard,
    LogIn,
  UserPlus
} from "lucide-react";
import Image from "next/image";
import logoImage from "../../../public/icon2.png";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const baseNav = [
  { label: "Home", href: "/" },
  { label: "OnWay Book", href: "/onway-book" },
  { label: "Earn With OnWay", href: "/earn-with-onway" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

const more = [
  { label: "rideSharing-guidlines", href: "/rideSharing-guidlines" },
  { label: "Safety-Coverage", href: "/Safety-Coverage" },
  { label: "pricing", href: "/pricing" },
];

const helpItems = [
  { label: "FAQ", href: "/help/faq" },
  { label: "Contact Us", href: "/help/contact" },
  { label: "Support", href: "/help/support" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [openHelp, setOpenHelp] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };
  // const role = session?.user?.role;
  const { user } = useCurrentUser();
  const role = user?.role || "passenger";

  // Dynamic Dashboard Link
  const dashboardHref = useMemo(() => {
    if (!role) return "/dashboard/passenger";
    return `/dashboard/${role}`;
  }, [role]);

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

  // Logic for scroll behavior and Escape key
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setOpenMenu(false);
        setOpenHelp(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lastScrollY]);

  // Helper function to check if route is active
  const isActive = (path) => pathname === path;

  // Outside click theke dropdown close korte
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".help-dropdown")) setOpenHelp(false);
      if (!e.target.closest(".more-dropdown")) setOpenMenu(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
    >
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
              className={`transition hover:text-zinc-950 ${isActive(item.href) ? "text-zinc-950 font-bold border-b-2 border-zinc-950" : "text-zinc-600"
                }`}
            >
              {item.label}
            </Link>
          ))}

          {session && !isDashboard && (
            <Link
              href={dashboardHref}
              className={`transition hover:text-zinc-950 ${pathname.includes("/dashboard") ? "text-zinc-950 font-bold" : "text-zinc-600"
                }`}
            >
              Dashboard
            </Link>
          )}

          {/* Help Dropdown */}
          <div className="relative help-dropdown">
            <button
              onClick={() => {
                setOpenHelp((v) => !v);
                setOpenMenu(false);
              }}
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Help <ChevronDown size={16} className={`transition-transform ${openHelp ? "rotate-180" : ""}`} />
            </button>

            {openHelp && (
              <div className="absolute top-full mt-2 bg-white shadow-lg rounded-md w-48 z-50 border border-gray-100">
                {helpItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenHelp(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* More Dropdown */}
          <div className="relative more-dropdown">
            <button
              onClick={() => {
                setOpenMenu((v) => !v);
                setOpenHelp(false);
              }}
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              More <ChevronDown size={16} className={`transition-transform ${openMenu ? "rotate-180" : ""}`} />
            </button>

            {openMenu && (
              <div className="absolute top-full mt-2 bg-white shadow-lg rounded-md w-48 z-50 border border-gray-100">
                {more.map((m) => (
                  <Link
                    key={m.href}
                    href={m.href}
                    className={`block px-4 py-2 text-sm transition-colors ${isActive(m.href) ? "bg-zinc-100 text-zinc-950 font-semibold" : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                      }`}
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
                  className={`relative group transition ${isActive(item.href) ? "text-black" : "text-zinc-500 hover:text-black"
                    }`}
                >
                  {item.icon}
                  {isActive(item.href) && (
                    <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-black"></span>
                  )}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                    {item.label}
                  </span>
                </Link>
              ))}

              <button onClick={() => handleSignOut()}>
                <LogOut className="h-5 w-5 text-red-500 hover:text-red-600" />
              </button>
            </>
          ) : session ? (
            <>
              <Link href="/dashboard/passenger">
                <User size={20} className="text-gray-700 hover:text-primary" />
              </Link>
              <button
                onClick={() => handleSignOut()}
                className="text-sm font-semibold text-zinc-700 hover:text-black"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary"
              >
                <LogIn size={16} /> Log In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1 text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
              >
                <UserPlus size={16} /> Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          type="button"
          className="md:hidden text-gray-700"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu (Optional - ensuring visibility updates) */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-zinc-100 p-4 space-y-4">
          {baseNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block text-lg font-medium ${isActive(item.href) ? "text-black font-bold" : "text-zinc-600"}`}
            >
              {item.label}
            </Link>
          ))}

          {session && (
            <Link
              href={dashboardHref}
              onClick={() => setIsOpen(false)}
              className={`block text-lg font-medium ${pathname.includes("/dashboard") ? "text-black font-bold" : "text-zinc-600"}`}
            >
              Dashboard
            </Link>
          )}

          {/* Mobile Help */}
          <div>
            <button
              onClick={() => setOpenHelp((v) => !v)}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 w-full"
            >
              Help <ChevronDown size={16} className={`transition-transform ${openHelp ? "rotate-180" : ""}`} />
            </button>
            {openHelp && (
              <div className="ml-3 mt-2 flex flex-col gap-2">
                {helpItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => { setOpenHelp(false); setIsOpen(false); }}
                    className="text-sm text-gray-600 hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile More */}
          <div>
            <button
              onClick={() => setOpenMenu((v) => !v)}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 w-full"
            >
              More <ChevronDown size={16} className={`transition-transform ${openMenu ? "rotate-180" : ""}`} />
            </button>
            {openMenu && (
              <div className="ml-3 mt-2 flex flex-col gap-2">
                {more.map((m) => (
                  <Link
                    key={m.href}
                    href={m.href}
                    onClick={() => { setOpenMenu(false); setIsOpen(false); }}
                    className="text-sm text-gray-600 hover:text-primary"
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Auth */}
          {session ? (
            <button
              onClick={() => signOut()}
              className="text-sm font-semibold text-red-500 text-left"
            >
              Logout
            </button>
          ) : (
            <div className="flex gap-3">
              <Link href="/login" onClick={() => setIsOpen(false)} className="text-sm font-medium text-gray-700">
                Log In
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)} className="text-sm font-medium text-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;