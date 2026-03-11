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
  MessageSquareMore
} from "lucide-react";

export default function RiderLayout({ children }) {
  const menuItems = [
    { label: "Dashboard", path: "/dashboard/rider", icon: LayoutDashboard },
    { label: "Overview", path: "/dashboard/rider/Overview", icon: Activity },
    { label: "Ride History", path: "/dashboard/rider/ride-history", icon: History },
    { label: "Earnings", path: "/dashboard/rider/earnings", icon: Wallet },
    { label: "Inbox", path: "/dashboard/rider/inbox", icon: MessageSquareMore },
    { label: "Profile", path: "/dashboard/rider/profile", icon: User },
  ];

  return (
    <RoleLayout role="Rider" menuItems={menuItems}>
      {children}
    </RoleLayout>
  );
}
