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
  LogOut
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

function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2";

  const styles = {
    primary: "bg-primary text-white hover:bg-primary/90",
    accent: "bg-accent text-white hover:bg-accent/90",
    outline: "border border-base-300 text-secondary hover:bg-base-200",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

/* ---------- Profile Page ---------- */

export default function Profile() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const res = await fetch(
            `http://localhost:4000/api/passenger/${session.user.id}`
          );
          const result = await res.json();
          setUser(result.data || result);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else if (status === "unauthenticated") {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, status]);

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

              {/* User Info */}

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                  <h2 className="text-2xl font-bold text-secondary">
                    {user.name}
                  </h2>

                  <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-semibold">
                    {user.role}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">

                  <p className="flex items-center gap-2 text-gray-600">
                    <Mail size={16} /> {user.email}
                  </p>

                  <p className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} /> {user.phone}
                  </p>

                  <p className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>

                  <p className="flex items-center gap-2 text-gray-600">
                    <ShieldCheck size={16} />
                    {user.authProvider}
                  </p>
                </div>
              </div>

              <Button variant="accent">Edit Profile</Button>

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
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
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
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="select select-bordered select-sm"
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