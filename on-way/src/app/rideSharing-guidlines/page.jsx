import React from "react";

const GuidelinesBanner = () => {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center mb-10"
      style={{ minHeight: "320px" }}
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0f0c29, #1a1a4e, #0f3460, #16213e)",
          backgroundSize: "400% 400%",
          animation: "gradShift 8s ease infinite",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow orbs */}
      <div
        className="absolute rounded-full"
        style={{
          width: 220, height: 220,
          background: "#6c63ff",
          top: -60, left: -40,
          filter: "blur(60px)",
          opacity: 0.35,
          animation: "orbFloat 6s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 180, height: 180,
          background: "#00d4ff",
          bottom: -40, right: 40,
          filter: "blur(60px)",
          opacity: 0.35,
          animation: "orbFloat 6s ease-in-out 2s infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 120, height: 120,
          background: "#ff6b6b",
          top: 40, right: 120,
          filter: "blur(60px)",
          opacity: 0.2,
          animation: "orbFloat 6s ease-in-out 4s infinite",
        }}
      />

      {/* Moving road lines */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: 56, opacity: 0.2 }}>
        {[0, 0.35, 0.7, 1.05].map((delay, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              bottom: 20, height: 4, width: 64,
              animation: `roadMove 1.4s linear ${delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-14">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs uppercase tracking-widest"
          style={{
            background: "rgba(108,99,255,0.2)",
            border: "1px solid rgba(108,99,255,0.5)",
            color: "#a8a4ff",
          }}
        >
          <span
            className="rounded-full"
            style={{
              width: 6, height: 6,
              background: "#6c63ff",
              animation: "pulse 1.4s ease infinite",
              display: "inline-block",
            }}
          />
          OnWay Platform
        </div>

        {/* Title */}
        <h1
          className="font-extrabold text-white leading-tight mb-3"
          style={{
            fontSize: "clamp(28px, 5vw, 52px)",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          Ride Sharing{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #6c63ff, #00d4ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Guidelines
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mb-7 leading-relaxed text-sm md:text-base"
          style={{ color: "rgba(255,255,255,0.6)", maxWidth: 480 }}
        >
          Safe journeys start with awareness. Know the rules, protect yourself,
          and ride with confidence.
        </p>

        {/* Pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { icon: "🚦", label: "Traffic Rules" },
            { icon: "🧍", label: "Rider Safety" },
            { icon: "🚗", label: "Driver Code" },
            { icon: "🛡️", label: "Emergency SOS" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span>{icon}</span> {label}
            </div>
          ))}
        </div>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes roadMove {
          0%   { left: -64px; }
          100% { left: calc(100% + 64px); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-18px) scale(1.05); }
        }
      `}</style>
    </div>
  );
};

const RideSharingGuidelines = () => {
  return (
    /* pt-28 add kora hoyeche jate navbar-er niche content thikmoto thake */
    <div className="max-w-6xl mx-auto px-4 pt-20">

      {/* Hero Banner */}
      <GuidelinesBanner />

      {/* Intro */}
      <div className="glossy-card rounded-xl p-6 mb-8 shadow-md border border-gray-100 bg-white/50 backdrop-blur-sm">
        <p className="text-lg">
          This page provides important information about ride-sharing policies,
          traffic rules, and safety guidelines to ensure a secure and smooth experience.
        </p>
      </div>

      {/* Traffic Rules Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span>🚦</span> Traffic Rules & Penalties
        </h2>

        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="table w-full">
            <thead className="bg-gray-100 text-black">
              <tr>
                <th className="p-4 text-left border-b">Offense</th>
                <th className="p-4 text-left border-b">Penalty (New Law)</th>
              </tr>
            </thead>
            <tbody className="text-sm md:text-base">
              {[
                ["Driving without a license", "6 months imprisonment and 25,000 BDT fine"],
                ["Unregistered vehicle", "6 months imprisonment or 50,000 BDT fine or both"],
                ["Unfit vehicle", "6 months imprisonment or 25,000 BDT fine or both"],
                ["Vehicle body modification", "Up to 3 years imprisonment or 300,000 BDT fine or both"],
                ["No route/fitness permit", "6 months imprisonment or 25,000 BDT fine or both"],
                ["Over speeding", "3 months imprisonment or 10,000 BDT fine or both"],
                ["Using prohibited horn", "3 months imprisonment or 15,000 BDT fine or both"],
                ["Driving on the wrong side", "3 months imprisonment or 10,000 BDT fine or both"],
                ["Ignoring traffic signals", "3 months imprisonment or 10,000 BDT fine or both"],
                ["Using fake license", "100,000–500,000 BDT fine or 6 months to 2 years imprisonment"],
                ["Illegal parking", "Up to 5,000 BDT fine"],
                ["No helmet", "Up to 10,000 BDT fine"],
                ["No seatbelt", "Up to 5,000 BDT fine"],
                ["Using phone while driving", "Up to 5,000 BDT fine"],
              ].map(([offense, penalty], i, arr) => (
                <tr key={offense} className="hover:bg-gray-50 transition-colors">
                  <td className={`p-4 ${i < arr.length - 1 ? "border-b" : ""}`}>{offense}</td>
                  <td className={`p-4 font-medium ${i < arr.length - 1 ? "border-b" : ""}`}>{penalty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rider Guidelines */}
      <div className="glossy-card rounded-xl p-6 mb-8 shadow-md border border-gray-100">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span>🧍</span> Rider Guidelines
        </h2>
        <ul className="list-disc ml-5 space-y-2 text-gray-700">
          <li>Verify driver details before starting the ride</li>
          <li>Use OTP verification</li>
          <li>Share live location with trusted contacts</li>
          <li>Use SOS button in emergencies</li>
          <li>Prefer digital payments</li>
        </ul>
      </div>

      {/* Driver Guidelines */}
      <div className="glossy-card rounded-xl p-6 mb-8 shadow-md border border-gray-100">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span>🚗</span> Driver Guidelines
        </h2>
        <ul className="list-disc ml-5 space-y-2 text-gray-700">
          <li>Follow all traffic rules strictly</li>
          <li>Be polite and professional</li>
          <li>Maintain vehicle cleanliness</li>
          <li>Avoid unnecessary ride cancellations</li>
        </ul>
      </div>

      {/* Safety Section */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-red-700">
          <span>🦠</span> Safety & Health
        </h2>
        <ul className="list-disc ml-5 space-y-2 text-red-900">
          <li>Use sanitizer regularly</li>
          <li>Avoid physical contact</li>
          <li>Do not travel if sick</li>
          <li>Follow WHO and national guidelines</li>
        </ul>
      </div>

      {/* Contact Support */}
      <div className="bg-base-200 rounded-xl p-8 text-center border border-gray-200 shadow-inner">
        <h2 className="text-xl font-bold mb-2">📞 Contact Support</h2>
        <p className="text-lg font-semibold text-primary">Helpline: 13301</p>
        <p className="text-gray-600 italic">Email: support@rideshare.com</p>
      </div>

    </div>
  );
};

export default RideSharingGuidelines;