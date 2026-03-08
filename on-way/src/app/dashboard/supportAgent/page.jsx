'use client';

import Link from 'next/link';
import {
  FileText,
  Briefcase,
  Bell,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useRequireRole } from '@/hooks/useAuth';

export default function SupportAgentDashboard() {
  // ✅ Protect this page - only support agents can access
  const { user, isLoading } = useRequireRole("supportAgent");

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2FCA71] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 sm:space-y-14">
        
        {/* Header */}
        <div className="relative bg-white/60 backdrop-blur-xl rounded-[40px] p-14 border border-white/40
                        shadow-[0_25px_60px_rgba(0,0,0,0.08)] overflow-hidden">

          <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#2FCA71]/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-semibold text-[#2FCA71] leading-tight">
              Support Agent Dashboard 👋
            </h1>

            <p className="text-gray-600 mt-6 text-lg leading-relaxed">
              Monitor reports, manage cases, track ride activity, and respond
              to alerts efficiently from one place.
            </p>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">

          <DashboardCard
            icon={FileText}
            title="Complaints"
            desc="Handle and resolve user complaints."
            href="/dashboard/supportAgent/complaints"
          />

          <DashboardCard
            icon={Activity}
            title="Live SOS"
            desc="Monitor emergency alerts in real-time."
            href="/dashboard/supportAgent/live-sos"
          />

          <DashboardCard
            icon={Bell}
            title="Chat Support"
            desc="Provide real-time support to users."
            href="/dashboard/supportAgent/chat-support"
          />

          <DashboardCard
            icon={Briefcase}
            title="Refunds"
            desc="Process and manage refund requests."
            href="/dashboard/supportAgent/refunds"
          />

          <DashboardCard
            icon={Activity}
            title="Verification"
            desc="Review and verify user documents."
            href="/dashboard/supportAgent/verification"
          />

      </div>
    </div>
  );
}

function DashboardCard({ icon: Icon, title, desc, href }) {
  return (
    <Link
      href={href}
      className="group relative bg-white/70 backdrop-blur-xl rounded-[32px] p-10
                 border border-white/40
                 shadow-[0_20px_50px_rgba(0,0,0,0.06)]
                 hover:shadow-[0_30px_70px_rgba(0,0,0,0.12)]
                 hover:-translate-y-2
                 transition-all duration-300"
    >
      <div className="w-14 h-14 bg-[#2FCA71] rounded-2xl flex items-center justify-center
                      text-white shadow-md mb-8">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-xl font-semibold text-[#2FCA71]">
        {title}
      </h3>

      <p className="text-gray-600 mt-4 leading-relaxed">
        {desc}
      </p>
    </Link>
  );
}