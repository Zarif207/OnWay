"use client";
import React, { useState, useEffect } from "react";
import { Settings, User, Bell, Lock } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Swal from "sweetalert2";

export default function SettingsPage() {
  const { user, isLoading } = useCurrentUser();
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    sosAlerts: true,
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Save profile changes
  const handleSaveProfile = async () => {
    setSaving(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/passenger/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: profile.name,
          phone: profile.phone,
        })
      });
      
      if (response.ok) {
        // Refresh the page to update session
        window.location.reload();
        
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Profile updated successfully",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to update profile",
          confirmButtonColor: "#2FCA71",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Error updating profile",
        confirmButtonColor: "#2FCA71",
      });
    } finally {
      setSaving(false);
    }
  };

  // Save notification settings
  const handleSaveSettings = async () => {
    setSaving(true);
    
    try {
      // Save to localStorage for now
      localStorage.setItem('supportAgentSettings', JSON.stringify(settings));
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Settings saved successfully",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Error saving settings",
        confirmButtonColor: "#2FCA71",
      });
    } finally {
      setSaving(false);
    }
  };

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('supportAgentSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2FCA71] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#2FCA71] flex items-center gap-2">
          <Settings />
          Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <User className="text-[#2FCA71]" size={24} />
            Profile Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Name"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FCA71]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Number"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FCA71]"
              />
            </div>
            <button 
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-2 bg-[#2FCA71] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update Profile"}
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Bell className="text-[#2FCA71]" size={24} />
            Notification Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive push notifications for new alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2FCA71]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2FCA71]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Email Alerts</p>
                <p className="text-sm text-gray-600">Receive email notifications for important updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2FCA71]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2FCA71]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">SOS Alerts</p>
                <p className="text-sm text-gray-600">Get notified immediately for emergency SOS alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sosAlerts}
                  onChange={(e) => setSettings({ ...settings, sosAlerts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2FCA71]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2FCA71]"></div>
              </label>
            </div>
            <button 
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-6 py-2 bg-[#2FCA71] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Notification Settings"}
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Lock className="text-[#2FCA71]" size={24} />
            Security
          </h2>
          <div className="space-y-4">
            <button 
              onClick={() => {
                Swal.fire({
                  icon: "info",
                  title: "Coming Soon!",
                  text: "Password change feature will be available soon",
                  confirmButtonColor: "#2FCA71",
                });
              }}
              className="w-full px-4 py-3 bg-[#2FCA71] text-white rounded-xl hover:shadow-lg transition-all"
            >
              Change Password
            </button>
            <button 
              onClick={() => {
                Swal.fire({
                  icon: "info",
                  title: "Coming Soon!",
                  text: "Two-Factor Authentication will be available soon",
                  confirmButtonColor: "#2FCA71",
                });
              }}
              className="w-full px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
            >
              Enable Two-Factor Authentication
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
