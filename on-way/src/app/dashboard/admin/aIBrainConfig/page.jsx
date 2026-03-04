
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import {
    Save, Loader2, Sparkles, ShieldCheck,
    Info, Database, Zap, LayoutDashboard
} from 'lucide-react';

const AIBrainConfig = () => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/support/admin/config`);
                setContent(res.data.content || '');
            } catch (err) {
                toast.error("Failed to fetch configuration");
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleUpdate = async () => {
        if (!content.trim()) return toast.error("Knowledge base cannot be empty");

        const loadingToast = toast.loading("Synchronizing AI Brain...");
        setIsSaving(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/support/admin/update`, { content });
            toast.success("AI Brain Updated Successfully!", { id: loadingToast });
        } catch (err) {
            toast.error("Deployment failed. Please try again.", { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen  font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">
                {/* Modern Navigation Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">AI Knowledge Center</h1>
                        <p className="text-slate-500 font-medium">Fine-tune your AI support agent's behavior and data source.</p>
                    </div>

                    <button
                        onClick={handleUpdate}
                        disabled={isSaving || isLoading}
                        className="group relative inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:shadow-2xl hover:shadow-slate-200 active:scale-95 overflow-hidden"
                    >
                        {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                        <span className="relative">Deploy Changes</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Editor Column */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-100 overflow-hidden ring-1 ring-slate-100">
                            <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 rounded-xl">
                                        <Sparkles className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <span className="font-bold text-slate-800 tracking-tight">System Prompt Configuration</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                                </div>
                            </div>

                            <div className="relative bg-slate-50/30">
                                {isLoading ? (
                                    <div className="h-150 flex flex-col items-center justify-center">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                            <Database className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        </div>
                                        <p className="mt-4 text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">Syncing Database...</p>
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full h-100 p-8 md:p-10 bg-transparent text-slate-700 focus:outline-none font-mono text-sm leading-[1.8] resize-none custom-scrollbar transition-opacity duration-500"
                                        spellCheck="false"
                                        placeholder="# Identify yourself as OnWay Support... &#10;# Office: Bonani, Dhaka... &#10;# Cancellation: 20% charge..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Info/Sidebar Column */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Status Card */}
                        <div className="bg-secondary rounded-4xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-2">Live Status</h3>
                                <div className="flex items-center gap-2 bg-indigo-500/30 w-fit px-3 py-1 rounded-full border border-indigo-400/30">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                                    <span className="text-xs font-bold uppercase tracking-tighter text-indigo-100">AI Model Online</span>
                                </div>
                                <p className="mt-4 text-indigo-100/80 text-sm leading-relaxed font-medium">
                                    Every change you deploy here affects the real-time responses of the OnWay chatbot instantly.
                                </p>
                            </div>
                            <LayoutDashboard className="absolute -right-6 -bottom-6 w-32 h-32 text-indigo-500/20 group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        {/* Guidelines Card */}
                        <div className="bg-white rounded-4xl p-8 border border-slate-200/60 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-50 rounded-xl">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="font-extrabold text-slate-800 tracking-tight">Best Practices</h3>
                            </div>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 w-6 h-6 flex items-center justify-center rounded-lg shrink-0">01</span>
                                    <p className="text-sm text-slate-600 font-medium">Use <code className="bg-slate-100 px-1 rounded text-indigo-600 font-bold"># Headers</code> to categorize information.</p>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 w-6 h-6 flex items-center justify-center rounded-lg shrink-0">02</span>
                                    <p className="text-sm text-slate-600 font-medium">Be explicit about <strong>what NOT to do</strong> (e.g., "Don't share private keys").</p>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 w-6 h-6 flex items-center justify-center rounded-lg shrink-0">03</span>
                                    <p className="text-sm text-slate-600 font-medium">Add a "Tone of Voice" section (e.g., "Always be polite and brief").</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: #e2e8f0; 
                    border-radius: 20px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; background-clip: content-box; }
            `}</style>
        </div>
    );
};

export default AIBrainConfig;