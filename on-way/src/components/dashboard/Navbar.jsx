"use client";
import React from "react";
import { Settings, Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSession } from "next-auth/react";
import Link from "next/link";
import NotificationDropdown from "./NotificationDropdown";
import PassengerNotificationBell from "./PassengerNotificationBell";
import GlobalSearch from "./GlobalSearch";

const Navbar = () => {
  const { user, isLoading } = useCurrentUser();
  const { data: session } = useSession();
  const currentDate = new Date();
  const day   = currentDate.getDate();
  const month = currentDate.toLocaleDateString("en-US", { month: "long" });

  const rawRole     = user?.role || session?.user?.role || "";
  const isPassenger = rawRole === "passenger" || rawRole === "user";

  return (
    <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-30 w-full">
      <div className="flex items-center gap-4 lg:gap-8 flex-1 pl-12 lg:pl-0">
        <div className="hidden lg:flex flex-col">
          <span className="text-2xl font-bold text-gray-900">{day}</span>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{month}</span>
        </div>
        <div className="relative max-w-xs md:max-w-md w-full">
          <GlobalSearch />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {isPassenger ? <PassengerNotificationBell /> : <NotificationDropdown />}

        {!isPassenger && (
          <Link href="/dashboard/admin/settings" className="hidden md:block p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
            <Settings size={20} />
          </Link>
        )}

        <div className="hidden md:block h-8 w-px bg-gray-100 mx-1"></div>

        <div className="flex items-center gap-2 lg:gap-3 cursor-pointer group">
          {isLoading ? (
            <Loader2 size={20} className="animate-spin text-gray-400" />
          ) : (
            <>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900 group-hover:text-black">
                  {user?.name || session?.user?.name || "Guest User"}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter bg-gray-100 px-1.5 py-0.5 rounded">
                  {user?.role === "user" ? "Passenger" : user?.role || session?.user?.role || "Passenger"}
                </span>
              </div>
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0 bg-gray-200">
                <img
                  src={user?.image || user?.profileImage || session?.user?.image || "https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;