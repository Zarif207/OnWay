"use client";
import React, { useState } from "react";
import { Settings, User, Bell, Lock, Globe } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    sosAlerts: true,
    language: "en",
  });

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
                placeholder="Your name"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FCA71]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="your.email@example.com"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FCA71]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                placeholder="+1234567890"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FCA71]"
              />
            </div>
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
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Lock className="text-[#2FCA71]" size={24} />
            Security
          </h2>
          <div className="space-y-4">
            <button className="w-full px-4 py-3 bg-[#2FCA71] text-white rounded-xl hover:shadow-lg transition-all">
              Change Password
            </button>
            <button className="w-full px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
              Enable Two-Factor Authentication
            </button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Globe className="text-[#2FCA71]" size={24} />
            Language & Region
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FCA71]"
            >
              <option value="en">English</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button className="px-6 py-3 bg-[#2FCA71] text-white rounded-xl hover:shadow-lg transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
