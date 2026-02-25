import React from 'react';
import { MapPin, MousePointerClick, ShieldCheck } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Book in Seconds",
      description: "Enter your pickup and destination to find the nearest available ride.",
      icon: <MapPin className="w-12 h-12 text-secondary" /> // Secondary Yellow bebohar kora hoyeche
    },
    {
      id: 2,
      title: "Choose Your Ride",
      description: "Select from a variety of vehicles that fit your style and budget.",
      icon: <MousePointerClick className="w-12 h-12 text-secondary" />
    },
    {
      id: 3,
      title: "Arrive Safely",
      description: "Track your driver in real-time and enjoy a comfortable journey to your destination.",
      icon: <ShieldCheck className="w-12 h-12 text-secondary" />
    }
  ];

  return (
    // Background-e accent color bebohar kora hoyeche
    <section className="py-20 bg-accent">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          {/* Text-e Primary color bebohar kora hoyeche */}
          <h2 className="text-4xl font-extrabold text-primary mb-4 tracking-tight uppercase">
            How OnWay Works
          </h2>
          <div className="w-24 h-1 bg-secondary mx-auto mb-6"></div> {/* Ekta yellow divider line */}
          <p className="text-primary/80 max-w-2xl mx-auto text-lg">
            Getting around your city has never been this easy. Follow these simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className="group text-center p-8 rounded-2xl bg-white border border-transparent hover:border-secondary transition-all duration-300 shadow-sm hover:shadow-xl"
            >
              <div className="flex justify-center mb-6 transform group-hover:scale-110 transition-transform">
                {/* Icon er pichone primary background */}
                <div className="p-4 bg-primary rounded-full shadow-lg">
                   {step.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;