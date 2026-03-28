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
  RotateCcw
} from "lucide-react";

export default function PassengerLayout({ children }) {
  const { rideStatus } = useRide();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard/user", icon: LayoutDashboard },
    { label: "Book a Ride", path: "/onway-book", icon: MapPin },
    ...(rideStatus !== "idle" ? [{ label: "Active Ride", path: "/dashboard/user/ride", icon: Car }] : []),
    { label: "Ride History", path: "/dashboard/user/ride-history", icon: History },
    { label: "Refund Request", path: "/dashboard/user/refund", icon: RotateCcw },
    { label: "Inbox", path: "/dashboard/user/chat", icon: MessageSquareMore },
    { label: "Profile", path: "/dashboard/user/profile", icon: User },
    { label: "Wallet", path: "/dashboard/user/wallet", icon: Wallet },
  ];

  return (
    <RoleLayout role="Passenger" menuItems={menuItems}>
      {children}
    </RoleLayout>
  );
}
