"use client";
import React from "react";
import { Bell, Settings, Search as SearchIcon, Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const Navbar = () => {
  const { user, isLoading } = useCurrentUser();
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.toLocaleDateString('en-US', { month: 'long' });

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Left side: Date & Search */}
      <div className="flex items-center gap-8 flex-1">
        <div className="hidden lg:flex flex-col">
          <span className="text-2xl font-bold text-gray-900">{day}</span>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {month}
          </span>
        </div>

        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-11 pr-4 py-2.5 bg-gray-100/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none"
          />
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-4">
        <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
          <Bell size={20} />
        </button>
        <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
          <Settings size={20} />
        </button>

        <div className="h-8 w-px bg-gray-100 mx-2"></div>

        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          {isLoading ? (
            <Loader2 size={20} className="animate-spin text-gray-400" />
          ) : (
            <>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900 group-hover:text-black">
                  {user?.name || "Guest User"}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter bg-gray-100 px-1.5 py-0.5 rounded">
                  {user?.role || "User"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0 bg-gray-200">
                <img
                  src={user?.image || "https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg"}
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