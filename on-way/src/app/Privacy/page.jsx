import React from "react";
import PageBanner from "../components/PageBanner";

export const metadata = {
  title: "Privacy Policy | OnWay Ride",
};

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#1F1F1F] font-sans">
      <PageBanner
        tag="Legal Center"
        title="Privacy Policy"
        subtitle="We are committed to protecting your personal data. Your privacy is our priority."
      />

      <div className="max-w-[1200px] mx-auto py-12 px-6 md:py-16 flex flex-col md:flex-row gap-16">
        
        {/* Sidebar - Pathao Style Bold Nav */}
        <aside className="md:w-1/4">
          <div className="sticky top-10">
            <h1 className="text-4xl font-black mb-8 leading-tight uppercase italic text-black">
              Legal <br />Center
            </h1>
            <ul className="space-y-4 border-l-2 border-gray-200">
              {['Overview', 'Data We Collect', 'Usage Policy', 'Your Safety', 'Contact'].map((item, idx) => (
                <li key={item} className={`pl-6 cursor-pointer hover:text-primary transition-all font-bold ${idx === 0 ? 'border-l-4 border-black -ml-[3px] text-black' : 'text-gray-400'}`}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content - Uber Style Cleanliness */}
        <main className="md:w-3/4">
          <header className="mb-16">
            <h2 className="text-5xl font-bold tracking-tight mb-6">Privacy Policy</h2>
            <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
              We are committed to protecting the personal data of everyone who uses our platform. 
              Our policy is built around your safety and rights.
            </p>
          </header>

          <div className="space-y-20">
            
            {/* Section 01 */}
            <section>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-4">
                <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm rounded-sm">01</span>
                What we collect
              </h3>
              <div className="grid md:grid-cols-2 gap-8 bg-white p-8 border border-gray-100 shadow-sm">
                <div>
                  <h4 className="font-bold mb-2 uppercase text-xs text-gray-400 tracking-widest">User Profile</h4>
                  <p className="text-gray-700">Name, mobile number, and email. This is essential for trip coordination and safety verification.</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2 uppercase text-xs text-gray-400 tracking-widest">Location Data</h4>
                  <p className="text-gray-700">We collect precise location data to match you with drivers and track your trip for safety.</p>
                </div>
              </div>
            </section>

            {/* Section 02 - Visual Callout */}
            <section className="bg-primary/5 border-l-8 border-primary p-10">
              <h3 className="text-2xl font-bold mb-4 italic">How we use your data</h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Your data isn't just numbers to us. It's the fuel that makes your commute possible. 
                We use it for:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 font-bold text-gray-800">
                <li className="flex items-center gap-3">✓ Real-time route optimization</li>
                <li className="flex items-center gap-3">✓ Incident & safety response</li>
                <li className="flex items-center gap-3">✓ Seamless payment processing</li>
                <li className="flex items-center gap-3">✓ Driver-Rider matching</li>
              </ul>
            </section>

            {/* Section 03 - Data Security Card */}
            <section className="bg-black text-white p-12 rounded-sm overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4 italic uppercase">Your Data is Secure.</h3>
                <p className="text-gray-400 max-w-lg mb-8">
                  We use the same level of encryption as global financial institutions. 
                  Your personal information is encrypted at rest and in transit.
                </p>
                <div className="flex gap-6">
                  <div className="border border-white/20 px-4 py-2 text-[10px] font-bold tracking-widest uppercase">SSL-ENCRYPTED</div>
                  <div className="border border-white/20 px-4 py-2 text-[10px] font-bold tracking-widest uppercase">AES-256</div>
                </div>
              </div>
              {/* Abstract Uber-like pattern */}
              <div className="absolute right-[-5%] bottom-[-20%] opacity-20 select-none pointer-events-none">
                <div className="text-[200px] font-black italic leading-none">SAFE</div>
              </div>
            </section>

            {/* Section 04 - Contact */}
            <section className="border-t pt-16">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Need help?</h3>
                  <p className="text-gray-500">Our support team is available 24/7 for privacy concerns.</p>
                </div>
                <button className="bg-black text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-all">
                  Contact Support
                </button>
              </div>
            </section>

          </div>
        </main>
      </div>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 py-10 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center text-sm font-bold text-gray-400">
          <p>© 2026 ONWAY RIDE TECHNOLOGIES</p>
          <div className="flex gap-10 mt-4 md:mt-0 uppercase tracking-widest">
            <span className="hover:text-black cursor-pointer">Terms</span>
            <span className="hover:text-black cursor-pointer">Cookies</span>
            <span className="hover:text-black cursor-pointer">Careers</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;