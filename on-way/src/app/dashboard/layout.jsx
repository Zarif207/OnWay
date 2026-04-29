"use client";
import React, { useMemo } from "react";
import RoleLayout from "@/components/dashboard/RoleLayout";
import { useRide } from "@/context/RideContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  LayoutDashboard, MapPin, History, User, Wallet, MessageSquareMore, Car,
  Search, CalendarRange, Bell, Settings, HelpCircle, Users, Ticket,
  BarChart3, UserCheck, Brain, Star, UserCircle, Newspaper, Mailbox,
  FileText, ShieldAlert, DollarSign, MessageSquare, LifeBuoy, PackageSearch,
  BellMinus
} from "lucide-react";

export default function UnifiedDashboardLayout({ children }) {
  const { rideStatus } = useRide();
  const { user, isLoading } = useCurrentUser();

  const menuConfig = useMemo(() => ({
    passenger: [
      { label: "Dashboard", path: "/dashboard/passenger", icon: LayoutDashboard },
      { label: "Book a Ride", path: "/onway-book", icon: MapPin },
      ...(rideStatus !== "idle" ? [{ label: "Active Ride", path: "/dashboard/passenger/ride", icon: Car }] : []),
      { label: "Ride History", path: "/dashboard/passenger/ride-history", icon: History },
      { label: "Inbox", path: "/dashboard/passenger/chat", icon: MessageSquareMore },
      { label: "Profile", path: "/dashboard/passenger/profile", icon: User },
      { label: "Wallet", path: "/dashboard/passenger/wallet", icon: Wallet },
      { label: "Lost Items", path: "/dashboard/passenger/lost-items", icon: PackageSearch },
      { label: "Settings", path: "/dashboard/passenger/settings", icon: Settings },
    ],
    rider: [
      { label: "Dashboard", path: "/dashboard/rider", icon: LayoutDashboard },
      { label: "Profile", path: "/dashboard/rider/profile", icon: User },
      { label: "Schedule", path: "/dashboard/rider/schedule", icon: CalendarRange },
      { label: "Ride Requests", path: "/dashboard/rider/ride-requests", icon: Search },
      { label: "Notifications", path: "/dashboard/rider/notifications", icon: Bell },
      { label: "Ride History", path: "/dashboard/rider/ride-history", icon: History },
      { label: "Inbox", path: "/dashboard/rider/inbox", icon: MessageSquareMore },
      { label: "Earnings", path: "/dashboard/rider/earnings", icon: Wallet },
      { label: "Withdraw", path: "/dashboard/rider/withdraw", icon: Wallet },
      { label: "Settings", path: "/dashboard/rider/settings", icon: Settings },
      { label: "Help", path: "/dashboard/rider/support", icon: HelpCircle },
    ],
    admin: [
      { label: "Dashboard Overview", path: "/dashboard/admin/dashboard-overview", icon: LayoutDashboard },
      { label: "Ride Management", path: "/dashboard/admin/ride-management", icon: Car },
      { label: "Driver Management", path: "/dashboard/admin/driver-management", icon: UserCheck },
      { label: "User Management", path: "/dashboard/admin/user-management", icon: Users },
      { label: "Promo Codes", path: "/dashboard/admin/promo-codes", icon: Ticket },
      { label: "Reports & Safety", path: "/dashboard/admin/reports-safety", icon: BarChart3 },
      { label: "Blog Manager", path: "/dashboard/admin/blogManager", icon: Newspaper },
      { label: "Inbox", path: "/dashboard/admin/inbox", icon: MessageSquareMore },
      { label: "Newsletter", path: "/dashboard/admin/newsletter", icon: Mailbox },
      { label: "AI Brain", path: "/dashboard/admin/aIBrainConfig", icon: Brain },
      { label: "Reviews", path: "/dashboard/admin/reviews", icon: Star },
      { label: "Profile", path: "/dashboard/admin/profile", icon: UserCircle },
      { label: "Settings", path: "/dashboard/admin/settings", icon: Settings },
    ],
    supportAgent: [
      { label: "Dashboard", path: "/dashboard/supportAgent", icon: LayoutDashboard },
      { label: "Complaints", path: "/dashboard/supportAgent/complaints", icon: FileText },
      { label: "Live SOS", path: "/dashboard/supportAgent/live-sos", icon: ShieldAlert },
      { label: "Refunds", path: "/dashboard/supportAgent/refunds", icon: DollarSign },
      { label: "Chat Support", path: "/dashboard/supportAgent/chat-support", icon: MessageSquare },
      { label: "Blog Manager", path: "/dashboard/supportAgent/blogManager", icon: Newspaper },
      { label: "Item Recovery", path: "/dashboard/supportAgent/item-recovery", icon: PackageSearch },
      { label: "Notice Manager", path: "/dashboard/supportAgent/noticeManager", icon: BellMinus },
      { label: "Settings", path: "/dashboard/supportAgent/settings", icon: Settings },
    ]
  }), [rideStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <span className="loading loading-ring loading-lg text-primary"></span>
      </div>
    );
  }

  const userRole = user?.role || "passenger";
  const roleLabel = userRole === "supportAgent" ? "Support" :
    userRole.charAt(0).toUpperCase() + userRole.slice(1);
  const menuItems = menuConfig[userRole] || menuConfig.passenger;

  return (
    <RoleLayout role={roleLabel} menuItems={menuItems}>
      {children}
    </RoleLayout>
  );
}
