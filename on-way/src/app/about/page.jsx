/* eslint-disable @next/next/no-img-element */
import React from "react";
import ScrollProgress from "../components/ScrollProgress";

const AboutUs = () => {
    const teamMembers = [
        {
            name: "Ahmed",
            role: "CEO / Visionary",
            img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
        },
        {
            name: "Syeda Doe",
            role: "Operations Ninja",
            img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop",
        },
        {
            name: "Tanvir Hasan",
            role: "Tech Sorcerer",
            img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop",
        },
        {
            name: "Rahat Ali",
            role: "Product Designer",
            img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1887&auto=format&fit=crop",
        },
        {
            name: "Nabila Islam",
            role: "Marketing Head",
            img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1887&auto=format&fit=crop",
        },
        {
            name: "Siam Karim",
            role: "Lead Developer",
            img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1887&auto=format&fit=crop",
        },
    ];

    return (
        <ScrollProgress>
            <div className="bg-white text-gray-900 font-sans selection:bg-green-500 selection:text-white">
                {/* 1. Hero Section  */}
                <section className="relative h-[80vh] flex items-center overflow-hidden">

                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://i.ibb.co.com/35PP69pk/young-women-taking-selfie-car.jpg"
                            alt="Hero Background"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Dark Overlay (Text readable) */}
                    <div className="absolute inset-0 bg-black/40 z-0"></div>

                    {/* Hero Content */}
                    <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                        <div className="max-w-2xl">
                            <span className="text-green-500 font-bold tracking-[0.3em] uppercase mb-4 block">
                                Our Vision
                            </span>

                            <h1 className="text-5xl md:text-7xl font-black mb-6 text-white italic uppercase leading-tight">
                                The{" "}
                                <span className="bg-green-500 px-2 text-black not-italic">
                                    Architects
                                </span>
                                <br />
                                Beyond Boundaries.
                            </h1>

                            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                                We aren't just building a ride-sharing infrastructure; we're
                                building the future of how Dhaka moves, lives, and grows.
                            </p>

                            <button className="bg-green-600 text-white px-8 py-3 font-bold uppercase hover:bg-white hover:text-black transition-all">
                                Learn More
                            </button>
                        </div>
                    </div>
                </section>

                {/* 2. Stats Section */}
                <section className="py-12 bg-gray-100 border-b">
                    <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { l: "Active Riders", v: "500K+" },
                            { l: "Trips", v: "10M+" },
                            { l: "Cities", v: "12" },
                            { l: "Rating", v: "4.9/5" },
                        ].map((s, i) => (
                            <div className="rounded-full border border-amber-300 p-10 shadow " key={i}>
                                <h3 className="text-3xl font-black text-black">{s.v}</h3>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    {s.l}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
                {/* 3. Team Section */}
                <section className="py-24 px-6 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                        {/* Left Intro */}
                        <div className="lg:col-span-1">
                            <h2 className="text-4xl font-black italic uppercase leading-none mb-6">
                                The <br /> Architects
                            </h2>
                            <p className="text-gray-500 mb-8">
                                We are a team of dreamers and doers dedicated to making Dhaka
                                better.
                            </p>
                            <button className="bg-green-500 text-white px-6 py-2 font-bold uppercase text-sm">
                                Join Us
                            </button>
                        </div>

                        {/* Right Grid */}
                        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teamMembers.map((member, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-4 shadow-xl shadow-gray-200/50 border border-gray-100 hover:-translate-y-2 transition-transform duration-300"
                                >
                                    <div className="aspect-4/5 overflow-hidden mb-6">
                                        <img
                                            src={member.img}
                                            alt={member.name}
                                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                        />
                                    </div>

                                    <h3 className="text-xl font-black uppercase tracking-tighter">
                                        {member.name}
                                    </h3>

                                    <div className="flex items-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="text-green-500 text-xs">
                                                ★
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-gray-500 text-sm leading-snug">
                                        Expert in {member.role.toLowerCase()} with a passion for urban
                                        mobility.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* 4. Our Core Values Section */}
                <section className="py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                            <div className="max-w-xl">
                                <span className="text-green-600 font-bold tracking-widest uppercase text-sm">What Drives Us</span>
                                <h2 className="text-5xl font-black italic uppercase mt-2">Our Core <span className="text-green-500">Values</span></h2>
                            </div>
                            <p className="text-gray-500 max-w-sm">
                                We operate on the principles of transparency, speed, and community impact.
                                It's not just business; it's a commitment.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200">
                            {[
                                { title: "Innovation", desc: "Pushing the limits of what technology can do for daily life.", icon: "🚀" },
                                { title: "Integrity", desc: "Honesty and safety are at the heart of every single ride.", icon: "🛡️" },
                                { title: "Community", desc: "Empowering local drivers and making the city accessible to all.", icon: "🤝" }
                            ].map((value, idx) => (
                                <div key={idx} className="p-12 border-b md:border-b-0 md:border-r last:border-r-0 hover:bg-white transition-colors group">
                                    <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{value.icon}</div>
                                    <h4 className="text-2xl font-black uppercase mb-4">{value.title}</h4>
                                    <p className="text-gray-500 leading-relaxed">{value.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* 6. Timeline / Milestone Section */}
                <section className="py-24 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                            Our <span className="bg-black text-white px-4">Evolution</span>
                        </h2>
                    </div>

                    <div className="relative">
                        {/* Vertical Line for Desktop */}
                        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-200"></div>

                        <div className="space-y-16">
                            {[
                                { year: "2021", title: "The Spark", desc: "Started with just 10 bikes and a dream to fix Dhaka's traffic." },
                                { year: "2022", title: "Expansion", desc: "Reached 100k active riders and expanded to Chittagong." },
                                { year: "2024", title: "Tech Revolution", desc: "Launched our AI-driven route optimization system." }
                            ].map((milestone, idx) => (
                                <div key={idx} className={`flex flex-col md:flex-row items-center w-full ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                    <div className="w-full md:w-1/2 flex justify-center md:justify-start px-12">
                                        <div className={`${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'} text-center w-full`}>
                                            <h3 className="text-4xl font-black text-green-500 mb-2">{milestone.year}</h3>
                                            <h4 className="text-xl font-bold uppercase mb-2 text-black">{milestone.title}</h4>
                                            <p className="text-gray-500">{milestone.desc}</p>
                                        </div>
                                    </div>
                                    {/* Circle on line */}
                                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-black border-4 border-green-500 rounded-full hidden md:block"></div>
                                    <div className="w-full md:w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. Safety Banner */}
                <section className="bg-black py-20 px-6 m-24 w-full mx-auto">
                    <div className="max-w-7xl mx-auto text-center">
                        <h2 className="text-white text-4xl md:text-5xl font-black italic mb-8 uppercase tracking-tighter">
                            Safe. Secure.{" "}
                            <span className="text-green-500">Unstoppable.</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="text-white">
                                <h4 className="text-green-500 font-bold mb-2">GPS TRACKED</h4>
                                <p className="text-gray-400 text-sm">
                                    Every meter of your journey is recorded.
                                </p>
                            </div>

                            <div className="text-white">
                                <h4 className="text-green-500 font-bold mb-2">VERIFIED</h4>
                                <p className="text-gray-400 text-sm">
                                    Drivers are vetted with strict protocols.
                                </p>
                            </div>

                            <div className="text-white">
                                <h4 className="text-green-500 font-bold mb-2">24/7 HELPLINE</h4>
                                <p className="text-gray-400 text-sm">
                                    We are just one tap away, anytime.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </ScrollProgress>
    );
};

export default AboutUs;
