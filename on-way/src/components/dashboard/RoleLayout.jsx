"use client";
import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const RoleLayout = ({ children, role, menuItems, fullWidth = false }) => {
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <Sidebar role={role} menuItems={menuItems} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Navbar role={role} />
        <main className={`flex-1 overflow-x-hidden ${fullWidth ? "p-0" : "p-4 md:p-6 lg:p-8"}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default RoleLayout;
