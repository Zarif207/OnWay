'use client';

import Link from 'next/link';
import {
  Users,
  MessageSquare,
  AlertTriangle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function SupportAgentDashboard() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Support Agent <span className="text-yellow-400">Dashboard</span>
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Manage customer issues, respond to tickets, monitor live chats,
            and resolve complaints efficiently.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          <DashboardCard
            icon={Users}
            title="Manage Tickets"
            desc="View and respond to customer support tickets."
            href="/dashboard/support/tickets"
          />

          <DashboardCard
            icon={MessageSquare}
            title="Live Chat"
            desc="Handle real-time customer conversations."
            href="/dashboard/support/live-chat"
          />

          <DashboardCard
            icon={AlertTriangle}
            title="Complaints"
            desc="Review and resolve escalated issues."
            href="/dashboard/support/complaints"
          />

          <DashboardCard
            icon={Clock}
            title="Ticket History"
            desc="Check previously resolved cases."
            href="/dashboard/support/history"
          />

        </div>
      </div>
    </div>
  );
}

function DashboardCard({ icon: Icon, title, desc, href }) {
  return (
    <Link
      href={href}
      className="group bg-[#111111] border border-gray-800 rounded-2xl p-6 hover:border-yellow-400 transition-all duration-300 hover:shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-black" />
        </div>

        <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-yellow-400 transition" />
      </div>

      <h2 className="text-xl font-semibold mb-2 group-hover:text-yellow-400 transition">
        {title}
      </h2>

      <p className="text-gray-400 text-sm">
        {desc}
      </p>
    </Link>
  );
}