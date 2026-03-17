"use client";
import React from "react";
import RoleLayout from "@/components/dashboard/RoleLayout";
import { 
  LayoutDashboard, 
  FileText, 
  ShieldAlert, 
  DollarSign, 
  LifeBuoy,
  MessageSquare,
  Settings,
  PackageSearch
} from "lucide-react";

export default function SupportLayout({ children }) {
  const menuItems = [
    { label: "Dashboard", path: "/dashboard/supportAgent", icon: LayoutDashboard },
    { label: "Complaints", path: "/dashboard/supportAgent/complaints", icon: FileText },
    { label: "Live SOS", path: "/dashboard/supportAgent/live-sos", icon: ShieldAlert },
    { label: "Chat Support", path: "/dashboard/supportAgent/chat-support", icon: MessageSquare },
    { label: "Refunds", path: "/dashboard/supportAgent/refunds", icon: DollarSign },
    { label: "Verification", path: "/dashboard/supportAgent/verification", icon: LifeBuoy },
    { label: "Item Recovery", path: "/dashboard/supportAgent/item-recovery", icon: PackageSearch },
    { label: "Settings", path: "/dashboard/supportAgent/settings", icon: Settings },
  ];

  return (
    <RoleLayout role="Support" menuItems={menuItems}>
      {children}
    </RoleLayout>
  );
}
