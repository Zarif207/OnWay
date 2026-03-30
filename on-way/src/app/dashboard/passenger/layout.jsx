"use client";
import RoleLayout from "@/components/dashboard/RoleLayout";
import { useRide } from "@/context/RideContext";
import {
  LayoutDashboard,
  MapPin,
  History,
  User,
  Wallet,
  MessageSquareMore,
  Car,
  RotateCcw,
  Settings
} from "lucide-react";

export default function PassengerLayout({ children }) {
  const { rideStatus } = useRide();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard/passenger", icon: LayoutDashboard },
    { label: "Book a Ride", path: "/onway-book", icon: MapPin },
    ...(rideStatus !== "idle" ? [{ label: "Active Ride", path: "/dashboard/passenger/ride", icon: Car }] : []),
    { label: "Ride History", path: "/dashboard/passenger/ride-history", icon: History },
    { label: "Refund Request", path: "/dashboard/passenger/refund", icon: RotateCcw },
    { label: "Inbox", path: "/dashboard/passenger/chat", icon: MessageSquareMore },
    { label: "Wallet", path: "/dashboard/passenger/wallet", icon: Wallet },
    { label: "Profile", path: "/dashboard/passenger/profile", icon: User },
    { label: "Settings", path: "/dashboard/passenger/settings", icon: Settings },
  ];

  return (
    <RoleLayout role="Passenger" menuItems={menuItems}>
      {children}
    </RoleLayout>
  );
}
