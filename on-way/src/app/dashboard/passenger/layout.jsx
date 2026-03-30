"use client";
import RoleLayout from "@/components/dashboard/RoleLayout";
import { usePathname } from "next/navigation";
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
  const { rideStatus, isPaid, markAsPaid } = useRide();
  const pathname = usePathname();

  const isRideActive = rideStatus !== "idle";
  const needsPayment = isRideActive && !isPaid;
  const isOnRidePage = pathname === "/dashboard/passenger/active-ride" || pathname === "/dashboard/passenger/ride";
  
  // Show blocking overlay if payment pending and not on the ride page
  const showPaymentBlock = needsPayment && !isOnRidePage;

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
      {showPaymentBlock ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white max-w-md w-full rounded-[3rem] p-10 text-center shadow-2xl border border-white/20">
            <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 rotate-12">
              <Wallet size={48} className="text-amber-500" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter leading-tight">Payment Required</h2>
            <p className="text-gray-500 font-medium mb-10 px-4 leading-relaxed">
              You have a pending payment for your current or last ride. Please complete it to continue using the dashboard.
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={markAsPaid}
                className="w-full py-6 bg-[#2FCA71] text-white font-black rounded-2xl shadow-xl shadow-green-500/20 uppercase tracking-widest text-xs active:scale-95 transition-all"
              >
                Pay Now
              </button>
              <button
                onClick={() => window.location.href = "/dashboard/passenger/ride"}
                className="w-full py-4 text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:text-gray-600 transition-colors"
              >
                View Ride
              </button>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </RoleLayout>
  );
}
