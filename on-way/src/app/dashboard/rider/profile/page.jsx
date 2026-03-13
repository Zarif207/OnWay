"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import {
    User,
    Phone,
    Mail,
    CarFront,
    IdCard,
    Camera,
    UploadCloud,
    ShieldCheck,
    Clock,
    XCircle,
    Save,
    Loader2,
    CheckCircle
} from "lucide-react";
import toast from "react-hot-toast";

import useRiders from "@/hooks/useRiders";

export default function ProfilePage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const riderId = session?.user?.id;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const { getRiderProfile, updateRiderProfile, uploadRiderImage, uploadRiderDocuments } = useRiders();

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        identity: {
            licenseNumber: "",
            issuingAuthority: "",
            expiryDate: ""
        },
        vehicle: {
            type: "",
            model: "",
            plateNumber: "",
            color: ""
        },
        documents: {
            drivingLicenseFile: "",
            vehicleRegistrationFile: ""
        },
        image: "",
        isApproved: false
    });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // 1. Fetch Profile Data
    const { data: profileData, isLoading } = useQuery({
        queryKey: ["riderProfile", riderId],
        queryFn: async () => {
            if (!riderId) return null;
            const data = await getRiderProfile(riderId);
            return data?.data; // Unpack { success: true, data: {...} }
        },
        enabled: !!riderId,
    });
    useEffect(() => {
        if (profileData) {
            setFormData({
                name: profileData.name || "",
                phone: profileData.phone || "",
                email: profileData.email || "",
                identity: {
                    licenseNumber: profileData.identity?.licenseNumber || profileData.licenseNumber || "",
                    issuingAuthority: profileData.identity?.issuingAuthority || "",
                    expiryDate: profileData.identity?.expiryDate || ""
                },
                vehicle: {
                    type: profileData.vehicle?.type || "",
                    model: profileData.vehicle?.model || "",
                    plateNumber: profileData.vehicle?.plateNumber || "",
                    color: profileData.vehicle?.color || ""
                },
                documents: {
                    drivingLicenseFile: profileData.documents?.drivingLicenseFile || "",
                    vehicleRegistrationFile: profileData.documents?.vehicleRegistrationFile || ""
                },
                image: profileData.image || "",
                isApproved: profileData.isApproved || false
            });
            setHasUnsavedChanges(false);
        }
    }, [profileData]);

    const updateProfileMutation = useMutation({
        mutationFn: async (payload) => {
            return await updateRiderProfile(riderId, payload);
        },
        onSuccess: () => {
            toast.success("Profile successfully updated.");
            queryClient.invalidateQueries(["riderProfile", riderId]);
            setHasUnsavedChanges(false);
        },
        onError: () => {
            toast.error("Failed to update profile. Please try again.");
        }
    });

    const uploadImageMutation = useMutation({
        mutationFn: async (file) => {
            return await uploadRiderImage(file);
        },
        onSuccess: (url) => {
            setFormData(prev => ({ ...prev, image: url }));
            // Automatically save to backend
            updateProfileMutation.mutate({ image: url });
        },
        onError: () => {
            toast.error("Failed to upload avatar image.");
        }
    });

    const uploadDocsMutation = useMutation({
        mutationFn: async (docData) => {
            return await uploadRiderDocuments(riderId, docData);
        },
        onSuccess: (data) => {
            toast.success("Documents uploaded successfully.");
            queryClient.invalidateQueries(["riderProfile", riderId]);
            // Local state patch
            if (data?.parsed) {
                setFormData(prev => ({
                    ...prev,
                    documents: {
                        ...prev.documents,
                        ...data.parsed.documents
                    }
                }));
            }
        },
        onError: () => {
            toast.error("Failed to upload document files.");
        }
    });

    const handleInputChange = (e, section = null) => {
        const { name, value } = e.target;
        setHasUnsavedChanges(true);

        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadImageMutation.mutate(file);
        }
    };

    const handleDocumentUpload = (e, docType) => {
        const file = e.target.files?.[0];
        if (file) {
            const fd = new FormData();
            fd.append(docType, file);
            uploadDocsMutation.mutate(fd);
        }
    };

    const handleSave = () => {
        if (!riderId) return;

        // Basic validation
        if (!formData.name || !formData.phone) {
            toast.error("Name and Phone Number are required.");
            return;
        }

        updateProfileMutation.mutate({
            name: formData.name,
            phone: formData.phone,
            identity: formData.identity,
            vehicle: formData.vehicle,
            licenseNumber: formData.identity.licenseNumber // To keep backward compatibility with backend schema
        });
    };

    // Verification Status Logic
    const getVerificationStatus = () => {
        if (formData.isApproved) {
            return { label: "Verified", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", icon: ShieldCheck };
        }
        // Simplified Logic: If license number is missing, consider it Pending/Incomplete
        if (!formData.identity.licenseNumber) {
            return { label: "Incomplete", color: "text-red-500", bg: "bg-red-50", border: "border-red-200", icon: XCircle };
        }
        return { label: "Pending Verification", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", icon: Clock };
    };

    const statusObj = getVerificationStatus();

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-12 pb-24 pt-4 px-2 xl:px-0">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full md:w-auto">
                    {/* Avatar Upload */}
                    <div className="relative group shrink-0">
                        <div className="h-28 w-28 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-xl flex items-center justify-center">
                            {uploadImageMutation.isPending ? (
                                <Loader2 size={32} className="animate-spin text-primary" />
                            ) : formData.image ? (
                                <img src={`${apiUrl.replace("/api", "")}${formData.image}`} alt="Profile" className="h-full w-full object-cover" crossOrigin="anonymous" />
                            ) : (
                                <User size={48} className="text-gray-300" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors border-2 border-white cursor-pointer group-hover:scale-105 active:scale-95">
                            <Camera size={18} />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                                disabled={uploadImageMutation.isPending}
                            />
                        </label>
                    </div>

                    <div className="space-y-3 text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-secondary">
                            My <span className="text-primary">Profile</span>
                        </h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs flex justify-center md:justify-start">
                            Manage your personal & operational data
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`mt-4 md:mt-0 flex items-center gap-3 px-6 py-4 rounded-[1.5rem] border ${statusObj.border} ${statusObj.bg} relative z-10 w-full md:w-auto justify-center md:justify-start`}>
                    <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl shadow-sm shrink-0">
                        <statusObj.icon size={20} className={statusObj.color} />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Verification Status</p>
                        <p className={`text-sm font-black uppercase tracking-widest ${statusObj.color}`}>
                            {statusObj.label}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Personal & Identity */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Personal Information */}
                    <section className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                            <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <User size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-secondary tracking-tight">Personal Details</h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Basic contact information</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full h-14 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full h-14 pl-12 pr-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        readOnly
                                        className="w-full h-14 pl-12 pr-5 bg-gray-100 border border-gray-200 rounded-2xl text-sm font-bold text-gray-500 outline-none cursor-not-allowed"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-400">Read Only</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Driving License Details */}
                    <section className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                            <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                <IdCard size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-secondary tracking-tight">Driving License</h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Official identification parameters</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">License Number</label>
                                <input
                                    type="text"
                                    name="licenseNumber"
                                    value={formData.identity.licenseNumber}
                                    onChange={(e) => handleInputChange(e, "identity")}
                                    className="w-full h-14 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-black uppercase tracking-wider text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-300 placeholder:normal-case placeholder:tracking-normal"
                                    placeholder="e.g. D12345678"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Issuing Authority</label>
                                <input
                                    type="text"
                                    name="issuingAuthority"
                                    value={formData.identity.issuingAuthority}
                                    onChange={(e) => handleInputChange(e, "identity")}
                                    className="w-full h-14 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="State DMV"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Expiry Date</label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.identity.expiryDate}
                                    onChange={(e) => handleInputChange(e, "identity")}
                                    className="w-full h-14 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </section>

                </div>

                {/* Right Column: Vehicle, Uploads, Action */}
                <div className="space-y-8">

                    {/* Vehicle Information */}
                    <section className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                            <div className="h-14 w-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                                <CarFront size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-secondary tracking-tight">Vehicle</h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Make & Registration</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Vehicle Type</label>
                                <select
                                    name="type"
                                    value={formData.vehicle.type}
                                    onChange={(e) => handleInputChange(e, "vehicle")}
                                    className="w-full h-14 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Type...</option>
                                    <option value="Car">Car</option>
                                    <option value="Bike">Bike / Scooter</option>
                                    <option value="Van">Van / SUV</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Make & Model</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.vehicle.model}
                                    onChange={(e) => handleInputChange(e, "vehicle")}
                                    className="w-full h-14 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="e.g. Toyota Camry"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Plate #</label>
                                    <input
                                        type="text"
                                        name="plateNumber"
                                        value={formData.vehicle.plateNumber}
                                        onChange={(e) => handleInputChange(e, "vehicle")}
                                        className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-black uppercase tracking-wider text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-300 placeholder:normal-case placeholder:tracking-normal"
                                        placeholder="XYZ 123"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Color</label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.vehicle.color}
                                        onChange={(e) => handleInputChange(e, "vehicle")}
                                        className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400"
                                        placeholder="Silver"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Document Uploads (Visual & Active) */}
                    <section className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-secondary mb-1">Upload Documents</h3>
                            <p className="text-xs font-bold text-gray-400 leading-relaxed max-w-sm">
                                Provide required operational scanned files.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* License Upload */}
                            <label className={`w-full relative overflow-hidden group border-2 ${formData.documents?.drivingLicenseFile ? 'border-primary bg-primary/5' : 'border-dashed border-gray-200'} rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all outline-none cursor-pointer group`}>
                                {uploadDocsMutation.isPending && uploadDocsMutation.variables?.has('drivingLicense') ? (
                                    <Loader2 className="text-primary animate-spin" size={28} />
                                ) : formData.documents?.drivingLicenseFile ? (
                                    <CheckCircle className="text-primary" size={28} />
                                ) : (
                                    <UploadCloud className="text-gray-400 group-hover:text-primary transition-colors" size={28} />
                                )}
                                <span className={`text-xs font-black uppercase tracking-widest ${formData.documents?.drivingLicenseFile ? 'text-primary' : 'text-gray-500 group-hover:text-primary'} transition-colors`}>
                                    {formData.documents?.drivingLicenseFile ? 'License Uploaded' : 'Driving License'}
                                </span>
                                {formData.documents?.drivingLicenseFile && (
                                    <a href={`${apiUrl.replace("/api", "")}${formData.documents.drivingLicenseFile}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-gray-500 mt-2 hover:underline absolute top-2 right-4">View</a>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={(e) => handleDocumentUpload(e, 'drivingLicense')}
                                    disabled={uploadDocsMutation.isPending}
                                />
                            </label>

                            {/* Registration Upload */}
                            <label className={`w-full relative overflow-hidden group border-2 ${formData.documents?.vehicleRegistrationFile ? 'border-primary bg-primary/5' : 'border-dashed border-gray-200'} rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all outline-none cursor-pointer group`}>
                                {uploadDocsMutation.isPending && uploadDocsMutation.variables?.has('vehicleRegistration') ? (
                                    <Loader2 className="text-primary animate-spin" size={28} />
                                ) : formData.documents?.vehicleRegistrationFile ? (
                                    <CheckCircle className="text-primary" size={28} />
                                ) : (
                                    <UploadCloud className="text-gray-400 group-hover:text-primary transition-colors" size={28} />
                                )}
                                <span className={`text-xs font-black uppercase tracking-widest ${formData.documents?.vehicleRegistrationFile ? 'text-primary' : 'text-gray-500 group-hover:text-primary'} transition-colors`}>
                                    {formData.documents?.vehicleRegistrationFile ? 'Registration Uploaded' : 'Vehicle Registration'}
                                </span>
                                {formData.documents?.vehicleRegistrationFile && (
                                    <a href={`${apiUrl.replace("/api", "")}${formData.documents.vehicleRegistrationFile}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-gray-500 mt-2 hover:underline absolute top-2 right-4">View</a>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={(e) => handleDocumentUpload(e, 'vehicleRegistration')}
                                    disabled={uploadDocsMutation.isPending}
                                />
                            </label>
                        </div>
                    </section>

                    {/* Action Card */}
                    <section className="bg-primary/5 p-8 md:p-10 rounded-[3rem] border border-primary/20 shadow-sm flex flex-col items-center text-center space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black tracking-tight text-secondary">Save Configuration</h3>
                            <p className="text-xs font-bold text-gray-500 px-4">
                                Update your operational data securely on the platform node.
                            </p>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={updateProfileMutation.isPending || (!hasUnsavedChanges)}
                            className={`w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
                                ${hasUnsavedChanges
                                    ? "bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/30 active:scale-95"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }
                            `}
                        >
                            {updateProfileMutation.isPending ? (
                                <><Loader2 className="animate-spin" /> Updating</>
                            ) : (
                                <><Save size={20} /> Apply Settings</>
                            )}
                        </button>
                    </section>

                </div>
            </div>
        </div>
    );
}
