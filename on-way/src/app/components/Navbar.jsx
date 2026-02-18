"use client";

import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-wide text-yellow-400">
          OnWay
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <Link href="/book-ride" className="hover:text-yellow-400 transition">
            Book Ride
          </Link>
          <Link href="/dashboard" className="hover:text-yellow-400 transition">
            Dashboard
          </Link>
          <Link href="/safety" className="hover:text-yellow-400 transition">
            SOS
          </Link>
          <Link href="/help" className="hover:text-yellow-400 transition">
            Help
          </Link>
        </div>

        {/* Buttons */}
        <div className="hidden md:flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 border border-yellow-400 text-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-black transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-yellow-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black px-6 pb-4 space-y-4">
          <Link href="/book-ride" className="block hover:text-yellow-400">
            Book Ride
          </Link>
          <Link href="/dashboard" className="block hover:text-yellow-400">
            Dashboard
          </Link>
          <Link href="/safety" className="block hover:text-yellow-400">
            SOS
          </Link>
          <Link href="/help" className="block hover:text-yellow-400">
            Help
          </Link>
          <Link href="/login" className="block hover:text-yellow-400">
            Login
          </Link>
          <Link href="/register" className="block hover:text-yellow-400">
            Register
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;