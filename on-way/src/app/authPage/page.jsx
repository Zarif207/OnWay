"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaGithub, FaUser, FaChevronLeft } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useUsers } from '@/hooks/useUsers';

const AuthPage = () => {
    const [isActive, setIsActive] = useState(false);
    const { status } = useSession();
    const { findUser } = useUsers();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { register: loginReg, handleSubmit: handleLogin, watch: loginWatch, formState: { errors: loginErrors } } = useForm();
    const { register: regReg, handleSubmit: handleRegister } = useForm();

    const currentEmail = loginWatch("email");

    useEffect(() => {
        if (status === "authenticated") router.push("/");
    }, [status, router]);

    const onLoginSubmit = async (data) => {
        setLoading(true);
        const toastId = toast.loading("Verifying credentials...");
        try {
            const result = await signIn("credentials", { ...data, redirect: false });
            if (result?.error) toast.error("Invalid email or password", { id: toastId });
            else { toast.success("Welcome back!", { id: toastId }); router.push("/"); router.refresh(); }
        } catch (error) { toast.error("An unexpected error occurred", { id: toastId }); }
        finally { setLoading(false); }
    };

    const onRegisterSubmit = async (data) => {
        setLoading(true);
        const toastId = toast.loading("Checking details...");
        try {
            const userExists = await findUser(data.email);
            if (userExists) { setLoading(false); return toast.error("Email already registered!", { id: toastId }); }
            const res = await fetch("/api/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email }),
            });
            if (res.ok) {
                const result = await res.json();
                localStorage.setItem("tempUser", JSON.stringify({ ...data, otp: result.otp }));
                toast.success("OTP Sent to Email!", { id: toastId });
                router.push("/verify-email");
            }
        } catch (err) { toast.error("Error sending OTP", { id: toastId }); }
        finally { setLoading(false); }
    };

    if (status === "loading") return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className={`relative overflow-hidden w-250 max-w-full min-h-162.5 bg-white rounded-[40px] shadow flex transition-all duration-700`}>

                {/* --- REGISTER FORM --- */}
                <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 z-1 opacity-0 ${isActive ? 'translate-x-full opacity-100 z-5' : ''}`}>
                    <form onSubmit={handleRegister(onRegisterSubmit)} className="flex flex-col items-center justify-center h-full px-10 bg-white text-center">
                        <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter text-neutral">Register</h1>
                        <div className="h-1.5 w-12 bg-primary mb-6 rounded-full"></div>
                        <div className="w-full space-y-3">
                            <input {...regReg("name", { required: true })} className="input input-bordered w-full h-12 rounded-2xl bg-gray-50 border-none" placeholder="Full Name" />
                            <div className="grid grid-cols-2 gap-2">
                                <input {...regReg("email", { required: true })} type="email" className="input input-bordered w-full h-12 rounded-2xl bg-gray-50 border-none" placeholder="Email" />
                                <input {...regReg("phone", { required: true })} className="input input-bordered w-full h-12 rounded-2xl bg-gray-50 border-none" placeholder="Phone" />
                            </div>
                            <input {...regReg("password", { required: true })} type="password" className="input input-bordered w-full h-12 rounded-2xl bg-gray-50 border-none" placeholder="Password" />
                            <button disabled={loading} className="btn btn-primary w-full rounded-2xl text-white font-black uppercase mt-4">Sign Up</button>
                        </div>
                    </form>
                </div>

                {/* --- LOGIN FORM --- */}
                <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 z-2 ${isActive ? 'translate-x-full opacity-0' : ''}`}>
                    <form onSubmit={handleLogin(onLoginSubmit)} className="flex flex-col items-center justify-center h-full px-12 bg-white text-center">
                        <div className="w-full text-left mb-4">
                            <Link href="/" className="text-[10px] font-black text-gray-400 hover:text-primary flex items-center gap-1 transition-all">
                                <FaChevronLeft /> BACK TO HOME
                            </Link>
                        </div>
                        <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter text-neutral">Sign In</h1>
                        <div className="h-1.5 w-12 bg-primary mb-8 rounded-full"></div>

                        <div className="w-full space-y-4">
                            <div className="space-y-1 text-left">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Email Address</label>
                                <input {...loginReg("email", { required: true })} type="email" className="input input-bordered w-full h-14 rounded-2xl bg-gray-50 border-none" placeholder="Enter Email" />
                            </div>

                            <div className="space-y-1 text-left">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Password</label>
                                    {/* --- FORGOT LINK ADDED HERE --- */}
                                    <Link href={`/forgot-password?email=${currentEmail || ""}`} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter">
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input {...loginReg("password", { required: true })} type={showPassword ? "text" : "password"} className="input input-bordered w-full h-14 rounded-2xl bg-gray-50 border-none" placeholder="••••••••" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <button disabled={loading} className="btn btn-primary w-full rounded-2xl text-white font-black uppercase h-14 border-none shadow-lg shadow-primary/30 mt-2">Login</button>
                        </div>

                        <div className="relative my-6 w-full text-center">
                            <span className="bg-white px-4 text-gray-400 text-[10px] font-black relative z-10 uppercase tracking-widest">Or login with</span>
                            <div className="absolute top-1/2 w-full h-px bg-gray-100 left-0"></div>
                        </div>

                        <div className="flex gap-4 w-full">
                            <button type="button" onClick={() => signIn("google")} className="btn flex-1 bg-white border-gray-100 rounded-2xl h-12 text-[11px] font-bold shadow-sm"><FcGoogle size={18} className="mr-2" /> Google</button>
                            <button type="button" onClick={() => signIn("github")} className="btn flex-1 bg-black text-white border-none rounded-2xl h-12 text-[11px] font-bold shadow-sm"><FaGithub size={18} className="mr-2" /> GitHub</button>
                        </div>
                    </form>
                </div>

                {/* --- OVERLAY PANEL --- */}
                <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 z-100 ${isActive ? '-translate-x-full rounded-r-[80px]' : 'rounded-l-[80px]'}`}>
                    <div className={`relative -left-full h-full w-[200%] bg-primary text-white transition-transform duration-700 ${isActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute min-w-full min-h-full object-cover opacity-40"
                            >
                                <source
                                    src="https://res.cloudinary.com/dztsihg3x/video/upload/v1775048957/Car_driving_on_road_crhdv4.webm"
                                    type="video/webm"
                                />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div className="absolute inset-0 bg-primary/60"></div>
                        <div className="relative z-10 h-full w-full flex">
                            <div className={`w-1/2 flex flex-col items-center justify-center px-12 text-center transition-transform duration-700 ${isActive ? 'translate-x-0' : '-translate-x-[20%]'}`}>
                                <h1 className="text-5xl font-black italic tracking-tighter">OnWay.</h1>
                                <p className="my-8 text-sm font-medium opacity-90">Welcome back! Please login with your personal info to continue.</p>
                                <button onClick={() => setIsActive(false)} className="btn btn-outline border-white text-white rounded-2xl px-12 border-2 hover:bg-white hover:text-primary">Sign In</button>
                            </div>
                            <div className={`w-1/2 flex flex-col items-center justify-center px-12 text-center transition-transform duration-700 ${isActive ? 'translate-x-[20%]' : 'translate-x-0'}`}>
                                <h1 className="text-5xl font-black italic tracking-tighter">OnWay.</h1>
                                <p className="my-8 text-sm font-medium opacity-90">Register today and start using the best commuting platform.</p>
                                <button onClick={() => setIsActive(true)} className="btn btn-outline border-white text-white rounded-2xl px-12 border-2 hover:bg-white hover:text-primary">Sign Up</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AuthPage;

