import React from "react";
import { Download, AlertTriangle, FileText } from "lucide-react";

const ReportSafety = () => {
  const sosCases = [
    { id: "SOS001", user: "Sarah Johnson", status: "Resolved", time: "2 mins" },
    { id: "SOS002", user: "Michael Chen", status: "Pending", time: "5 mins" },
    { id: "SOS003", user: "Emma Davis", status: "Resolved", time: "3 mins" },
  ];

  const auditLogs = [
    { id: 1, action: "Driver Suspended", admin: "Admin A", date: "2026-02-20" },
    { id: 2, action: "SOS Case Closed", admin: "Admin B", date: "2026-02-21" },
    { id: 3, action: "Promo Code Deleted", admin: "Admin A", date: "2026-02-22" },
  ];

  const getStatusStyle = (status) => {
    if (status === "Resolved")
      return "bg-green-100 text-green-700";
    if (status === "Pending")
      return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-[var(--color-accent)] px-6 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">
              Reports & Safety
            </h1>
            <p className="text-gray-600 mt-1">
              Analytics and emergency monitoring
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg hover:opacity-90 transition">
              <Download size={18} />
              Export CSV
            </button>

            <button className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition">
              <FileText size={18} />
              Export PDF File
            </button>
          </div>
        </div>

        {/* Revenue Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Revenue" value="$45,820" />
          <StatCard title="Platform Commission" value="$8,240" />
          <StatCard title="Active SOS Alerts" value="2" color="text-red-600" />
        </div>

        {/* SOS Dashboard */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-10">
          <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-6 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            SOS Dashboard
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Case ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Response Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {sosCases.map((caseItem) => (
                  <tr key={caseItem.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{caseItem.id}</td>
                    <td className="px-6 py-4">{caseItem.user}</td>
                    <td className="px-6 py-4">{caseItem.time}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusStyle(caseItem.status)}`}>
                        {caseItem.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance & Safety Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Compliance Logs */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-6">
              Compliance Audit Logs
            </h2>

            <ul className="space-y-4">
              {auditLogs.map((log) => (
                <li key={log.id} className="flex justify-between border-b pb-3">
                  <div>
                    <p className="font-medium text-[var(--color-primary)]">
                      {log.action}
                    </p>
                    <p className="text-sm text-gray-500">
                      By {log.admin}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {log.date}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety Trends */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-6">
              Safety Trends
            </h2>

            <div className="space-y-4">
              <TrendItem label="Resolved SOS Cases" value="85%" />
              <TrendItem label="Average Response Time" value="3.2 mins" />
              <TrendItem label="Incident Reduction Rate" value="12% ↓" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <p className="text-gray-500 text-sm">{title}</p>
    <h2 className={`text-3xl font-bold mt-2 ${color || "text-[var(--color-primary)]"}`}>
      {value}
    </h2>
  </div>
);

const TrendItem = ({ label, value }) => (
  <div className="flex justify-between border-b pb-3">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold text-[var(--color-primary)]">
      {value}
    </span>
  </div>
);

export default ReportSafety;