import { Check } from 'lucide-react';
import React from 'react';

const Pricing = () => {
    return (
        /* Section wrapper add kora hoyeche py-20 diye jate upore-niche gap thake */
        <section className="py-20 bg-accent/10"> 
            <div className="container mx-auto px-4">
                {/* Heading add korle r-o sundor dekhabe */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-primary">Our Pricing Plans</h2>
                    <p className="text-gray-500 mt-2">Choose the best ride option for you</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-center">
                    
                    {/* Bike Ride - Basic */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:border-secondary transition-all duration-300">
                        <h3 className="text-xl font-bold text-primary">Bike Ride</h3>
                        <p className="text-4xl font-black mt-4 text-primary">
                            ৳60 <span className="text-base font-normal text-gray-500">/base fare</span>
                        </p>

                        <ul className="mt-8 space-y-4 text-gray-600">
                            <li className="flex items-center gap-3">
                                <div className="bg-secondary p-1 rounded-full">
                                    <Check size={14} className="text-primary font-bold" />
                                </div>
                                Affordable price
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="bg-secondary p-1 rounded-full">
                                    <Check size={14} className="text-primary font-bold" />
                                </div>
                                Fast pickup
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="bg-secondary p-1 rounded-full">
                                    <Check size={14} className="text-primary font-bold" />
                                </div>
                                Best for short distance
                            </li>
                        </ul>

                        <button className="w-full mt-8 bg-primary text-white py-3 rounded-xl font-bold hover:bg-secondary hover:text-primary transition-colors duration-300">
                            Book Now
                        </button>
                    </div>

                    {/* Standard Car - Featured/Popular */}
                    <div className="bg-primary text-white rounded-2xl shadow-2xl p-10 md:scale-105 border-2 border-secondary relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-secondary text-primary text-xs font-bold px-4 py-1 rounded-bl-lg uppercase">
                            Popular
                        </div>

                        <h3 className="text-2xl font-bold text-secondary">Standard Car</h3>
                        <p className="text-4xl font-black mt-4 text-white">
                            ৳120 <span className="text-base font-normal text-gray-300">/base fare</span>
                        </p>

                        <ul className="mt-8 space-y-4">
                            <li className="flex items-center gap-3 text-gray-100">
                                <Check size={20} className="text-secondary" />
                                Comfortable ride
                            </li>
                            <li className="flex items-center gap-3 text-gray-100">
                                <Check size={20} className="text-secondary" />
                                AC vehicle
                            </li>
                            <li className="flex items-center gap-3 text-gray-100">
                                <Check size={20} className="text-secondary" />
                                Most popular choice
                            </li>
                            <li className="flex items-center gap-3 text-gray-100">
                                <Check size={20} className="text-secondary" />
                                24/7 Availability
                            </li>
                        </ul>

                        <button className="w-full mt-10 bg-secondary text-primary py-4 rounded-xl font-black text-lg hover:brightness-110 transition-all">
                            Book Now
                        </button>
                    </div>

                    {/* Premium Car - Premium */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:border-secondary transition-all duration-300">
                        <h3 className="text-xl font-bold text-primary">Premium Car</h3>
                        <p className="text-4xl font-black mt-4 text-primary">
                            ৳250 <span className="text-base font-normal text-gray-500">/base fare</span>
                        </p>

                        <ul className="mt-8 space-y-4 text-gray-600">
                            <li className="flex items-center gap-3">
                                <div className="bg-secondary p-1 rounded-full">
                                    <Check size={14} className="text-primary font-bold" />
                                </div>
                                Luxury experience
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="bg-secondary p-1 rounded-full">
                                    <Check size={14} className="text-primary font-bold" />
                                </div>
                                Top rated drivers
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="bg-secondary p-1 rounded-full">
                                    <Check size={14} className="text-primary font-bold" />
                                </div>
                                Priority support
                            </li>
                        </ul>

                        <button className="w-full mt-8 bg-primary text-white py-3 rounded-xl font-bold hover:bg-secondary hover:text-primary transition-colors duration-300">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;