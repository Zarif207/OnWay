"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaLock, FaChevronRight } from 'react-icons/fa';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);

    // React Hook Form Initialization
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log("OnWay Registration Data:", data);
    };

    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 font-sans selection:bg-primary selection:text-white">
            {/* Main Card Container */}
            <div className="w-full max-w-5xl bg-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row border border-white/20">

                {/* LEFT SIDE: Brand Identity */}
                <div className="md:w-[40%] bg-neutral p-10 flex flex-col justify-between text-white relative overflow-hidden group">
                    {/* Background Image with Overlay */}
                    <div
                        className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110 opacity-40"
                        style={{
                            backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    ></div>

                    {/* Color Gradient Overlay to maintain brand colors */}
                    <div className="absolute inset-0 bg-linear-to-b from-neutral/90 via-neutral/60 to-primary/40 z-0"></div>

                    {/* Animated Decorative Blobs */}
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary rounded-full opacity-30 blur-3xl animate-pulse z-1"></div>
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-secondary rounded-full opacity-30 blur-3xl z-1"></div>

                    <div className="relative z-10">
                        <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-1">
                            OnWay<span className="text-primary animate-bounce">.</span>
                        </h1>
                        <p className="mt-4 text-gray-300 text-sm font-medium leading-relaxed max-w-55 backdrop-blur-sm bg-black/10 p-2 rounded-lg">
                            The next generation of commuting in Bangladesh. Safe, Fast, and Pink!
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="h-1.5 w-12 bg-primary mb-6 rounded-full shadow-[0_0_15px_rgba(239,38,159,0.8)]"></div>
                        <h2 className="text-4xl font-extrabold leading-tight drop-shadow-lg">
                            Start your <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary drop-shadow-sm">Journey</span> <br />
                            with us.
                        </h2>

                        {/* Floating Badge (Unique Touch) */}
                        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            <span className="flex h-2 w-2 rounded-full bg-accent animate-ping"></span>
                            20+ Active Riders
                        </div>
                    </div>

                    <div className="relative z-10 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex justify-between items-center">
                        <span>OnWay Inc • 2024</span>
                        <div className="flex gap-2">
                            <div className="w-8 h-px bg-gray-600"></div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: React Hook Form */}
                <div className="md:w-[60%] p-8 lg:p-14 bg-white">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-neutral uppercase tracking-tight">Create Account</h3>
                            <div className="h-1 w-10 bg-secondary mt-1 rounded-full"></div>
                        </div>
                        <a href="/login" className="text-xs font-bold text-gray-400 hover:text-primary transition-all flex items-center gap-1 group">
                            LOG IN <FaChevronRight className="group-hover:translate-x-1 transition-transform" size={10} />
                        </a>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Full Name</label>
                            <div className="relative">
                                <FaUser className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.name ? 'text-error' : 'text-gray-300'}`} />
                                <input
                                    {...register("name", { required: "Name is required" })}
                                    type="text"
                                    placeholder="e.g. Abir Hossain"
                                    className={`input input-bordered w-full pl-12 bg-base-100 rounded-2xl focus:outline-primary ${errors.name ? 'border-error' : 'border-gray-100'}`}
                                />
                            </div>
                            {errors.name && <span className="text-[10px] text-error font-bold ml-2">{errors.name.message}</span>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Email */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Email</label>
                                <div className="relative">
                                    <FaEnvelope className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-error' : 'text-gray-300'}`} />
                                    <input
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                                        })}
                                        type="email"
                                        placeholder="mail@onway.com"
                                        className={`input input-bordered w-full pl-12 bg-base-100 rounded-2xl focus:outline-primary ${errors.email ? 'border-error' : 'border-gray-100'}`}
                                    />
                                </div>
                                {errors.email && <span className="text-[10px] text-error font-bold ml-2">{errors.email.message}</span>}
                            </div>

                            {/* Phone */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Phone</label>
                                <div className="relative">
                                    <FaPhone className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.phone ? 'text-error' : 'text-gray-300'}`} />
                                    <input
                                        {...register("phone", { required: "Phone is required", minLength: { value: 11, message: "Min 11 digits" } })}
                                        type="tel"
                                        placeholder="01XXXXXXXXX"
                                        className={`input input-bordered w-full pl-12 bg-base-100 rounded-2xl focus:outline-primary ${errors.phone ? 'border-error' : 'border-gray-100'}`}
                                    />
                                </div>
                                {errors.phone && <span className="text-[10px] text-error font-bold ml-2">{errors.phone.message}</span>}
                            </div>
                        </div>

                        {/* Role Select */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Join OnWay as</label>
                            <select
                                {...register("role")}
                                className="select select-bordered w-full bg-base-100 rounded-2xl focus:outline-primary font-bold text-neutral border-gray-100"
                            >
                                <option value="rider">Rider (Looking for a ride)</option>
                                <option value="driver">Driver (Partner)</option>
                            </select>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Secure Password</label>
                            <div className="relative">
                                <FaLock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-error' : 'text-gray-300'}`} />
                                <input
                                    {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`input input-bordered w-full pl-12 pr-12 bg-base-100 rounded-2xl focus:outline-primary ${errors.password ? 'border-error' : 'border-gray-100'}`}
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </button>
                            </div>
                            {errors.password && <span className="text-[10px] text-error font-bold ml-2">{errors.password.message}</span>}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="btn btn-primary w-full border-none text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs h-14"
                            >
                                Register Now
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-[10px] text-gray-400 leading-relaxed px-6">
                        By signing up, you agree to our
                        <span className="text-secondary font-bold mx-1 cursor-pointer hover:underline">Terms</span>
                        &
                        <span className="text-secondary font-bold mx-1 cursor-pointer hover:underline">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;