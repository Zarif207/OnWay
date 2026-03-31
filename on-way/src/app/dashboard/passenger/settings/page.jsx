'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Lock,
    CreditCard,
    MapPin,
    Bell,
    Ticket,
    Globe,
    Moon,
    History,
    Phone,
    LogOut,
    Trash2,
    Camera,
    Plus,
    Edit2,
    X,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Save,
    Smartphone,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const SettingsPage = () => {
    const [activeSection, setActiveSection] = useState('profile');
    const [showPassword, setShowPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null);

    // State management
    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 234 567 8900',
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    });

    const [notifications, setNotifications] = useState({
        bookingConfirmation: true,
        rideReminders: true,
        promotionalEmails: false,
        smsNotifications: true,
        pushNotifications: true,
    });

    const [paymentMethods, setPaymentMethods] = useState([
        { id: 1, type: 'card', last4: '4242', brand: 'Visa', isDefault: true },
        { id: 2, type: 'paypal', email: 'john@paypal.com', isDefault: false },
    ]);

    const [savedLocations, setSavedLocations] = useState([
        { id: 1, name: 'Home', address: '123 Main St, City' },
        { id: 2, name: 'Work', address: '456 Business Ave, City' },
    ]);

    const [promoCodes, setPromoCodes] = useState([
        { id: 1, code: 'SAVE20', discount: '20%', expiryDate: '2025-12-31', used: true },
        { id: 2, code: 'RIDE50', discount: '$5 off', expiryDate: '2025-11-30', used: false },
    ]);

    const [emergencyContact, setEmergencyContact] = useState({
        name: 'Jane Doe',
        phone: '+1 234 567 8901',
        relationship: 'Sister',
    });

    const { register, handleSubmit, reset } = useForm();

    // Section components
    const openModal = (type) => {
        setModalType(type);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType(null);
    };

    const handleProfileUpdate = (data) => {
        setProfile({ ...profile, ...data });
        toast.success('Profile updated successfully!');
        closeModal();
    };

    const handleCardAddition = () => {
        toast.success('Payment method added!');
        closeModal();
    };

    const handleLocationAdd = () => {
        toast.success('Location saved!');
        closeModal();
    };

    const handlePromoCodeAdd = (code) => {
        toast.success(`${code} applied!`);
        closeModal();
    };

    const handlePasswordChange = () => {
        toast.success('Password changed successfully!');
        closeModal();
    };

    const handleEmergencyContactUpdate = () => {
        toast.success('Emergency contact updated!');
        closeModal();
    };

    const handleLogout = () => {
        toast.success('Logged out successfully!');
        // Handle logout logic
    };

    const handleDeleteAccount = () => {
        toast.error('Account deletion is being processed...');
        closeModal();
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const sectionVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
    };

    // Modal Components
    const EditProfileModal = () => (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
            >
                <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
                <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                            {...register('name')}
                            defaultValue={profile.name}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter your name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <input
                            {...register('phone')}
                            defaultValue={profile.phone}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter your phone"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            {...register('email')}
                            type="email"
                            defaultValue={profile.email}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );

    const PasswordChangeModal = () => (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
            >
                <h3 className="text-xl font-bold mb-4">Change Password</h3>
                <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter new password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Confirm Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Confirm new password"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
                        >
                            <Lock size={18} />
                            Update Password
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );

    const DeleteAccountModal = () => (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white rounded-2xl p-6 max-w-md w-full border-l-4 border-red-500"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
            >
                <div className="flex items-start gap-3 mb-4">
                    <AlertCircle size={24} className="text-red-500 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-xl font-bold">Delete Account</h3>
                        <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
                    </div>
                </div>
                <p className="text-gray-700 mb-4">
                    Are you sure you want to delete your account? All your data, including ride history and saved locations, will be permanently deleted.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={closeModal}
                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeleteAccount}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                    >
                        <Trash2 size={18} />
                        Delete Account
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );

    // Section Renderers
    const ProfileSection = () => (
        <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
        >
            <motion.div
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer"
                whileHover={{ y: -2 }}
                onClick={() => openModal('profile')}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                            <img
                                src={profile.photo}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover"
                            />
                            <button className="absolute bottom-0 right-0 bg-primary p-2 rounded-full text-white hover:opacity-80 transition">
                                <Camera size={14} />
                            </button>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{profile.name}</h3>
                            <p className="text-sm text-gray-600">{profile.email}</p>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone size={16} />
                    {profile.phone}
                </p>
            </motion.div>
        </motion.div>
    );

    const SecuritySection = () => (
        <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
        >
            <motion.div
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                whileHover={{ y: -2 }}
                onClick={() => openModal('password')}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-opacity-10 bg-primary rounded-lg flex items-center justify-center">
                            <Lock size={20} className="text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">Change Password</p>
                            <p className="text-xs text-gray-600">Update your security</p>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-400" />
                </div>
            </motion.div>

            <motion.div
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
                whileHover={{ y: -2 }}
                onClick={() => openModal('otp')}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-opacity-10 bg-accent rounded-lg flex items-center justify-center">
                            <Smartphone size={20} className="text-accent" />
                        </div>
                        <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-xs text-gray-600">
                                <CheckCircle size={12} className="inline mr-1" />
                                Enabled
                            </p>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-400" />
                </div>
            </motion.div>
        </motion.div>
    );

    const PaymentSection = () => (
        <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
        >
            {paymentMethods.map((method, idx) => (
                <motion.div
                    key={method.id}
                    className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
                    whileHover={{ y: -2 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-opacity-10 bg-primary rounded-lg flex items-center justify-center">
                                <CreditCard size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">
                                    {method.type === 'card'
                                        ? `${method.brand} •••• ${method.last4}`
                                        : `PayPal - ${method.email}`}
                                </p>
                                {method.isDefault && (
                                    <p className="text-xs text-green-600 font-medium">Default Method</p>
                                )}
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-red-500 transition">
                            <X size={20} />
                        </button>
                    </div>
                </motion.div>
            ))}

            <motion.button
                className="w-full bg-gradient-to-r from-primary to-accent text-white rounded-2xl py-3 font-medium flex items-center justify-center gap-2 hover:shadow-lg transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal('addcard')}
            >
                <Plus size={20} />
                Add Payment Method
            </motion.button>
        </motion.div>
    );

    const LocationsSection = () => (
        <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
        >
            {savedLocations.map((location, idx) => (
                <motion.div
                    key={location.id}
                    className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
                    whileHover={{ y: -2 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center mt-1">
                                <MapPin size={20} className="text-accent" />
                            </div>
                            <div>
                                <p className="font-medium">{location.name}</p>
                                <p className="text-sm text-gray-600">{location.address}</p>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-primary transition">
                            <Edit2 size={18} />
                        </button>
                    </div>
                </motion.div>
            ))}

            <motion.button
                className="w-full bg-gradient-to-r from-primary to-accent text-white rounded-2xl py-3 font-medium flex items-center justify-center gap-2 hover:shadow-lg transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal('addlocation')}
            >
                <Plus size={20} />
                Add Location
            </motion.button>
        </motion.div>
    );

    const NotificationsSection = () => (
        <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
        >
            {Object.entries(notifications).map(([key, value]) => (
                <motion.div
                    key={key}
                    className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between"
                    whileHover={{ y: -2 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-opacity-10 bg-primary rounded-lg flex items-center justify-center">
                            <Bell size={20} className="text-primary" />
                        </div>
                        <div>
                            <p className="font-medium capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-xs text-gray-600">
                                {value ? 'Turned on' : 'Turned off'}
                            </p>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                            setNotifications({
                                ...notifications,
                                [key]: e.target.checked,
                            })
                        }
                        className="w-6 h-6 cursor-pointer accent-primary"
                    />
                </motion.div>
            ))}
        </motion.div>
    );

    const PromoCodesSection = () => (
        <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
        >
            {promoCodes.map((promo, idx) => (
                <motion.div
                    key={promo.id}
                    className="bg-gradient-to-r from-accent via-accent to-emerald-50 rounded-2xl p-4 border border-accent border-opacity-30 shadow-sm hover:shadow-md transition"
                    whileHover={{ y: -2 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-lg text-accent bg-opacity-10">{promo.code}</p>
                            <p className="text-sm text-gray-600">Get {promo.discount}</p>
                            <p className="text-xs text-gray-500">Expires: {promo.expiryDate}</p>
                        </div>
                        <button
                            className={`px-4 py-2 rounded-lg font-medium transition ${promo.used
                                    ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                                    : 'bg-accent text-white hover:bg-opacity-90'
                                }`}
                            onClick={() => !promo.used && handlePromoCodeAdd(promo.code)}
                            disabled={promo.used}
                        >
                            {promo.used ? 'Used' : 'Apply'}
                        </button>
                    </div>
                </motion.div>
            ))}

            <motion.div className="bg-white rounded-2xl p-4 shadow-sm">
                <input
                    type="text"
                    placeholder="Enter promo code"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                />
                <button className="w-full bg-gradient-to-r from-primary to-accent text-white rounded-lg py-2 font-medium hover:shadow-lg transition">
                    Apply Code
                </button>
            </motion.div>
        </motion.div>
    );

    const EmergencyContactSection = () => (
        <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
        >
            <motion.div
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer"
                whileHover={{ y: -2 }}
                onClick={() => openModal('emergency')}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <Phone size={24} className="text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{emergencyContact.name}</h3>
                            <p className="text-sm text-gray-600">{emergencyContact.relationship}</p>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone size={16} />
                    {emergencyContact.phone}
                </p>
            </motion.div>

            <motion.button
                className="w-full bg-gradient-to-r from-primary to-accent text-white rounded-2xl py-3 font-medium flex items-center justify-center gap-2 hover:shadow-lg transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal('emergency')}
            >
                <Edit2 size={20} />
                Edit Emergency Contact
            </motion.button>
        </motion.div>
    );

    const DangerZoneSection = () => (
        <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
        >
            <motion.button
                className="w-full bg-gradient-to-r from-primary to-accent text-white rounded-2xl py-3 font-medium flex items-center justify-center gap-2 hover:shadow-lg transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
            >
                <LogOut size={20} />
                Logout
            </motion.button>

            <motion.button
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl py-3 font-medium flex items-center justify-center gap-2 hover:shadow-lg transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal('delete')}
            >
                <Trash2 size={20} />
                Delete Account
            </motion.button>
        </motion.div>
    );

    const sectionMap = {
        profile: {
            label: 'Profile',
            icon: User,
            component: ProfileSection,
        },
        security: {
            label: 'Security',
            icon: Lock,
            component: SecuritySection,
        },
        payment: {
            label: 'Payment Methods',
            icon: CreditCard,
            component: PaymentSection,
        },
        locations: {
            label: 'Saved Locations',
            icon: MapPin,
            component: LocationsSection,
        },
        notifications: {
            label: 'Notifications',
            icon: Bell,
            component: NotificationsSection,
        },
        promo: {
            label: 'Promo Codes',
            icon: Ticket,
            component: PromoCodesSection,
        },
        emergency: {
            label: 'Emergency Contact',
            icon: Phone,
            component: EmergencyContactSection,
        },
        danger: {
            label: 'Account',
            icon: LogOut,
            component: DangerZoneSection,
        },
    };

    const CurrentSection = sectionMap[activeSection]?.component || ProfileSection;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50" data-theme="onwaytheme">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your account and preferences</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <motion.div
                        className="lg:col-span-1"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="bg-white rounded-2xl shadow-sm p-2 sticky top-8">
                            {Object.entries(sectionMap).map(([key, section]) => {
                                const Icon = section.icon;
                                return (
                                    <motion.button
                                        key={key}
                                        onClick={() => setActiveSection(key)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition mb-1 ${activeSection === key
                                                ? 'bg-primary text-white shadow-lg'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        variants={itemVariants}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium">{section.label}</span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        className="lg:col-span-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence mode="wait">
                            <CurrentSection />
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showModal && modalType === 'profile' && <EditProfileModal />}
                {showModal && modalType === 'password' && <PasswordChangeModal />}
                {showModal && modalType === 'delete' && <DeleteAccountModal />}
            </AnimatePresence>
        </div>
    );
};

export default SettingsPage;