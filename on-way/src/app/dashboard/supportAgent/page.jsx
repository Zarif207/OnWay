'use client';

import Link from 'next/link';
import {
  FileText,
  Briefcase,
  Bell,
  Activity,
  ArrowRight,
} from 'lucide-react';

export default function SupportAgentDashboard() {
  return (
    <div className="space-y-10 sm:space-y-14">
        
        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Support Agent <span className="text-orange-500">Dashboard</span>
          </h1>

          <p className="text-gray-600 max-w-2xl text-sm sm:text-base">
            Monitor reports, manage cases, track ride activity, and respond
            to alerts efficiently from one place.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">

          <DashboardCard
            icon={FileText}
            title="All Reports"
            desc="View and analyze submitted reports."
            href="/dashboard/supportAgent/all-reports"
          />

          <DashboardCard
            icon={Briefcase}
            title="Case Management"
            desc="Handle and resolve assigned cases."
            href="/dashboard/supportAgent/case-management"
          />

          <DashboardCard
            icon={Bell}
            title="Live Alerts"
            desc="Monitor real-time system alerts."
            href="/dashboard/supportAgent/live-alerts"
          />

          <DashboardCard
            icon={Activity}
            title="Ride Monitoring"
            desc="Track ongoing rides and activities."
            href="/dashboard/supportAgent/ride-monitoring"
          />

      </div>
    </div>
  );
}

function DashboardCard({ icon: Icon, title, desc, href }) {
  return (
    <Link
      href={href}
      className="
        group
        bg-white
        border border-gray-200
        rounded-2xl
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:shadow-lg
        hover:border-orange-400
      "
    >
      <div className="flex items-center justify-between mb-5">
        
        {/* Icon */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500" />
        </div>

        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
      </div>

      <h2 className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-orange-500 transition-colors duration-300">
        {title}
      </h2>

      <p className="text-gray-600 text-sm sm:text-base">
        {desc}
      </p>
    </Link>
  );
}