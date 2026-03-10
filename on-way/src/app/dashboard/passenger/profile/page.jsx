"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Phone,
  Bell,
  Globe,
  Settings,
  Loader2,
  Mail,
  ShieldCheck,
  Calendar,
  LogOut,
  X,
  Check
} from "lucide-react";
import OnWayLoading from "@/app/components/Loading/page";

/* ---------- UI Components ---------- */

function Card({ children, className = "" }) {
  return (
    <div className={`bg-base-100 rounded-2xl border border-base-300 shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, variant = "primary", className = "", loading = false, ...props }) {
  const base =
    "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2";

  const styles = {
    primary: "bg-primary text-white hover:bg-primary/90 disabled:opacity-50",
    accent: "bg-accent text-white hover:bg-accent/90 disabled:opacity-50",
    outline: "border border-base-300 text-secondary hover:bg-base-200 disabled:opacity-50",
    danger: "bg-red-500 text-white hover:bg-red-600 disabled:opacity-50",
    success: "bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

/* ---------- Profile Page ---------- */

export default function Profile() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Edit form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notifications: true,
    language: "English"
  });

  // Original data for cancel functionality
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const res = await fetch(
            `http://localhost:4000/api/passenger/${session.user.id}`
          );
          const result = await res.json();
          const userData = result.data || result;
          setUser(userData);

          // Initialize form data
          setFormData({
            name: userData.name || "",
            phone: userData.phone || "",
            address: userData.address || "",
            notifications: userData.notifications !== false,
            language: userData.language || "English"
          });
        } catch (err) {
          console.error(err);
          setErrorMessage("Failed to load user data");
        } finally {
          setLoading(false);
        }
      } else if (status === "unauthenticated") {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, status]);

  // Toggle edit mode
  const handleEditClick = () => {
    if (!isEditMode) {
      // Entering edit mode
      setOriginalData({ ...formData });
      setIsEditMode(true);
      setSuccessMessage("");
      setErrorMessage("");
    }
  };

  // Handle form input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Cancel edit
  const handleCancel = () => {
    setFormData(originalData);
    setIsEditMode(false);
    setErrorMessage("");
  };

  // Save changes
  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      setErrorMessage("Name is required");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        "http://localhost:4000/api/passenger/profile/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: session.user.id,
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            notifications: formData.notifications,
            language: formData.language
          })
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Update user state with returned data
        setUser(result.data);
        setIsEditMode(false);
        setSuccessMessage(result.message || "Profile updated successfully!");

        // Auto-hide success message
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(result.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Save error:", err);
      setErrorMessage("An error occurred while saving changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <OnWayLoading />;

  if (status === "unauthenticated") {
    return (
      <div className="flex justify-center items-center h-screen bg-base-200 p-6">
        <Card className="max-w-md w-full text-center">
          <ShieldCheck className="mx-auto text-red-500 mb-4" size={40} />
          <h2 className="text-2xl font-bold text-secondary mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Please login to access your profile
          </p>
          <Button className="w-full">Sign In</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary">
              Account Settings
            </h1>
            <p className="text-sm text-gray-500">
              Manage your profile and ride preferences
            </p>
          </div>

          <Button variant="outline" className="text-red-500">
            <LogOut size={16} />
            Log Out
          </Button>
        </div>

        {/* Success/Error Messages */}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl text-green-700 text-sm">
            ✓ {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
            ✕ {errorMessage}
          </div>
        )}

        {/* Profile Card */}

        {user && (
          <Card className="mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">

              {/* Avatar */}

              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary ring-offset-4">
                  <img
                    src={
                      user.image ||
                      `https://ui-avatars.com/api/?name=${user.name}&background=259461&color=fff`
                    }
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></span>
              </div>

              {/* User Info or Edit Form */}

              <div className="flex-1 text-center md:text-left w-full">
                {!isEditMode ? (
                  <>
                    {/* View Mode */}
                    <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-4">
                      <h2 className="text-2xl font-bold text-secondary">
                        {user.name}
                      </h2>

                      <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-semibold">
                        {user.role}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">

                      <p className="flex items-center gap-2 text-gray-600 justify-center md:justify-start">
                        <Mail size={16} /> {user.email}
                      </p>

                      <p className="flex items-center gap-2 text-gray-600 justify-center md:justify-start">
                        <Phone size={16} /> {user.phone}
                      </p>

                      {user.address && (
                        <p className="flex items-center gap-2 text-gray-600 justify-center md:justify-start col-span-1 md:col-span-2">
                          📍 {user.address}
                        </p>
                      )}

                      <p className="flex items-center gap-2 text-gray-600 justify-center md:justify-start">
                        <Calendar size={16} />
                        Joined{" "}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>

                      <p className="flex items-center gap-2 text-gray-600 justify-center md:justify-start">
                        <ShieldCheck size={16} />
                        {user.authProvider}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Edit Mode */}
                    <h3 className="text-lg font-bold text-secondary mb-4">Edit Your Information</h3>

                    <div className="space-y-4">
                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="w-full px-4 py-2 border border-base-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Email Field (Read-only) */}
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">
                          Email Address (Cannot be changed)
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-2 border border-base-300 rounded-lg bg-base-200 text-gray-500 cursor-not-allowed focus:outline-none"
                        />
                      </div>

                      {/* Phone Field */}
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="w-full px-4 py-2 border border-base-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      {/* Address Field */}
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="w-full px-4 py-2 border border-base-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          placeholder="Enter your address"
                        />
                      </div>

                      {/* Language Field */}
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">
                          <Globe size={16} className="inline mr-2" />
                          Preferred Language
                        </label>
                        <select
                          value={formData.language}
                          onChange={(e) => handleInputChange("language", e.target.value)}
                          className="w-full px-4 py-2 border border-base-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                          <option>English</option>
                          <option>Bengali</option>
                        </select>
                      </div>

                      {/* Notifications */}
                      <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                        <div>
                          <p className="font-semibold text-secondary">
                            Push Notifications
                          </p>
                          <p className="text-xs text-gray-500">
                            Receive ride updates and alerts
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={formData.notifications}
                          onChange={(e) => handleInputChange("notifications", e.target.checked)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action Button */}

              <div className="flex flex-col gap-2">
                {!isEditMode ? (
                  <Button variant="accent" onClick={handleEditClick}>
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="success"
                      onClick={handleSave}
                      loading={isSaving}
                      className="w-full"
                    >
                      <Check size={16} />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="w-full"
                    >
                      <X size={16} />
                      Cancel
                    </Button>
                  </>
                )}
              </div>

            </div>
          </Card>
        )}

        {/* Settings Section */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Preferences */}

          <Card>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-secondary">
              <Bell size={18} />
              System Preferences
            </h3>

            <div className="space-y-6">

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-secondary">
                    Push Notifications
                  </p>
                  <p className="text-xs text-gray-500">
                    Ride updates and alerts
                  </p>
                </div>

                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={formData.notifications}
                  onChange={(e) => handleInputChange("notifications", e.target.checked)}
                  disabled={isEditMode}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Globe size={18} />
                  <span className="font-semibold text-secondary">
                    App Language
                  </span>
                </div>

                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange("language", e.target.value)}
                  disabled={isEditMode}
                  className="select select-bordered select-sm disabled:opacity-50"
                >
                  <option>English</option>
                  <option>Bengali</option>
                </select>
              </div>

            </div>
          </Card>

          {/* Security */}

          <Card>

            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-secondary">
              <Settings size={18} />
              Account Security
            </h3>

            <div className="space-y-4">

              <div className="p-4 bg-primary/10 rounded-xl">
                <p className="text-xs text-primary font-semibold">
                  Last Login
                </p>

                <p className="font-semibold text-secondary">
                  {new Date(user?.lastLogin).toLocaleString()}
                </p>
              </div>

              <Button variant="outline" className="w-full">
                Change Password
              </Button>

            </div>

          </Card>

        </div>
      </div>
    </div>
  );
}