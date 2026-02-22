
"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaLock, FaChevronRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        const toastId = toast.loading("Sending verification code...");

        try {
            const generatedOTP = Math.floor(100000 + Math.random() * 900000);

            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email, otp: generatedOTP }),
            });

            if (response.ok) {
                const tempUser = { ...data, otp: generatedOTP };
                localStorage.setItem("tempUser", JSON.stringify(tempUser));

                toast.success("OTP sent to your email!", { id: toastId });
                router.push("/verify-email");
            } else {
                throw new Error("Failed to send OTP");
            }
        } catch (error) {
            toast.error(error.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 font-sans selection:bg-primary selection:text-white">
            <div className="w-full max-w-5xl bg-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row border border-white/20">
                {/* LEFT SIDE: Brand Identity */}
                <div className="md:w-[40%] bg-neutral p-10 flex flex-col justify-between text-white relative overflow-hidden group">
                    <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110 opacity-40"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    </div>
                    <div className="absolute inset-0 bg-linear-to-b from-neutral/90 via-neutral/60 to-primary/40 z-0"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-1">OnWay<span className="text-primary animate-bounce">.</span></h1>
                        <p className="mt-4 text-gray-300 text-sm font-medium leading-relaxed max-w-55 backdrop-blur-sm bg-black/10 p-2 rounded-lg">The next generation of commuting in Bangladesh.</p>
                    </div>
                    <div className="relative z-10 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex justify-between items-center">
                        <span>OnWay Inc • 2026</span>
                    </div>
                </div>

                {/* RIGHT SIDE: Form */}
                <div className="md:w-[60%] p-8 lg:p-14 bg-white">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black text-neutral uppercase tracking-tight">Create Account</h3>
                        <a href="/login" className="text-xs font-bold text-gray-400 hover:text-primary transition-all flex items-center gap-1 group">
                            LOG IN <FaChevronRight className="group-hover:translate-x-1 transition-transform" size={10} />
                        </a>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Full Name</label>
                            <div className="relative">
                                <FaUser className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.name ? 'text-error' : 'text-gray-300'}`} />
                                <input {...register("name", { required: "Name is required" })} className="input input-bordered w-full pl-12 rounded-2xl" placeholder="Enter Your Name" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Email</label>
                                <input {...register("email", { required: "Email is required" })} type="email" className="input input-bordered w-full rounded-2xl" placeholder="Enter Your Email" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Phone</label>
                                <input {...register("phone", { required: "Phone is required" })} className="input input-bordered w-full rounded-2xl" placeholder="01XXXXXXXXX" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Password</label>
                            <div className="relative">
                                <input {...register("password", { required: "Password is required", minLength: 6 })} type={showPassword ? "text" : "password"} className="input input-bordered w-full rounded-2xl" placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <button disabled={loading} type="submit" className="btn btn-primary w-full rounded-2xl text-white font-bold uppercase">
                            {loading ? <span className="loading loading-spinner"></span> : "Get Verification Code"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;