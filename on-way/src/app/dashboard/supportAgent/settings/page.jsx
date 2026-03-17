"use client";
import React, { useState, useEffect, useRef } from "react";
import { Settings, User, Bell, Lock, Camera, Upload } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Swal from "sweetalert2";
import SupportLoading from "../SupportLoading";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export default function SettingsPage() {
  const { user, isLoading } = useCurrentUser();
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef();

  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [settings, setSettings] = useState({ notifications: true, emailAlerts: true, sosAlerts: true });

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
      setPreviewImage(user.image || null);
    }
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem("supportAgentSettings");
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: "error", title: "File too large", text: "Max 5MB allowed", confirmButtonColor: "#2FCA71" });
      return;
    }

    // user._id is the correct field from passenger collection
    const userId = user?._id;
    if (!userId) {
      Swal.fire({ icon: "error", title: "Error!", text: "User ID not found", confirmButtonColor: "#2FCA71" });
      return;
    }

    setUploadingPhoto(true);
    try {
      const base64 = await toBase64(file);
      setPreviewImage(base64);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const res = await fetch(`${apiUrl}/passenger/profile/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      Swal.fire({ icon: "success", title: "Photo updated!", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
    } catch (err) {
      console.error("Photo upload error:", err);
      Swal.fire({ icon: "error", title: "Error!", text: err.message || "Failed to upload photo", confirmButtonColor: "#2FCA71" });
      setPreviewImage(user?.image || null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const res = await fetch(`${apiUrl}/passenger/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, name: profile.name, phone: profile.phone }),
      });
      if (res.ok) {
        Swal.fire({ icon: "success", title: "Success!", text: "Profile updated successfully", toast: true, position: "top-end", showConfirmButton: false, timer: 3000, timerProgressBar: true });
        window.location.reload();
      } else {
        Swal.fire({ icon: "error", title: "Error!", text: "Failed to update profile", confirmButtonColor: "#2FCA71" });
      }
    } catch {
      Swal.fire({ icon: "error", title: "Error!", text: "Error updating profile", confirmButtonColor: "#2FCA71" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      localStorage.setItem("supportAgentSettings", JSON.stringify(settings));
      Swal.fire({ icon: "success", title: "Success!", text: "Settings saved successfully", toast: true, position: "top-end", showConfirmButton: false, timer: 3000, timerProgressBar: true });
    } catch {
      Swal.fire({ icon: "error", title: "Error!", text: "Error saving settings", confirmButtonColor: "#2FCA71" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <SupportLoading />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#2FCA71] flex items-center gap-2">
          <Settings /> Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings - Left/Right layout */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
            <User className="text-[#2FCA71]" size={24} /> Profile Settings
          </h2>

          <div className="flex flex-col md:flex-row gap-8">
            {/* LEFT - Photo Upload */}
            <div className="flex flex-col items-center gap-3 md:w-48 shrink-0">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#2FCA71]/30 bg-gray-100">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#2FCA71]/10">
                      <User size={40} className="text-[#2FCA71]" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[#2FCA71] rounded-full flex items-center justify-center shadow-md hover:bg-[#27b362] transition-colors disabled:opacity-60"
                >
                  {uploadingPhoto
                    ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    : <Camera size={14} className="text-white" />}
                </button>
              </div>
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingPhoto}
                className="flex items-center gap-1.5 text-sm text-[#2FCA71] font-medium hover:underline disabled:opacity-50"
              >
                <Upload size={14} />
                {uploadingPhoto ? "Uploading..." : "Upload Photo"}
              </button>
              <p className="text-xs text-gray-400 text-center">JPG, PNG<br />max 5MB</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>

            {/* RIGHT - Name, Email, Phone */}
            <div className="flex-1 space-y-4">
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
        </div>

        {/* Notification Settings */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Bell className="text-[#2FCA71]" size={24} /> Notification Settings
          </h2>
          <div className="space-y-4">
            {[
              { key: "notifications", label: "Push Notifications", desc: "Receive push notifications for new alerts" },
              { key: "emailAlerts", label: "Email Alerts", desc: "Receive email notifications for important updates" },
              { key: "sosAlerts", label: "SOS Alerts", desc: "Get notified immediately for emergency SOS alerts" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{label}</p>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2FCA71]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2FCA71]"></div>
                </label>
              </div>
            ))}
            <button onClick={handleSaveSettings} disabled={saving} className="px-6 py-2 bg-[#2FCA71] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
              {saving ? "Saving..." : "Save Notification Settings"}
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Lock className="text-[#2FCA71]" size={24} /> Security
          </h2>
          <div className="space-y-4">
            <button onClick={() => Swal.fire({ icon: "info", title: "Coming Soon!", text: "Password change feature will be available soon", confirmButtonColor: "#2FCA71" })} className="w-full px-4 py-3 bg-[#2FCA71] text-white rounded-xl hover:shadow-lg transition-all">
              Change Password
            </button>
            <button onClick={() => Swal.fire({ icon: "info", title: "Coming Soon!", text: "Two-Factor Authentication will be available soon", confirmButtonColor: "#2FCA71" })} className="w-full px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
              Enable Two-Factor Authentication
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
