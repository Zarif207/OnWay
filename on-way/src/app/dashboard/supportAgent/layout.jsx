"use client";
import React from "react";
import RoleLayout from "@/components/dashboard/RoleLayout";
import { 
  LayoutDashboard, 
  FileText, 
  ShieldAlert, 
  Bell, 
  LifeBuoy,
  MessageSquare
} from "lucide-react";

export default function SupportLayout({ children }) {
  const menuItems = [
    { label: "Dashboard", path: "/dashboard/supportAgent", icon: LayoutDashboard },
    { label: "All Reports", path: "/dashboard/supportAgent/all-reports", icon: FileText },
    { label: "Case Management", path: "/dashboard/supportAgent/case-management", icon: LifeBuoy },
    { label: "Live Alerts", path: "/dashboard/supportAgent/live-alerts", icon: Bell },
    { label: "Ride Monitoring", path: "/dashboard/supportAgent/ride-monitoring", icon: ShieldAlert },
    { label: "Tickets", path: "/dashboard/supportAgent/tickets", icon: MessageSquare },
  ];

  return (
    <RoleLayout role="Support" menuItems={menuItems}>
      {children}
    </RoleLayout>
  );
}
