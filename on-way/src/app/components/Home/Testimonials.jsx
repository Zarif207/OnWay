import React from 'react';

const Testimonials = () => {
    const reviews = [
        {
            id: 1,
            name: "Alex Johnson",
            role: "Daily Commuter",
            text: "Onway has completely changed how I travel to work. No more waiting for hours; the drivers are always punctual and professional.",
            image: "https://i.pravatar.cc/150?u=alex"
        },
        {
            id: 2,
            name: "Sarah Williams",
            role: "Frequent Traveler",
            text: "The safety features and live tracking give me peace of mind when traveling late at night. Highly recommended for everyone!",
            image: "https://i.pravatar.cc/150?u=sarah"
        }
    ];

    return (

        <section className="py-20 bg-accent">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">

                    <h2 className="text-4xl font-extrabold text-primary tracking-tight">
                        What Our Riders Say
                    </h2>

                    <div className="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {reviews.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left transition-all duration-300 hover:shadow-lg"
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 rounded-full object-cover ring-4 ring-secondary/30 border-2 border-secondary"
                            />
                            <div className="flex-1">
                                <span className="text-4xl text-secondary leading-none select-none">“</span>
                                <p className="text-lg text-primary/80 italic mb-6 leading-relaxed -mt-4">
                                    {item.text}
                                </p>
                                <div>
                                    <h4 className="font-bold text-xl text-primary">{item.name}</h4>

                                    <p className="text-secondary-content bg-secondary/10 inline-block px-3 py-1 rounded-md font-bold text-xs uppercase tracking-widest mt-1">
                                        {item.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;