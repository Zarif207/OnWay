"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Edit3,
  Lock,
  Loader2,
  Save,
  X,
  Eye,
  EyeOff,
  Calendar,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

export default function AdminProfile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    image: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/authPage");
        return;
      }

      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/passenger/${session.user.id}`);

        if (response.data.success) {
          setProfile(response.data.data);
          setFormData({
            name: response.data.data.name || "",
            phone: response.data.data.phone || "",
            image: response.data.data.image || "",
          });
        }
      } catch (error) {
        console.error("Fetch profile error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load profile data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, status, router, API_URL]);

  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      const response = await axios.patch(
        `${API_URL}/passenger/profile/${session.user.id}`,
        formData
      );

      if (response.data.success) {
        setProfile({ ...profile, ...formData });
        setEditMode(false);
        
        // Update session if name or image changed
        if (formData.name !== profile.name || formData.image !== profile.image) {
          await update({
            ...session,
            user: {
              ...session.user,
              name: formData.name,
              image: formData.image,
            },
          });
        }

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Profile updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Update profile error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all password fields",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Password Mismatch",
        text: "New password and confirm password do not match",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Weak Password",
        text: "Password must be at least 6 characters long",
      });
      return;
    }

    try {
      const response = await axios.patch(
        `${API_URL}/passenger/change-password/${session.user.id}`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }
      );

      if (response.data.success) {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password changed successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Change password error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to change password",
      });
    }
  };

  // Handle image upload (placeholder - you can integrate with cloud storage)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // For now, we'll use a placeholder URL
    // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#2FCA71] mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin <span className="text-[#2FCA71]">Profile</span>
          </h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-[#2FCA71] to-[#25a35a]"></div>

          {/* Profile Content */}
          <div className="px-6 md:px-8 pb-8">
            {/* Profile Picture */}
            <div className="relative -mt-16 mb-6">
              <div className="relative inline-block">
                <img
                  src={
                    editMode && formData.image
                      ? formData.image
                      : profile.image ||
                        "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(profile.name) +
                          "&size=200&background=2FCA71&color=fff"
                  }
                  alt={profile.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                {editMode && (
                  <label
                    htmlFor="image-upload"
                    className="absolute bottom-0 right-0 bg-[#2FCA71] text-white p-2 rounded-full cursor-pointer hover:bg-[#25a35a] transition shadow-lg"
                  >
                    <Camera className="w-5 h-5" />
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              {!editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2FCA71] text-white rounded-lg hover:bg-[#25a35a] transition"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                  {profile.authProvider === "credentials" && (
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Lock className="w-4 h-4" />
                      Change Password
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleUpdateProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2FCA71] text-white rounded-lg hover:bg-[#25a35a] transition"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        name: profile.name || "",
                        phone: profile.phone || "",
                        image: profile.image || "",
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>

            {/* Profile Information */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 text-[#2FCA71]" />
                  Full Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 text-[#2FCA71]" />
                  Email Address
                </label>
                <p className="text-gray-900 font-medium">{profile.email}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 text-[#2FCA71]" />
                  Phone Number
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.phone || "Not provided"}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4 text-[#2FCA71]" />
                  Role
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#2FCA71] bg-opacity-10 text-[#2FCA71] capitalize">
                  {profile.role}
                </span>
              </div>

              {/* Account Created */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-[#2FCA71]" />
                  Account Created
                </label>
                <p className="text-gray-900 font-medium">
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <CheckCircle className="w-4 h-4 text-[#2FCA71]" />
                  Account Status
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    profile.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {profile.status || "Active"}
                </span>
              </div>
            </div>

            {/* Auth Provider Info */}
            {profile.authProvider && profile.authProvider !== "credentials" && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You signed in with {profile.authProvider}. Password
                  change is not available for OAuth accounts.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2FCA71] focus:border-transparent outline-none"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-2 bg-[#2FCA71] text-white rounded-lg hover:bg-[#25a35a] transition font-medium"
              >
                Change Password
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
