"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "next-auth/react";
import logoImage from "../../../public/onway_logo.png";
import { ChevronRight, LogOut, Menu, X } from "lucide-react";

const SidebarContent = ({ role, menuItems, onClose }) => {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/authPage" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-gray-50">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Image src={logoImage} alt="OnWay" width={136} height={56} className="mix-blend-multiply" priority />
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-gray-700">
            <X size={22} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems?.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-gray-100 text-gray-900 font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon size={18} className={`shrink-0 ${isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900"}`} />
                <span className="text-sm truncate">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={13} className="text-gray-400 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
        >
          <LogOut size={20} className="group-hover:text-red-600" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
};

const Sidebar = ({ role, menuItems }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow border border-gray-100"
      >
        <Menu size={22} className="text-gray-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent role={role} menuItems={menuItems} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex-col z-50">
        <SidebarContent role={role} menuItems={menuItems} />
      </aside>
    </>
  );
};

export default Sidebar;
