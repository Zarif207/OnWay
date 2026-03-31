"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
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

// import OnWayLoading from "@/app/components/Loading/page";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
    success: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200",
    ghost: "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : children}
    </button>
  );
}

const InputField = ({ label, icon: Icon, value, onChange, placeholder, disabled = false, type = "text" }) => (
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
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${Icon ? "pl-12" : "px-4"} pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-900 outline-none transition-all ${disabled ? "opacity-60 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800" : ""
          }`}
      />
    </div>
  </div>
);

/* ---------- Profile Page ---------- */

export default function Profile() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notifications: true,
    language: "English"
  });

  const [originalData, setOriginalData] = useState(null);

  // Fetch from Database
  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/passenger/find?email=${session.user.email}`);
          const result = await res.json();
          const dbData = result.data || result;

          setUser(dbData);

          // Set initial form data (DB values prioritised, session name as backup)
          const initialForm = {
            name: dbData.name || session.user.name || "",
            phone: dbData.phone || "",
            address: dbData.address || "",
            notifications: dbData.notifications !== false,
            language: dbData.language || "English"
          };

          setFormData(initialForm);
          setOriginalData(initialForm);
        } catch (err) {
          console.error("Fetch Error:", err);
          toast.error("Failed to load profile data from server");
        } finally {
          setLoading(false);
        }
      } else if (status === "unauthenticated") {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, status]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error("Image must be under 2MB");
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return toast.error("Name cannot be empty");

    setIsSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/passenger/profile/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || session.user.id,
          email: session.user.email,
          ...formData,
          image: selectedImage
        })
      });

      const result = await response.json();
      if (response.ok) {
        setUser(result.data);
        setIsEditMode(false);
        setOriginalData(formData);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(result.message || "Update failed");
      }
    } catch (err) {
      toast.error("An error occurred during save");
    } finally {
      setIsSaving(false);
    }
  };

  // if (loading) return <OnWayLoading />;

  if (status === "unauthenticated") {
    return (
      <div className="flex justify-center items-center h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
        <Card className="max-w-md w-full text-center">
          <ShieldCheck size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-black">Access Denied</h2>
          <p className="text-zinc-500 mb-6">Please sign in to view your profile.</p>
          <Button className="w-full" onClick={() => (window.location.href = "/login")}>Go to Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-8 md:p-10 lg:p-12">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-zinc-100">My Profile</h1>
            <p className="text-zinc-500 font-medium">Manage your account information and preferences.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.history.back()}><ArrowLeft size={16} /> Back</Button>
            <Button variant="danger" onClick={() => signOut()}><LogOut size={16} /> Log Out</Button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <Card noPadding className="relative">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary/10 to-transparent" />

            <div className="p-6 md:p-10 relative">
              <div className="flex flex-col lg:flex-row gap-10">

                {/* Avatar Section */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative group w-32 h-32 md:w-40 md:h-40">
                    <img
                      src={selectedImage || user?.image || `https://ui-avatars.com/api/?name=${formData.name}&background=259461&color=fff`}
                      alt="Profile"
                      className="w-full h-full rounded-[2.5rem] object-cover ring-8 ring-zinc-50 dark:ring-zinc-800 shadow-xl"
                    />
                    {isEditMode && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 rounded-[2.5rem] flex flex-col items-center justify-center text-white backdrop-blur-sm"
                      >
                        <Camera size={24} />
                        <span className="text-[10px] font-bold uppercase mt-1">Change</span>
                      </button>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                  <div className="mt-4 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">
                    Verified Passenger
                  </div>
                </div>

                {/* Information Section */}
                <div className="flex-1 space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black">{isEditMode ? "Editing Profile" : formData.name}</h2>
                      <p className="text-zinc-500 text-sm">{user?.email}</p>
                    </div>
                    {!isEditMode ? (
                      <Button onClick={() => setIsEditMode(true)}><Edit3 size={16} /> Edit Profile</Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => { setIsEditMode(false); setFormData(originalData); setSelectedImage(null); }}>Cancel</Button>
                        <Button variant="success" onClick={handleSave} loading={isSaving}><Check size={16} /> Save</Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Full Name"
                      icon={User}
                      value={formData.name}
                      disabled={!isEditMode}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                    {/* Fixed Email Field - Session based */}
                    <InputField
                      label="Email (Verified)"
                      icon={Mail}
                      value={user?.email || session?.user?.email}
                      disabled={true}
                    />
                    <InputField
                      label="Phone Number"
                      icon={Phone}
                      value={formData.phone}
                      disabled={!isEditMode}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                    <InputField
                      label="Home Address"
                      icon={MapPin}
                      value={formData.address}
                      disabled={!isEditMode}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Preferred Language</label>
                      <select
                        disabled={!isEditMode}
                        value={formData.language}
                        onChange={(e) => handleInputChange("language", e.target.value)}
                        className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent rounded-2xl outline-none appearance-none font-bold"
                      >
                        <option>English</option>
                        <option>Bengali</option>
                      </select>
                    </div>

                    <div className="flex-1 flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                      <div>
                        <p className="font-bold text-sm">Notifications</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Ride status updates</p>
                      </div>
                      <input
                        type="checkbox"
                        disabled={!isEditMode}
                        checked={formData.notifications}
                        onChange={(e) => handleInputChange("notifications", e.target.checked)}
                        className="w-5 h-5 accent-primary cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}