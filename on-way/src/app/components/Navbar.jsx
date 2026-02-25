"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  UserPlus,
  LogIn,
  MapPin,
  Shield,
  Headphones,
  Car,
} from "lucide-react";
import Image from "next/image";
import logoImage from "../../../public/icon2.png";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Home", href: "/" },
  { label: "OnWay Book", href: "/onway-book" },
  { label: "Earn With OnWay", href: "/earn-with-onway" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Dashboard", href: "/dashboard/passenger" },
];

const more = [
  { label: "Ridesharing-guidlines", href: "/Ridesharing-guidlines" },
  { label: "Safety-Coverage", href: "/Safety-Coverage" },
];

const helpItems = [
  { label: "FAQ", href: "/help/faq" },
  { label: "Contact Us", href: "/help/contact" },
  { label: "Support", href: "/help/support" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setOpenMenu(false);
        setOpenHelp(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
    <nav className="w-full bg-white shadow-md px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/">
          <Image src={logoImage} alt="OnWay Logo" width={120} height={40} />
        </Link>

        {/* Center Menu - Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium hover:text-primary transition-colors ${
                pathname === item.href ? "text-primary font-semibold" : "text-gray-700"
              }`}
            >
              {item.label}
            </Link>
          ))}

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
                    onClick={() => setOpenMenu(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-3">
          {isDashboard ? (
            // Dashboard Mode
            <>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-600"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : session ? (
            // Logged In
            <>
              <Link href="/dashboard/passenger">
                <User size={20} className="text-gray-700 hover:text-primary" />
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm font-semibold text-red-500 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            // Guest
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-3 flex flex-col gap-3 px-4 pb-4 border-t pt-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-gray-700 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}

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