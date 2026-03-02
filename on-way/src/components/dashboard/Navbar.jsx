"use client";
import React from "react";
import { Search, Bell, Settings, Search as SearchIcon } from "lucide-react";

const Navbar = ({ role }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long'
  });

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Left side: Date & Search */}
      <div className="flex items-center gap-8 flex-1">
        <div className="hidden lg:flex flex-col">
          <span className="text-2xl font-bold text-gray-900">{new Date().getDate()}</span>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {new Date().toLocaleDateString('en-US', { month: 'long' })}
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
        
        <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-900 group-hover:text-black">Minhaj Islam</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter bg-gray-100 px-1.5 py-0.5 rounded">
              {role}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
            <img 
              src="https://i.ibb.co.com/VpvHf182/pixverse-i2i-ori-3662ce8b-89d2-4258-a9aa-a5eb3e016fef.jpg" 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
