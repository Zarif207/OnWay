"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logoImage from "../../../public/icon2.png";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  ChevronRight,
  Car,
  Calendar,
  Users,
  BarChart3,
  LifeBuoy,
  FileText,
  ShieldAlert,
  Wallet,
  History,
  MapPin,
  MessageSquare
} from "lucide-react";

const Sidebar = ({ role, menuItems }) => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 flex items-center justify-start border-b border-gray-50">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Image src={logoImage} alt="OnWay" width={100} height={78} priority />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-gray-100 text-gray-900 font-semibold" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className={isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900"} />
                <span className="text-sm">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="text-gray-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={() => console.log("Logout")}
          className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
        >
          <LogOut size={20} className="group-hover:text-red-600" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
