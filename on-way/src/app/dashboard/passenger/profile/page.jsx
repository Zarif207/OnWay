'use client';

import { useState } from 'react';
import {
  MapPin,
  Phone,
  Bell,
  Globe,
  Settings,
} from 'lucide-react';

/* ---------- UI Components ---------- */

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, variant = 'primary', className = '' }) {
  const base =
    'px-4 py-2 rounded-lg text-sm font-medium transition';

  const styles = {
    primary: 'bg-black text-white hover:opacity-90',
    accent: 'bg-primary text-black hover:bg-primary',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

/* ---------- Profile Page ---------- */

export default function Profile() {
  const [acPreferred, setAcPreferred] = useState(true);
  const [quietDriver, setQuietDriver] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');

  const savedAddresses = [
    { label: 'Home', address: '123 Main Street, City' },
    { label: 'Work', address: 'Tech Park, Block A' },
  ];

  const emergencyContacts = [
    { name: 'John Doe', phone: '+123456789' },
    { name: 'Jane Smith', phone: '+987654321' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">
            Profile & Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your personal preferences and ride settings.
          </p>
        </div>

        {/* Saved Addresses */}
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-black flex items-center gap-2">
              <MapPin className="text-primary" />
              Saved Addresses
            </h3>
            <Button variant="accent">Add Address</Button>
          </div>

          <div className="space-y-4">
            {savedAddresses.map((item, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-black">
                    {item.label}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.address}
                  </p>
                </div>
                <Button variant="outline">Edit</Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Emergency Contacts */}
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-black flex items-center gap-2">
              <Phone className="text-primary" />
              Emergency Contacts
            </h3>
            <Button variant="accent">Add Contact</Button>
          </div>

          <div className="space-y-4">
            {emergencyContacts.map((contact, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-black">
                    {contact.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {contact.phone}
                  </p>
                </div>
                <Button variant="outline">Edit</Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Ride Preferences */}
        <Card className="mb-8">
          <h3 className="text-xl font-semibold text-black mb-6 flex items-center gap-2">
            <Settings className="text-primary" />
            Ride Preferences
          </h3>

          <div className="space-y-4">

            {/* AC Preference */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-black">
                  Air Conditioned Ride
                </p>
                <p className="text-sm text-gray-500">
                  Prefer AC vehicles
                </p>
              </div>

              <input
                type="checkbox"
                checked={acPreferred}
                onChange={() => setAcPreferred(!acPreferred)}
                className="w-5 h-5 accent-yellow-400"
              />
            </div>

            {/* Quiet Driver */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-black">
                  Quiet Driver
                </p>
                <p className="text-sm text-gray-500">
                  Minimal conversation during ride
                </p>
              </div>

              <input
                type="checkbox"
                checked={quietDriver}
                onChange={() => setQuietDriver(!quietDriver)}
                className="w-5 h-5 accent-yellow-400"
              />
            </div>

          </div>
        </Card>

        {/* Notifications & Language */}
        <Card>
          <h3 className="text-xl font-semibold text-black mb-6 flex items-center gap-2">
            <Bell className="text-primary" />
            Notifications & Language
          </h3>

          <div className="space-y-6">

            {/* Notifications */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-black">
                  Ride Notifications
                </p>
                <p className="text-sm text-gray-500">
                  Get alerts for ride updates
                </p>
              </div>

              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                className="w-5 h-5 accent-yellow-400"
              />
            </div>

            {/* Language */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Globe className="text-primary" />
                <p className="font-semibold text-black">
                  Language
                </p>
              </div>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>

          </div>
        </Card>

      </div>
    </div>
  );
}