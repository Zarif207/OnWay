"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaGithub, FaChevronLeft } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import Link from 'next/link';

const AuthPage = () => {
    const [isActive, setIsActive] = useState(false);
    const { status } = useSession();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { register: loginReg, handleSubmit: handleLogin, watch: loginWatch } = useForm();
    const { register: regReg, handleSubmit: handleRegister } = useForm();

    const currentEmail = loginWatch("email");

    useEffect(() => {
        if (status === "authenticated") router.push("/");
    }, [status, router]);

    const onLoginSubmit = async (data) => {
        setLoading(true);
        const toastId = toast.loading("Verifying...");
        try {
            const result = await signIn("credentials", { ...data, redirect: false });
            if (result?.error) toast.error("Invalid credentials", { id: toastId });
            else { toast.success("Welcome back!", { id: toastId }); router.push("/"); }
        } catch (error) { toast.error("Login failed", { id: toastId }); }
        finally { setLoading(false); }
    };

    if (status === "loading") return <div className="min-h-screen flex items-center justify-center bg-black"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
            
            {/* --- FULL PAGE BACKGROUND VIDEO --- */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src="https://res.cloudinary.com/dztsihg3x/video/upload/v1775048957/Car_driving_on_road_crhdv4.webm" type="video/webm" />
                </video>
                {/* Dark Overlay for Professional Look */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
            </div>

            {/* --- MAIN CONTAINER --- */}
            <div className="relative z-10 w-full max-w-[1000px] h-[600px] px-4">
                <div className="relative w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] shadow-2xl overflow-hidden flex">
                    
                    {/* --- LEFT SIDE: FORMS --- */}
                    <div className="relative w-1/2 h-full overflow-hidden">
                        
                        {/* Login Form */}
                        <div className={`absolute inset-0 flex flex-col justify-center px-12 transition-all duration-700 ease-in-out ${isActive ? 'opacity-0 -translate-x-full pointer-events-none' : 'opacity-100 translate-x-0'}`}>
                            <Link href="/" className="text-[10px] font-black text-gray-300 hover:text-white flex items-center gap-1 mb-6 transition-all">
                                <FaChevronLeft /> BACK TO HOME
                            </Link>
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-1">Sign In</h1>
                            <div className="h-1 w-10 bg-primary mb-8 rounded-full"></div>
                            
                            <form onSubmit={handleLogin(onLoginSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-300 ml-1">Email</label>
                                    <input {...loginReg("email", { required: true })} type="email" className="w-full h-12 px-5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-all" placeholder="name@example.com" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-bold uppercase text-gray-300">Password</label>
                                        <Link href={`/forgot-password?email=${currentEmail || ""}`} className="text-[10px] font-bold text-primary hover:underline uppercase">Forgot?</Link>
                                    </div>
                                    <div className="relative">
                                        <input {...loginReg("password", { required: true })} type={showPassword ? "text" : "password"} className="w-full h-12 px-5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-all" placeholder="••••••••" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <button disabled={loading} className="btn btn-primary w-full rounded-2xl text-white font-black uppercase border-none shadow-lg shadow-primary/20">Login</button>
                            </form>

                            <div className="relative my-8 text-center">
                                <div className="absolute top-1/2 w-full h-[1px] bg-white/10"></div>
                                <span className="relative z-10 bg-transparent px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Social Login</span>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => signIn("google")} className="flex-1 h-12 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-white font-bold text-xs"><FcGoogle size={18}/> Google</button>
                                <button onClick={() => signIn("github")} className="flex-1 h-12 flex items-center justify-center gap-2 bg-black/40 hover:bg-black/60 border border-white/10 rounded-2xl transition-all text-white font-bold text-xs"><FaGithub size={18}/> GitHub</button>
                            </div>
                        </div>

                        {/* Register Form */}
                        <div className={`absolute inset-0 flex flex-col justify-center px-12 transition-all duration-700 ease-in-out ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-1">Register</h1>
                            <div className="h-1 w-10 bg-primary mb-8 rounded-full"></div>
                            <form className="space-y-3">
                                <input {...regReg("name")} className="w-full h-12 px-5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none" placeholder="Full Name" />
                                <input {...regReg("email")} className="w-full h-12 px-5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none" placeholder="Email" />
                                <input {...regReg("password")} type="password" className="w-full h-12 px-5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none" placeholder="Password" />
                                <button className="btn btn-primary w-full rounded-2xl text-white font-black uppercase mt-4 border-none">Create Account</button>
                            </form>
                        </div>
                    </div>

                    {/* --- RIGHT SIDE: OVERLAY INFO --- */}
                    <div className="relative w-1/2 h-full bg-primary/20 flex flex-col items-center justify-center text-center p-12 border-l border-white/10">
                        <div className="relative z-20">
                            <h1 className="text-6xl font-black italic text-white tracking-tighter mb-4">OnWay.</h1>
                            {isActive ? (
                                <>
                                    <p className="text-gray-200 text-sm mb-8">Already have an account? Log in to keep track of your rides.</p>
                                    <button onClick={() => setIsActive(false)} className="btn btn-outline border-white text-white rounded-2xl px-12 hover:bg-white hover:text-black transition-all">Sign In</button>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-200 text-sm mb-8">New here? Join our community and start your journey with ease.</p>
                                    <button onClick={() => setIsActive(true)} className="btn btn-outline border-white text-white rounded-2xl px-12 hover:bg-white hover:text-black transition-all">Sign Up</button>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AuthPage;


// "use client";
// import React, { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaGithub, FaUser, FaChevronLeft } from 'react-icons/fa';
// import { FcGoogle } from "react-icons/fc";
// import { signIn, useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import toast from 'react-hot-toast';
// import Link from 'next/link';
// import { useUsers } from '@/hooks/useUsers';

// const AuthPage = () => {
//     const [isActive, setIsActive] = useState(false);
//     const { status } = useSession();
//     const { findUser } = useUsers();
//     const [showPassword, setShowPassword] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const router = useRouter();

//     const { register: loginReg, handleSubmit: handleLogin, watch: loginWatch, formState: { errors: loginErrors } } = useForm();
//     const { register: regReg, handleSubmit: handleRegister } = useForm();

//     const currentEmail = loginWatch("email");

//     useEffect(() => {
//         if (status === "authenticated") router.push("/");
//     }, [status, router]);

//     const onLoginSubmit = async (data) => {
//         setLoading(true);
//         const toastId = toast.loading("Verifying credentials...");
//         try {
//             const result = await signIn("credentials", { ...data, redirect: false });
//             if (result?.error) toast.error("Invalid email or password", { id: toastId });
//             else { toast.success("Welcome back!", { id: toastId }); router.push("/"); router.refresh(); }
//         } catch (error) { toast.error("An unexpected error occurred", { id: toastId }); }
//         finally { setLoading(false); }
//     };

//     const onRegisterSubmit = async (data) => {
//         setLoading(true);
//         const toastId = toast.loading("Checking details...");
//         try {
//             const userExists = await findUser(data.email);
//             if (userExists) { setLoading(false); return toast.error("Email already registered!", { id: toastId }); }
//             const res = await fetch("/api/send-otp", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ email: data.email }),
//             });
//             if (res.ok) {
//                 const result = await res.json();
//                 localStorage.setItem("tempUser", JSON.stringify({ ...data, otp: result.otp }));
//                 toast.success("OTP Sent to Email!", { id: toastId });
//                 router.push("/verify-email");
//             }
//         } catch (err) { toast.error("Error sending OTP", { id: toastId }); }
//         finally { setLoading(false); }
//     };

//     if (status === "loading") return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
//             <div className={`relative overflow-hidden w-250 max-w-full min-h-162.5 bg-white rounded-[40px] shadow flex transition-all duration-700`}>

//                 {/* --- REGISTER FORM --- */}
//                 <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 z-1 opacity-0 ${isActive ? 'translate-x-full opacity-100 z-5' : ''}`}>
//                     <form onSubmit={handleRegister(onRegisterSubmit)} className="flex flex-col items-center justify-center h-full px-10 bg-white text-center">
//                         <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter text-neutral">Register</h1>
//                         <div className="h-1.5 w-12 bg-primary mb-6 rounded-full"></div>
//                         <div className="w-full space-y-3">
//                             <input {...regReg("name", { required: true })} className="input input-bordered w-full h-12 rounded-2xl bg-gray-50 border-none" placeholder="Full Name" />
//                             <div className="grid grid-cols-2 gap-2">
//                                 <input {...regReg("email", { required: true })} type="email" className="input input-bordered w-full h-12 rounded-2xl bg-gray-50 border-none" placeholder="Email" />
//                                 <input {...regReg("phone", { required: true })} className="input input-bordered w-full h-12 rounded-2xl bg-gray-50 border-none" placeholder="Phone" />
//                             </div>
//                             <input {...regReg("password", { required: true })} type="password" className="input input-bordered w-full h-12 rounded-2xl bg-gray-50 border-none" placeholder="Password" />
//                             <button disabled={loading} className="btn btn-primary w-full rounded-2xl text-white font-black uppercase mt-4">Sign Up</button>
//                         </div>
//                     </form>
//                 </div>

//                 {/* --- LOGIN FORM --- */}
//                 <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 z-2 ${isActive ? 'translate-x-full opacity-0' : ''}`}>
//                     <form onSubmit={handleLogin(onLoginSubmit)} className="flex flex-col items-center justify-center h-full px-12 bg-white text-center">
//                         <div className="w-full text-left mb-4">
//                             <Link href="/" className="text-[10px] font-black text-gray-400 hover:text-primary flex items-center gap-1 transition-all">
//                                 <FaChevronLeft /> BACK TO HOME
//                             </Link>
//                         </div>
//                         <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter text-neutral">Sign In</h1>
//                         <div className="h-1.5 w-12 bg-primary mb-8 rounded-full"></div>

//                         <div className="w-full space-y-4">
//                             <div className="space-y-1 text-left">
//                                 <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Email Address</label>
//                                 <input {...loginReg("email", { required: true })} type="email" className="input input-bordered w-full h-14 rounded-2xl bg-gray-50 border-none" placeholder="Enter Email" />
//                             </div>

//                             <div className="space-y-1 text-left">
//                                 <div className="flex justify-between items-center px-1">
//                                     <label className="text-[10px] font-black uppercase text-gray-400">Password</label>
//                                     {/* --- FORGOT LINK ADDED HERE --- */}
//                                     <Link href={`/forgot-password?email=${currentEmail || ""}`} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter">
//                                         Forgot?
//                                     </Link>
//                                 </div>
//                                 <div className="relative">
//                                     <input {...loginReg("password", { required: true })} type={showPassword ? "text" : "password"} className="input input-bordered w-full h-14 rounded-2xl bg-gray-50 border-none" placeholder="••••••••" />
//                                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
//                                         {showPassword ? <FaEyeSlash /> : <FaEye />}
//                                     </button>
//                                 </div>
//                             </div>

//                             <button disabled={loading} className="btn btn-primary w-full rounded-2xl text-white font-black uppercase h-14 border-none shadow-lg shadow-primary/30 mt-2">Login</button>
//                         </div>

//                         <div className="relative my-6 w-full text-center">
//                             <span className="bg-white px-4 text-gray-400 text-[10px] font-black relative z-10 uppercase tracking-widest">Or login with</span>
//                             <div className="absolute top-1/2 w-full h-px bg-gray-100 left-0"></div>
//                         </div>

//                         <div className="flex gap-4 w-full">
//                             <button type="button" onClick={() => signIn("google")} className="btn flex-1 bg-white border-gray-100 rounded-2xl h-12 text-[11px] font-bold shadow-sm"><FcGoogle size={18} className="mr-2" /> Google</button>
//                             <button type="button" onClick={() => signIn("github")} className="btn flex-1 bg-black text-white border-none rounded-2xl h-12 text-[11px] font-bold shadow-sm"><FaGithub size={18} className="mr-2" /> GitHub</button>
//                         </div>
//                     </form>
//                 </div>

//                 {/* --- OVERLAY PANEL --- */}
//                 <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 z-100 ${isActive ? '-translate-x-full rounded-r-[80px]' : 'rounded-l-[80px]'}`}>
//                     <div className={`relative -left-full h-full w-[200%] bg-primary text-white transition-transform duration-700 ${isActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
//                         <div className="absolute inset-0 z-0 overflow-hidden">
//                             <video
//                                 autoPlay
//                                 loop
//                                 muted
//                                 playsInline
//                                 className="absolute min-w-full min-h-full object-cover opacity-40"
//                             >
//                                 <source
//                                     src="https://res.cloudinary.com/dztsihg3x/video/upload/v1775048957/Car_driving_on_road_crhdv4.webm"
//                                     type="video/webm"
//                                 />
//                                 Your browser does not support the video tag.
//                             </video>
//                         </div>
//                         {/* <div className="absolute inset-0 bg-primary/60"></div> */}
//                         <div className="relative z-10 h-full w-full flex">
//                             <div className={`w-1/2 flex flex-col items-center justify-center px-12 text-center transition-transform duration-700 ${isActive ? 'translate-x-0' : '-translate-x-[20%]'}`}>
//                                 <h1 className="text-5xl font-black italic tracking-tighter">OnWay.</h1>
//                                 <p className="my-8 text-sm font-medium opacity-90">Welcome back! Please login with your personal info to continue.</p>
//                                 <button onClick={() => setIsActive(false)} className="btn btn-outline border-white text-white rounded-2xl px-12 border-2 hover:bg-white hover:text-primary">Sign In</button>
//                             </div>
//                             <div className={`w-1/2 flex flex-col items-center justify-center px-12 text-center transition-transform duration-700 ${isActive ? 'translate-x-[20%]' : 'translate-x-0'}`}>
//                                 <h1 className="text-5xl font-black italic tracking-tighter">OnWay.</h1>
//                                 <p className="my-8 text-sm font-medium opacity-90">Register today and start using the best commuting platform.</p>
//                                 <button onClick={() => setIsActive(true)} className="btn btn-outline border-white text-white rounded-2xl px-12 border-2 hover:bg-white hover:text-primary">Sign Up</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default AuthPage;

