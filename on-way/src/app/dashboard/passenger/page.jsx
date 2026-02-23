"use client";

import Link from "next/link";

export default function PassengerLayout({ children }) {
  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-5 space-y-4">

        <Link href="/dashboard/passenger/active-ride">
          Active Ride
        </Link>

        <Link href="/dashboard/passenger/book-ride">
          Book Ride
        </Link>

        <Link href="/dashboard/passenger/ride-history">
          Ride History
        </Link>

        <Link href="/dashboard/passenger/wallet">
          Wallet
        </Link>

        <Link href="/dashboard/passenger/profile">
          Profile
        </Link>

      </div>

      {/* Page Content */}
      <div className="flex-1 p-6 bg-gray-100">
        {children}
      </div>

    </div>
  );
}