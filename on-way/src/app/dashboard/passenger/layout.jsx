"use client";
import React from "react";
import RoleLayout from "@/components/dashboard/RoleLayout";
import { 
  LayoutDashboard, 
  MapPin, 
  History, 
  User, 
  Wallet
} from "lucide-react";

export default function PassengerLayout({ children }) {
  const menuItems = [
    { label: "Dashboard", path: "/dashboard/passenger", icon: LayoutDashboard },
    { label: "Book a Ride", path: "/dashboard/passenger/book-ride", icon: MapPin },
    { label: "Ride History", path: "/dashboard/passenger/ride-history", icon: History },
    { label: "Profile", path: "/dashboard/passenger/profile", icon: User },
    { label: "Wallet", path: "/dashboard/passenger/wallet", icon: Wallet },
  ];

  return (
    <RoleLayout role="Passenger" menuItems={menuItems}>
      {children}
    </RoleLayout>
  );
}
