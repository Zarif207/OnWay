import { AlertTriangle, Car, Info, ShieldAlert } from 'lucide-react';
import React from 'react';

// Define the data outside the component to prevent re-renders
const trafficRules = [
    { offense: "Driving without a license", penalty: "6 months imprisonment and 25,000 TK fine" },
    { offense: "Unregistered vehicle", penalty: "6 months imprisonment or 50,000 TK fine or both" },
    { offense: "Vehicle without fitness certificate", penalty: "6 months imprisonment or 25,000 TK fine or both" },
    { offense: "Vehicle body modification", penalty: "3 years imprisonment or 300,000 TK fine or both" },
    { offense: "Vehicle without route permit", penalty: "6 months imprisonment or 25,000 TK fine or both" },
    { offense: "Over speeding", penalty: "3 months imprisonment or 10,000 TK fine or both" },
    { offense: "Using prohibited horns", penalty: "3 months imprisonment or 15,000 TK fine or both" },
    { offense: "Driving on the wrong side", penalty: "3 months imprisonment or 10,000 TK fine or both" },
    { offense: "Disobeying traffic signals", penalty: "3 months imprisonment or 10,000 TK fine or both" },
    { offense: "Showing fake license", penalty: "1-5 Lakh TK fine or 6 months to 2 years imprisonment" },
    { offense: "Illegal parking", penalty: "Maximum 5,000 TK fine" },
    { offense: "Not wearing a helmet", penalty: "Maximum 10,000 TK fine" },
    { offense: "Not wearing a seatbelt", penalty: "Maximum 5,000 TK fine" },
    { offense: "Driver talking on the phone", penalty: "Maximum 5,000 TK fine" },
];

const Ridesharing = () => {
    return (
       <main className="min-h-screen bg-[#F7F9FC] pb-10">
            {/* Navbar / Header Like Pathao */}
            <div className="bg-black text-white px-6 py-10 rounded-b-[40px] shadow-lg mb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert size={28} />
                        <h1 className="text-3xl font-extrabold tracking-tight">Traffic Safety</h1>
                    </div>
                    <p className="text-white/80 font-medium">Be aware of the penalties, ride safe.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4">
                {/* Search Bar Placeholder (Optional) */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
                    <Info className="text-[#00B14F]" size={20} />
                    <span className="text-gray-500 text-sm italic">According to Road Transport Act 2018</span>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trafficRules.map((item, index) => (
                        <div 
                            key={index} 
                            className="bg-white p-5 rounded-2xl border-l-4 border-[#00B14F] shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-slate-800 font-bold text-lg leading-tight">
                                    {item.offense}
                                </h3>
                                <AlertTriangle size={18} className="text-orange-400 shrink-0 ml-2" />
                            </div>
                            
                            <div className="mt-3 bg-gray-50 p-3 rounded-xl">
                                <p className="text-[#00B14F] font-bold text-sm uppercase tracking-wide mb-1">
                                    Penalty:
                                </p>
                                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                    {item.penalty}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Section */}
                <div className="mt-10 bg-slate-800 text-white p-6 rounded-3xl text-center">
                    <Car className="mx-auto mb-3 opacity-50" size={32} />
                    <h2 className="text-lg font-bold mb-1">Stay Safe on the Road</h2>
                    <p className="text-slate-400 text-xs">OnWay encourages all riders and drivers to follow traffic regulations strictly.</p>
                </div>
            </div>
        </main>
    );
};

export default Ridesharing;