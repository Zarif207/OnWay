"use client";

import { useState, useEffect, useRef } from "react";
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
  Check,
  Camera,
  MapPin,
  Edit3,
  ChevronRight,
  User,
  Lock,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

import OnWayLoading from "@/app/components/Loading/page";

/* ---------- UI Components ---------- */

function Card({ children, className = "", noPadding = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden ${noPadding ? "" : "p-6 md:p-8"
        } ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Button({
  children,
  variant = "primary",
  className = "",
  loading = false,
  ...props
}) {
  const base =
    "relative px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 overflow-hidden active:scale-[0.98]";

  const styles = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20",
    accent: "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200",
    outline: "border-2 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none",
    ghost: "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}

const InputField = ({ label, icon: Icon, value, onChange, placeholder, disabled = false, type = "text", error = "" }) => (
  <div className="space-y-2 group">
    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${Icon ? "pl-12" : "px-4"} pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-900 outline-none transition-all ${disabled ? "opacity-60 cursor-not-allowed" : ""
          } ${error ? "border-red-400/50" : ""}`}
      />
    </div>
    {error && <p className="text-[11px] text-red-500 font-medium ml-1">{error}</p>}
  </div>
);

/* ---------- Profile Page ---------- */

export default function Profile() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

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

  // Handle messages with toast
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage, {
        style: {
          borderRadius: '16px',
          background: '#10b981',
          color: '#fff',
          fontWeight: 'bold',
        },
      });
      setSuccessMessage("");
    }
    if (errorMessage) {
      toast.error(errorMessage, {
        style: {
          borderRadius: '16px',
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
        },
      });
      setErrorMessage("");
    }
  }, [successMessage, errorMessage]);

  // Toggle edit mode
  const handleEditClick = () => {
    if (!isEditMode) {
      setOriginalData({ ...formData });
      setIsEditMode(true);
      setSelectedImage(null);
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) {
        setErrorMessage("Image size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        toast.success("Image preview updated!", { duration: 1500 });
      };
      reader.readAsDataURL(file);
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
    setSelectedImage(null);
  };

  // Save changes
  const handleSave = async () => {
    if (!formData.name.trim()) {
      setErrorMessage("Name is required");
      return;
    }

    setIsSaving(true);

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
            language: formData.language,
            image: selectedImage
          })
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setUser(result.data);
        setIsEditMode(false);
        setSuccessMessage(result.message || "Profile updated successfully!");
        setSelectedImage(null);
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
      <div className="flex justify-center items-center h-[90vh] bg-zinc-50 dark:bg-zinc-950 p-6">
        <Card className="max-w-md w-full text-center py-12">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-950/30 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2">
            Access Denied
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-[250px] mx-auto">
            Secure access only. Please login to manage your account settings.
          </p>
          <Button className="w-full">Sign In to Continue</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-8 md:p-10 lg:p-12">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">

        {/* Header section with Breadcrumbs & Title */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
              <User size={14} />
              <span>Personal Workspace</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              My Profile
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Update your photo and personal details here.
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Button variant="danger" className="flex-1 md:flex-none">
              <LogOut size={16} />
              Log Out
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">

          {/* Main Account Settings Card */}
          <Card noPadding className="relative">
            {/* Header background decoration */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none" />

            <div className="p-6 md:p-10 relative">
              <div className="flex flex-col lg:flex-row items-start gap-10">

                {/* Left: Avatar Section */}
                <div className="flex flex-col items-center shrink-0 w-full lg:w-fit">
                  <div className="relative group">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden ring-8 ring-zinc-50 dark:ring-zinc-800 shadow-2xl relative bg-white dark:bg-zinc-800"
                    >
                      <img
                        src={
                          selectedImage ||
                          user?.image ||
                          `https://ui-avatars.com/api/?name=${user?.name}&background=259461&color=fff&size=200`
                        }
                        alt="profile"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      <AnimatePresence>
                        {isEditMode && (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-zinc-900/60 flex flex-col items-center justify-center text-white backdrop-blur-[2px] transition-colors hover:bg-zinc-900/70"
                          >
                            <Camera size={32} className="mb-1" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Choose Image</span>
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {!isEditMode && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-zinc-900 shadow-lg flex items-center justify-center text-white"
                      >
                        <Check size={14} strokeWidth={4} />
                      </motion.div>
                    )}
                  </div>

                  <div className="mt-6 text-center lg:text-left space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-[10px] font-black uppercase tracking-widest mx-auto lg:mx-0">
                      <ShieldCheck size={12} />
                      Verified {user?.role}
                    </div>
                  </div>
                </div>

                {/* Right: Info Section */}
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        {isEditMode ? "Edit Profile Settings" : user?.name}
                      </h2>
                      <p className="text-zinc-500 font-medium text-sm">
                        {isEditMode ? "Sensitive information is protected" : "Personal Profile & Account"}
                      </p>
                    </div>

                    {!isEditMode ? (
                      <Button onClick={handleEditClick} className="w-full sm:w-auto">
                        <Edit3 size={16} />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>
                          Cancel
                        </Button>
                        <Button variant="success" onClick={handleSave} loading={isSaving}>
                          <Check size={16} />
                          Apply Changes
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Layout Switching with Framer Motion */}
                  <AnimatePresence mode="wait">
                    {!isEditMode ? (
                      <motion.div
                        key="view"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10"
                      >
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Email Address</p>
                          <p className="text-zinc-800 dark:text-zinc-200 font-bold flex items-center gap-2">
                            <Mail size={16} className="text-zinc-400" /> {user?.email}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Phone Number</p>
                          <p className="text-zinc-800 dark:text-zinc-200 font-bold flex items-center gap-2">
                            <Phone size={16} className="text-zinc-400" /> {user?.phone || "Not provided"}
                          </p>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Home Address</p>
                          <p className="text-zinc-800 dark:text-zinc-200 font-bold flex items-center gap-2">
                            <MapPin size={16} className="text-zinc-400" /> {user?.address || "Street address not set"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Joining Date</p>
                          <p className="text-zinc-800 dark:text-zinc-200 font-bold flex items-center gap-2">
                            <Calendar size={16} className="text-zinc-400" /> Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "2024"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Login Method</p>
                          <p className="text-zinc-800 dark:text-zinc-200 font-bold flex items-center gap-2 italic">
                            <ShieldCheck size={16} className="text-primary" /> {user?.authProvider || "Standard"}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <InputField
                            label="Full Display Name"
                            icon={User}
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="Type your name..."
                          />
                          <InputField
                            label="Phone Contact"
                            icon={Phone}
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="Country code + number"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <InputField
                            label="Current Email"
                            icon={Mail}
                            value={user?.email}
                            disabled
                          />
                          <InputField
                            label="Home Location"
                            icon={MapPin}
                            value={formData.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            placeholder="Apartment, Street, City"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5">
                          <div className="flex-1 space-y-2 group">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                              Preferred Language
                            </label>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">
                                <Globe size={18} />
                              </div>
                              <select
                                value={formData.language}
                                onChange={(e) => handleInputChange("language", e.target.value)}
                                className="w-full pl-12 pr-10 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent rounded-2xl focus:border-primary/30 outline-none transition-all appearance-none cursor-pointer font-bold text-sm"
                              >
                                <option>English</option>
                                <option>Bengali</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                <ChevronRight size={16} className="rotate-90" />
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-800 ring-1 ring-zinc-100 dark:ring-zinc-700 rounded-2xl group transition-all hover:bg-zinc-100 dark:hover:bg-zinc-700/80">
                            <div>
                              <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                Push Notifications
                              </p>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                                Important ride status alerts
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.notifications}
                                onChange={(e) => handleInputChange("notifications", e.target.checked)}
                              />
                              <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </Card>

          {/* Secondary settings sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* System Preferences Card */}
            <Card className="flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-primary">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">Regional Settings</h3>
                    <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Language & Accessibility</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex-1">
                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl flex justify-between items-center transition-all hover:ring-2 hover:ring-zinc-100 dark:hover:ring-zinc-700">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm">
                      <Bell size={20} className="text-zinc-500" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        Ride Notifications
                      </p>
                      <p className="text-xs text-zinc-500 font-medium">
                        Alerts for booking and driver arrival
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.notifications}
                      onChange={(e) => handleInputChange("notifications", e.target.checked)}
                      disabled={isEditMode}
                    />
                    <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl flex justify-between items-center transition-all hover:ring-2 hover:ring-zinc-100 dark:hover:ring-zinc-700">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm">
                      <Globe size={20} className="text-zinc-500" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        Default Language
                      </p>
                      <p className="text-xs text-zinc-500 font-medium">
                        Used for interface and support
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-700 px-4 py-2 rounded-xl font-bold text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-100 dark:border-zinc-600">
                    {formData.language}
                  </div>
                </div>
              </div>
            </Card>

            {/* Security Section */}
            <Card className="flex flex-col relative overflow-hidden group">
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">Account Security</h3>
                    <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Privacy & Protection</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex-1">
                <div className="p-5 bg-zinc-900 dark:bg-zinc-100 rounded-[2rem] text-white dark:text-zinc-900 overflow-hidden relative">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">
                      Last Session Identified
                    </p>
                    <p className="text-xl font-black tracking-tight">
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-[11px] font-bold py-1.5 px-3 bg-white/10 dark:bg-zinc-900/10 rounded-full w-fit">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      Active Session Verified
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-between group/btn py-4">
                    <span className="flex items-center gap-2">
                      <Settings size={18} />
                      Management Dashboard
                    </span>
                    <ChevronRight size={16} className="text-zinc-400 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>

                  <Button variant="accent" className="w-full group/sec py-4">
                    Change Account Password
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}