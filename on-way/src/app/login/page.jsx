"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaChevronRight, FaGithub } from 'react-icons/fa';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import Link from 'next/link';

const Login = () => {
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
        const toastId = toast.loading("Logging in...");

        try {
            const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
            const userFound = allUsers.find(
                (u) => u.email === data.email && u.password === data.password
            );

            if (userFound) {
                const result = await signIn("credentials", {
                    email: data.email,
                    password: data.password,
                    name: userFound.name,
                    redirect: false,
                });

                if (result?.error) {
                    toast.error("Login failed!", { id: toastId });
                } else {
                    toast.success(`Welcome, ${userFound.name}!`, { id: toastId });
                    router.push("/");
                    router.refresh();
                }
            } else {
                toast.error("User not found or wrong password!", { id: toastId });
            }
        } catch (error) {
            toast.error("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };
    const handleSocialLogin = async (provider) => {
        try {
            await signIn(provider, { callbackUrl: "/" });
            toast.success(`Connecting to ${provider}...`);
        } catch (error) {
            toast.error("Social login failed!");
        }
    };

    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 font-sans selection:bg-primary selection:text-white">
            <div className="w-full max-w-5xl bg-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row-reverse border border-white/20">

                {/* RIGHT SIDE (Visual/Brand) */}
                <div className="md:w-[45%] bg-neutral p-10 flex flex-col justify-between text-white relative overflow-hidden group">
                    <div
                        className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110 opacity-30"
                        style={{
                            backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    ></div>
                    <div className="absolute inset-0 bg-linear-to-t from-neutral via-neutral/70 to-secondary/30 z-0"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-1">
                            OnWay<span className="text-primary">.</span>
                        </h1>
                        <p className="mt-4 text-gray-300 text-sm font-medium leading-relaxed max-w-55">
                            Welcome back! Your next ride is just a few clicks away.
                        </p>
                    </div>
                    <div className="relative z-10">
                        <div className="h-1.5 w-12 bg-secondary mb-6 rounded-full shadow-[0_0_15px_rgba(29,104,209,0.8)]"></div>
                        <h2 className="text-4xl font-extrabold leading-tight">
                            Ready to <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">Move</span> again?
                        </h2>
                    </div>
                    <div className="relative z-10 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        <span>Fast • Safe • OnWay</span>
                    </div>
                </div>

                {/* LEFT SIDE: Login Form */}
                <div className="md:w-[55%] p-8 lg:p-14 bg-white">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-neutral uppercase tracking-tight">Login</h3>
                            <div className="h-1 w-10 bg-primary mt-1 rounded-full"></div>
                        </div>
                        <a href="/register" className="text-xs font-bold text-gray-400 hover:text-secondary transition-all flex items-center gap-1 group">
                            CREATE ACCOUNT <FaChevronRight className="group-hover:translate-x-1 transition-transform" size={10} />
                        </a>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Email Address</label>
                            <div className="relative">
                                <FaEnvelope className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-error' : 'text-gray-300'}`} />
                                <input
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                                    })}
                                    type="email"
                                    placeholder="name@company.com"
                                    className={`input input-bordered w-full pl-12 bg-base-100 rounded-2xl focus:outline-secondary ${errors.email ? 'border-error' : 'border-gray-100'}`}
                                />
                            </div>
                            {errors.email && <span className="text-[10px] text-error font-bold ml-2">{errors.email.message}</span>}
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Password</label>
                                <a href="#" className="text-[10px] font-bold text-secondary hover:underline">Forgot Password</a>
                                <Link href="/forgot-password" className="text-[10px] font-bold text-secondary hover:underline">Forgot Password</Link>
                            </div>
                            <div className="relative">
                                <FaLock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-error' : 'text-gray-300'}`} />
                                <input
                                    {...register("password", { required: "Password is required" })}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`input input-bordered w-full pl-12 pr-12 bg-base-100 rounded-2xl focus:outline-secondary ${errors.password ? 'border-error' : 'border-gray-100'}`}
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </button>
                            </div>
                            {errors.password && <span className="text-[10px] text-error font-bold ml-2">{errors.password.message}</span>}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-secondary w-full border-none text-white font-black rounded-2xl shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs h-14"
                            >
                                {loading ? <span className="loading loading-spinner"></span> : "Log In"}
                            </button>
                        </div>
                    </form>

                    <div className="relative my-8 text-center">
                        <span className="bg-white px-4 text-gray-400 text-xs font-bold relative z-10">OR CONTINUE WITH</span>
                        <div className="absolute top-1/2 w-full h-px bg-gray-100 left-0"></div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => handleSocialLogin("google")}
                            type="button"
                            className="btn flex-1 bg-white hover:bg-gray-50 text-neutral border-gray-200 rounded-2xl p-4 flex items-center justify-center gap-3 transition-all border shadow-sm"
                        >
                            <svg width="18" height="18" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                            </svg>
                            <span className="font-bold text-[11px] uppercase tracking-wider">Google</span>
                        </button>

                        <button
                            onClick={() => handleSocialLogin("github")}
                            type="button"
                            className="btn flex-1 bg-[#24292e] hover:bg-[#1a1e22] text-white border-none rounded-2xl p-4 flex items-center justify-center gap-3 transition-all shadow-sm"
                        >
                            <FaGithub size={18} />
                            <span className="font-bold text-[11px] uppercase tracking-wider">GitHub</span>
                        </button>
                    </div>

                    <p className="mt-8 text-center text-[10px] text-gray-400 px-6 uppercase tracking-tight">
                        Protected by reCAPTCHA and subject to OnWay
                        <span className="text-neutral font-bold mx-1 cursor-pointer hover:underline">Privacy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

