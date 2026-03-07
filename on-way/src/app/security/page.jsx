import React from 'react';
import { Shield, Lock, CreditCard, PhoneCall, CheckCircle } from "lucide-react";

const SecurityPage = () => {
  // Logic: Data Array
  const securityData = [
    {
      id: 1,
      title: "Data Protection",
      description: "We use high-level encryption and secure servers to protect your personal information.",
      icon: <Lock className="w-8 h-8 text-[#259461]" />,
      tags: ["AES-256", "SSL"]
    },
    {
      id: 2,
      title: "Ride Safety",
      description: "Every driver is verified and every trip is GPS-tracked in real-time for your peace of mind.",
      icon: <Shield className="w-8 h-8 text-[#259461]" />,
      tags: ["GPS", "Verified"]
    },
    {
      id: 3,
      title: "Secure Payments",
      description: "Our gateways are PCI-DSS compliant, ensuring your card details are never compromised.",
      icon: <CreditCard className="w-8 h-8 text-[#259461]" />,
      tags: ["Encrypted", "Safe"]
    },
    {
      id: 4,
      title: "Emergency Support",
      description: "Dedicated 24/7 safety team and an in-app SOS button for immediate assistance.",
      icon: <PhoneCall className="w-8 h-8 text-[#259461]" />,
      tags: ["24/7", "SOS"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <header className="bg-secondary py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate__animated animate__fadeInDown">
          Security at <span className="text-[#259461]">OnWay</span>
        </h1>
        <p className="max-w-2xl mx-auto text-zinc-400 text-lg italic">
          &apos;Your safety isn\&apos;t just a feature, it\&apos;s our foundation.&apos;
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {securityData.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-8 rounded-2xl shadow-lg border border-zinc-100 hover:border-[#259461] transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-green-50 rounded-xl group-hover:bg-[#259461] transition-colors duration-300">
                   {/* Icon color change on hover */}
                  <div className="group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-widest bg-zinc-100 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-[#001820] mb-3">{item.title}</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                {item.description}
              </p>
              
              <div className="flex items-center text-[#259461] font-semibold text-sm cursor-pointer">
                Learn more <CheckCircle className="ml-2 w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Contact Section */}
        <section className="mt-20 mb-16 p-10 bg-[#f8fafc] rounded-3xl border-2 border-dashed border-zinc-200 text-center">
          <h3 className="text-2xl font-bold text-secondary mb-2">Still have concerns?</h3>
          <p className="text-zinc-500 mb-6">Our security experts are ready to answer your questions.</p>
          <button className="btn bg-[#259461] hover:bg-[#2cbe6b] text-white border-none px-10 rounded-full shadow-lg shadow-green-200">
            Talk to Safety Team
          </button>
        </section>
      </main>
    </div>
  );
};

export default SecurityPage;