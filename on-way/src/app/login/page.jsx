"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaChevronRight, FaArrowLeft } from 'react-icons/fa';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false); 
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm();

    const onSubmit = (data) => {
        if (isForgotPassword) {
            console.log("Sending Reset Link to:", data.email);
            // Ekhane password reset logic (Firebase/API) hobe
            setIsEmailSent(true);
        } else {
            console.log("OnWay Login Data:", data);
            // Ekhane login logic hobe
        }
    };

    // Mode switch korle form reset hobe
    const toggleMode = () => {
        setIsForgotPassword(!isForgotPassword);
        setIsEmailSent(false);
        reset();
    };

    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 font-sans selection:bg-primary selection:text-white">
            <div className="w-full max-w-5xl bg-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row-reverse border border-white/20">

                {/* RIGHT SIDE (Visual) */}
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
                            {isForgotPassword ? "Don't worry, we'll help you get back on track." : "Welcome back! Your next ride is just a few clicks away."}
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="h-1.5 w-12 bg-secondary mb-6 rounded-full shadow-[0_0_15px_rgba(29,104,209,0.8)]"></div>
                        <h2 className="text-4xl font-extrabold leading-tight">
                            {isForgotPassword ? "Reset your" : "Ready to"} <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
                                {isForgotPassword ? "Password" : "Move"}
                            </span> {isForgotPassword ? "" : "again?"}
                        </h2>
                    </div>

                    <div className="relative z-10 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        <span>Fast • Safe • OnWay</span>
                    </div>
                </div>

                {/* LEFT SIDE: Form logic switch */}
                <div className="md:w-[55%] p-8 lg:p-14 bg-white">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-neutral uppercase tracking-tight">
                                {isForgotPassword ? "Reset Password" : "Login"}
                            </h3>
                            <div className="h-1 w-10 bg-primary mt-1 rounded-full"></div>
                        </div>
                        {!isForgotPassword && (
                            <a href="/register" className="text-xs font-bold text-gray-400 hover:text-secondary transition-all flex items-center gap-1 group">
                                CREATE ACCOUNT <FaChevronRight className="group-hover:translate-x-1 transition-transform" size={10} />
                            </a>
                        )}
                        {isForgotPassword && (
                            <button onClick={toggleMode} className="text-xs font-bold text-gray-400 hover:text-secondary flex items-center gap-2 group">
                                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> BACK TO LOGIN
                            </button>
                        )}
                    </div>

                    {!isEmailSent ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Email Field */}
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

                            {/* Password Field - Hide when in Forgot Password mode */}
                            {!isForgotPassword && (
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Password</label>
                                        <button 
                                            type="button"
                                            onClick={() => setIsForgotPassword(true)}
                                            className="text-[10px] font-bold text-secondary hover:underline"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <FaLock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-error' : 'text-gray-300'}`} />
                                        <input
                                            {...register("password", { required: !isForgotPassword ? "Password is required" : false })}
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
                            )}

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="btn btn-secondary w-full border-none text-white font-black rounded-2xl shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs h-14"
                                >
                                    {isForgotPassword ? "Send Reset Link" : "Log In"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        // Success View after sending email
                        <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaEnvelope size={24} />
                            </div>
                            <h4 className="text-xl font-bold text-neutral">Check Your Email</h4>
                            <p className="text-sm text-gray-500 mt-2">A password reset link has been sent to your inbox.</p>
                            <button onClick={toggleMode} className="mt-8 btn btn-ghost btn-sm text-primary font-bold">
                                Back to Login
                            </button>
                        </div>
                    )}

                    {/* Social Login - Only show on Login mode */}
                    {!isForgotPassword && (
                        <>
                            <p className='font-bold text-lg text-center mt-5 text-gray-400'>OR</p>
                            <button className="btn bg-white hover:bg-gray-50 text-black border-gray-200 w-full rounded-2xl mt-4 h-14 shadow-sm transition-all">
                                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
                                Login with Google
                            </button>
                        </>
                    )}

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