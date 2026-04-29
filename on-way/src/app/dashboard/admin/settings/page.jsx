"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Settings as SettingsIcon,
  DollarSign,
  Bell,
  Shield,
  Database,
  Save,
  Loader2,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  LogOut,
  Lock,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { signOut } from "next-auth/react";

export default function AdminSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/authPage");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/settings`);
        if (response.data.success) {
          setSettings(response.data.data);
        }
      } catch (error) {
        console.error("Fetch settings error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load settings",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [session, status, router, API_URL]);

  // Update ride configuration
  const handleUpdateRideConfig = async () => {
    try {
      setSaving(true);
      const response = await axios.patch(`${API_URL}/settings/ride-config`, settings.rideConfig);

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Ride configuration updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update ride configuration",
      });
    } finally {
      setSaving(false);
    }
  };

  // Update notifications
  const handleUpdateNotifications = async () => {
    try {
      setSaving(true);
      const response = await axios.patch(`${API_URL}/settings/notifications`, settings.notifications);

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Notification settings updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update notification settings",
      });
    } finally {
      setSaving(false);
    }
  };

  // Update security settings
  const handleUpdateSecurity = async () => {
    try {
      setSaving(true);
      const response = await axios.patch(`${API_URL}/settings/security`, settings.security);

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Security settings updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update security settings",
      });
    } finally {
      setSaving(false);
    }
  };

  // Update data management
  const handleUpdateDataManagement = async () => {
    try {
      setSaving(true);
      const response = await axios.patch(`${API_URL}/settings/data-management`, settings.dataManagement);

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Data management settings updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update data management settings",
      });
    } finally {
      setSaving(false);
    }
  };

  // Clear cache
  const handleClearCache = async () => {
    const result = await Swal.fire({
      title: "Clear Cache?",
      text: "This will clear all application cache",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2FCA71",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, clear it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(`${API_URL}/settings/clear-cache`);
        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Cache cleared successfully",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to clear cache",
        });
      }
    }
  };

  // Trigger backup
  const handleBackup = async () => {
    const result = await Swal.fire({
      title: "Create Backup?",
      text: "This will create a full database backup",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#2FCA71",
      confirmButtonText: "Yes, backup now!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(`${API_URL}/settings/backup`);
        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Backup initiated successfully",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to create backup",
        });
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2FCA71",
      confirmButtonText: "Yes, logout",
    });

    if (result.isConfirmed) {
      await signOut({ callbackUrl: "/authPage" });
    }
  };

  // Toggle helper
  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-[#2FCA71]" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#2FCA71] mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Settings not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin <span className="text-[#2FCA71]">Settings</span>
          </h1>
          <p className="text-gray-600 mt-2">Manage platform configuration and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Account & Security */}
          <div className="lg:col-span-1 space-y-6">

            {/* Account Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#2FCA71] bg-opacity-10 rounded-lg">
                  <User className="w-5 h-5 text-[#2FCA71]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      session?.user?.image ||
                      "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(session?.user?.name || "Admin") +
                        "&size=200&background=2FCA71&color=fff"
                    }
                    alt={session?.user?.name}
                    className="w-16 h-16 rounded-full border-2 border-[#2FCA71]"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{session?.user?.name}</p>
                    <p className="text-sm text-gray-500">{session?.user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-[#2FCA71] bg-opacity-10 text-[#2FCA71] rounded-full capitalize">
                      {session?.user?.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/dashboard/admin/profile")}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Edit Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (days)
                  </label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, sessionTimeout: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, maxLoginAttempts: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Min Length
                  </label>
                  <input
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, passwordMinLength: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                  <ToggleSwitch
                    enabled={settings.security.twoFactorEnabled}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          twoFactorEnabled: !settings.security.twoFactorEnabled,
                        },
                      })
                    }
                  />
                </div>

                <button
                  onClick={handleUpdateSecurity}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2FCA71] text-white rounded-lg hover:bg-[#25a35a] transition font-medium disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Security Settings
                </button>
              </div>
            </div>
          </div>

          {/* Middle Column - Platform Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ride Configuration */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Platform Configuration</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Fare (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.rideConfig.baseFare}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rideConfig: { ...settings.rideConfig, baseFare: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per KM Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.rideConfig.perKmRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rideConfig: { ...settings.rideConfig, perKmRate: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per Minute Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.rideConfig.perMinuteRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rideConfig: { ...settings.rideConfig, perMinuteRate: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={settings.rideConfig.commissionPercentage}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rideConfig: { ...settings.rideConfig, commissionPercentage: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Driver Approval Mode
                  </label>
                  <select
                    value={settings.rideConfig.driverApprovalMode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rideConfig: { ...settings.rideConfig, driverApprovalMode: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                  >
                    <option value="manual">Manual Approval</option>
                    <option value="auto">Auto Approval</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Window (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.rideConfig.cancellationWindow}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rideConfig: { ...settings.rideConfig, cancellationWindow: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.rideConfig.cancellationFee}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rideConfig: { ...settings.rideConfig, cancellationFee: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                  />
                </div>

                <button
                  onClick={handleUpdateRideConfig}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2FCA71] text-white rounded-lg hover:bg-[#25a35a] transition font-medium disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Configuration
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Notifications & Data */}
          <div className="lg:col-span-1 space-y-6">

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Bell className="w-5 h-5 text-yellow-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                  <ToggleSwitch
                    enabled={settings.notifications.emailEnabled}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          emailEnabled: !settings.notifications.emailEnabled,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                  <ToggleSwitch
                    enabled={settings.notifications.smsEnabled}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          smsEnabled: !settings.notifications.smsEnabled,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                  <ToggleSwitch
                    enabled={settings.notifications.pushEnabled}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          pushEnabled: !settings.notifications.pushEnabled,
                        },
                      })
                    }
                  />
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Notification Types</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Booking Confirmation</span>
                      <ToggleSwitch
                        enabled={settings.notifications.bookingConfirmation}
                        onChange={() =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              bookingConfirmation: !settings.notifications.bookingConfirmation,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Ride Reminders</span>
                      <ToggleSwitch
                        enabled={settings.notifications.rideReminders}
                        onChange={() =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              rideReminders: !settings.notifications.rideReminders,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Promotional Emails</span>
                      <ToggleSwitch
                        enabled={settings.notifications.promotionalEmails}
                        onChange={() =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              promotionalEmails: !settings.notifications.promotionalEmails,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUpdateNotifications}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2FCA71] text-white rounded-lg hover:bg-[#25a35a] transition font-medium disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Notifications
                </button>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Database className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Data Management</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Auto Backup</span>
                  <ToggleSwitch
                    enabled={settings.dataManagement.autoBackupEnabled}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        dataManagement: {
                          ...settings.dataManagement,
                          autoBackupEnabled: !settings.dataManagement.autoBackupEnabled,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.dataManagement.backupFrequency}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        dataManagement: {
                          ...settings.dataManagement,
                          backupFrequency: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Retention (days)
                  </label>
                  <input
                    type="number"
                    value={settings.dataManagement.dataRetentionDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        dataManagement: {
                          ...settings.dataManagement,
                          dataRetentionDays: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Log Retention (days)
                  </label>
                  <input
                    type="number"
                    value={settings.dataManagement.logRetentionDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        dataManagement: {
                          ...settings.dataManagement,
                          logRetentionDays: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                  />
                </div>

                <button
                  onClick={handleUpdateDataManagement}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2FCA71] text-white rounded-lg hover:bg-[#25a35a] transition font-medium disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Data Settings
                </button>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Actions</p>

                  <div className="space-y-2">
                    <button
                      onClick={handleBackup}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Create Backup Now
                    </button>

                    <button
                      onClick={handleClearCache}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Cache
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Info Footer */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-semibold text-gray-900">
                {new Date(settings.updatedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Platform Version</p>
              <p className="font-semibold text-gray-900">OnWay v1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Environment</p>
              <p className="font-semibold text-gray-900">
                {process.env.NODE_ENV === "production" ? "Production" : "Development"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
