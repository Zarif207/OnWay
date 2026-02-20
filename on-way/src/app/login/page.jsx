"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaChevronRight, FaGoogle, FaFacebook } from 'react-icons/fa';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    // React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log("OnWay Login Data:", data);
    };

    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 font-sans selection:bg-primary selection:text-white">
            {/* Main Container */}
            <div className="w-full max-w-5xl bg-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row-reverse border border-white/20">

                {/* RIGHT SIDE (Visual/Brand): Logic reverse kora hoyeche unique look er jonno */}
                <div className="md:w-[45%] bg-neutral p-10 flex flex-col justify-between text-white relative overflow-hidden group">
                    {/* Background Image with Overlay */}
                    <div
                        className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110 opacity-30"
                        style={{
                            backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    ></div>

                    <div className="absolute inset-0 bg-gradient-to-t from-neutral via-neutral/70 to-secondary/30 z-0"></div>

                    <div className="relative z-10">
                        <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-1">
                            OnWay<span className="text-primary">.</span>
                        </h1>
                        <p className="mt-4 text-gray-300 text-sm font-medium leading-relaxed max-w-[220px]">
                            Welcome back! Your next ride is just a few clicks away.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="h-1.5 w-12 bg-secondary mb-6 rounded-full shadow-[0_0_15px_rgba(29,104,209,0.8)]"></div>
                        <h2 className="text-4xl font-extrabold leading-tight">
                            Ready to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Move</span> again?
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

                        {/* Password Field */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Password</label>
                                <a href="#" className="text-[10px] font-bold text-secondary hover:underline">Forgot Password</a>
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

                        {/* Login Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="btn btn-secondary w-full border-none text-white font-black rounded-2xl shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs h-14"
                            >
                                Log In
                            </button>
                        </div>
                    </form>

                    {/* Social Login Section */}
                    <p className='font-bold text-2xl text-center mt-5'>OR</p>

                    {/* Google */}
                    <button className="btn bg-white text-black border-[#e5e5e5] w-full rounded-xl p-6">
                        <svg aria-label="Google logo" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                        Login with Google
                    </button>

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