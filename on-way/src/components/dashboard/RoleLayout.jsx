"use client";
import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const RoleLayout = ({ children, role, menuItems, fullWidth = false }) => {
  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">

      {/* Sidebar — fixed on desktop, takes no space in flow */}
      <Sidebar role={role} menuItems={menuItems} />

      {/* Content column — sits to the right of the fixed sidebar */}
      <div className="flex flex-col flex-1 min-w-0 lg:pl-64">

        {/* Top navbar — sticky inside the content column */}
        <Navbar role={role} />

        {/* Page content — full width, no max-w constraint */}
        <main className={`flex-1 overflow-x-hidden ${fullWidth ? "" : "p-4 md:p-6 lg:p-8"}`}>
          {children}
        </main>

      </div>
    </div>
  );
};

export default RoleLayout;
