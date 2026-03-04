"use client";
import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const RoleLayout = ({ children, role, menuItems }) => {
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <Sidebar role={role} menuItems={menuItems} />
      <div className="pl-64 flex flex-col min-h-screen">
        <Navbar role={role} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default RoleLayout;
