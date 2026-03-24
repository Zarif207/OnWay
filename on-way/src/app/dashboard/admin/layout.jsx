"use client";
import React from "react";
import RoleLayout from "@/components/dashboard/RoleLayout";
import {
  LayoutDashboard,
  Car,
  Users,
  Ticket,
  BarChart3,
  Settings,
  UserCheck,
  Brain,
  Star,
  UserCircle,
  Newspaper,
  Mailbox,
  MessageSquareMore
} from "lucide-react";

export default function AdminLayout({ children }) {
  const menuItems = [
    { label: "Dashboard Overview", path: "/dashboard/admin/dashboard-overview", icon: LayoutDashboard },
    { label: "Ride Management", path: "/dashboard/admin/ride-management", icon: Car },
    { label: "Driver Management", path: "/dashboard/admin/driver-management", icon: UserCheck },
    { label: "User Management", path: "/dashboard/admin/user-management", icon: Users },
    { label: "Inbox", path: "/dashboard/admin/inbox", icon: MessageSquareMore },
    { label: "Promo Codes", path: "/dashboard/admin/promo-codes", icon: Ticket },
    { label: "Reports & Safety", path: "/dashboard/admin/reports-safety", icon: BarChart3 },
    { label: "Blog Manager", path: "/dashboard/admin/blogManager", icon: Newspaper },
    { label: "Newsletter", path: "/dashboard/admin/newsletter", icon: Mailbox },
    { label: "AI Brain", path: "/dashboard/admin/aIBrainConfig", icon: Brain },
    { label: "Reviews", path: "/dashboard/admin/reviews", icon: Star },
    { label: "Profile", path: "/dashboard/admin/profile", icon: UserCircle },
    { label: "Settings", path: "/dashboard/admin/settings", icon: Settings },
  ];

  return (
    <RoleLayout role="Admin" menuItems={menuItems}>
      {children}
    </RoleLayout>
  );
}
