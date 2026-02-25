import { AlertTriangle, Car, Info, ShieldAlert } from 'lucide-react';
import React from 'react';

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
        <main className="min-h-screen bg-base-100 pb-10">
            {/* Header: Using Theme Primary Color */}
            <div className="bg-primary text-white px-6 py-12 rounded-b-[40px] shadow-lg mb-8 border-b-4 border-secondary">
                <div className="max-w-4xl mx-auto text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                        <ShieldAlert size={32} className="text-secondary" />
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight italic uppercase">
                            OnWay <span className="text-secondary">Safety</span>
                        </h1>
                    </div>
                    <p className="text-gray-300 font-medium max-w-lg">
                        Follow road laws, reach your destination safely. Legal action is ensured for violating traffic rules.                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4">
                {/* Info Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex items-center gap-3">
                    <div className="bg-accent/10 p-2 rounded-full">
                        <Info className="text-accent" size={20} />
                    </div>
                    <span className="text-primary font-semibold text-sm">
                        List of fines according to the Road Transport Act, 2018.
                    </span>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {trafficRules.map((item, index) => (
                        <div
                            key={index}
                            className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-primary font-bold text-lg leading-tight group-hover:text-accent transition-colors">
                                    {item.offense}
                                </h3>
                                <AlertTriangle size={20} className="text-secondary shrink-0 ml-2 fill-secondary/20" />
                            </div>

                            <div className="relative overflow-hidden bg-primary rounded-2xl p-4">
                                {/* Small decorative accent line */}
                                <div className="absolute top-0 left-0 w-2 h-full bg-accent"></div>

                                <p className="text-secondary font-bold text-[10px] uppercase tracking-widest mb-1 opacity-80">
                                    Penalty Detail
                                </p>
                                <p className="text-white text-sm font-medium leading-relaxed">
                                    {item.penalty}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Section: Using Theme Accent and Primary */}
                <div className="mt-16 bg-primary text-white p-8 rounded-[40px] text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full -ml-12 -mb-12"></div>

                    <Car className="mx-auto mb-4 text-secondary animate-pulse" size={40} />
                    <h2 className="text-2xl font-bold mb-2">Have a safe journey with OnWay.</h2>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                        We are committed to ensuring your safety. Please follow traffic signals and carry valid documents with you.                    </p>
                </div>
            </div>
        </main>
    );
};

export default Ridesharing;