import React from 'react';
import { CreditCard, ShieldCheck, RefreshCcw, AlertOctagon, HelpCircle, FileText } from "lucide-react";

const CardAgreement = () => {
  const sections = [
    {
      title: "Payment Authorization",
      icon: <CreditCard className="w-5 h-5 text-[#259461]" />,
      content: "By adding a card to your OnWay account, you authorize us to charge your card for ride fares, service fees, and other applicable charges."
    },
    {
      title: "Secure Transactions",
      icon: <ShieldCheck className="w-5 h-5 text-[#259461]" />,
      content: "All card transactions are processed through secure payment gateways with encryption to protect your financial information."
    },
    {
      title: "Refund Policy",
      icon: <RefreshCcw className="w-5 h-5 text-[#259461]" />,
      content: "If a payment issue occurs, eligible refunds will be processed to the same card used for the transaction."
    },
    {
      title: "Fraud Prevention",
      icon: <AlertOctagon className="w-5 h-5 text-[#259461]" />,
      content: "OnWay may temporarily suspend transactions if suspicious activity is detected to protect users from unauthorized payments."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfd] py-16 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header with Icon */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="p-4 bg-green-50 rounded-full mb-4">
            <FileText className="w-10 h-10 text-[#259461]" />
          </div>
          <h1 className="text-4xl font-bold text-[#001820]">Card Payment Agreement</h1>
          <div className="w-20 h-1 bg-[#259461] mt-4 rounded-full"></div>
          <p className="mt-6 text-zinc-500 max-w-2xl">
            This Card Agreement explains the terms and conditions that apply when
            you use a debit or credit card to make payments on the <span className="text-[#259461] font-semibold">OnWay</span> platform.
          </p>
        </div>

        {/* Content Grid */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div 
              key={index} 
              className="collapse collapse-arrow bg-white border border-zinc-100 shadow-sm rounded-2xl overflow-hidden hover:border-green-200 transition-colors"
            >
              <input type="radio" name="my-accordion-2" defaultChecked={index === 0} /> 
              <div className="collapse-title flex items-center gap-4 text-lg font-bold text-secondary">
                {section.icon}
                {section.title}
              </div>
              <div className="collapse-content px-14"> 
                <p className="text-zinc-600 leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-12 bg-[#001820] rounded-3xl p-8 text-white flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <HelpCircle className="w-8 h-8 text-[#259461]" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Need help with payments?</h3>
              <p className="text-zinc-400 text-sm">Our support team is available 24/7 for your queries.</p>
            </div>
          </div>
          <button className="btn bg-[#259461] hover:bg-[#2cbe6b] border-none text-white px-8 rounded-xl shadow-lg">
            Contact Support
          </button>
        </div>

        {/* Footer */}
        <div className="mt-10 flex justify-between items-center text-xs text-zinc-400 border-t border-zinc-100 pt-6">
          <p>© {new Date().getFullYear()} OnWay Technologies Ltd.</p>
          <p>Last updated: March {new Date().getFullYear()}</p>
        </div>

      </div>
    </div>
  );
};

export default CardAgreement;