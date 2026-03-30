"use client";
import React from "react";
import RoleLayout from "@/components/dashboard/RoleLayout";
import {
  LayoutDashboard,
  Search,
  History,
  User,
  Wallet,
  Activity,
  CalendarRange,
  Bell,
  Settings,
  HelpCircle
} from "lucide-react";

export default function RiderLayout({ children }) {
  const menuItems = [
    { label: "Dashboard", path: "/dashboard/rider", icon: LayoutDashboard },
    { label: "Schedule", path: "/dashboard/rider/schedule", icon: CalendarRange },
    { label: "Ride Requests", path: "/dashboard/rider/ride-requests", icon: Search },
    { label: "Notifications", path: "/dashboard/rider/notifications", icon: Bell },
    { label: "Ride History", path: "/dashboard/rider/ride-history", icon: History },
    { label: "Earnings", path: "/dashboard/rider/earnings", icon: Wallet },
    { label: "Withdraw", path: "/dashboard/rider/withdraw", icon: Wallet },
    { label: "Help", path: "/dashboard/rider/support", icon: HelpCircle },
    { label: "Profile", path: "/dashboard/rider/profile", icon: User },
    { label: "Settings", path: "/dashboard/rider/settings", icon: Settings },
  ];

  return (
    <RoleLayout role="Rider" menuItems={menuItems}>
      {children}
    </RoleLayout>
  );
}
