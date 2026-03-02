"use client";

export default function WalkInSupportCenters() {
  const supportCenters = [
    {
      name: "OnWay Dhaka Central Hub",
      address: "House 45, Road 12, Dhanmondi, Dhaka 1209",
      phone: "+880 1700-000000",
      hours: "9:00 AM - 8:00 PM (7 days a week)",
      services: ["Account Issues", "Payment Problems", "Driver Registration", "Vehicle Inspection"]
    },
    {
      name: "OnWay Gulshan Support Center",
      address: "Plot 23, Gulshan Avenue, Gulshan-1, Dhaka 1212",
      phone: "+880 1700-000001",
      hours: "10:00 AM - 7:00 PM (Closed on Fridays)",
      services: ["General Support", "Lost & Found", "Complaint Resolution"]
    },
    {
      name: "OnWay Chittagong Office",
      address: "CDA Avenue, Nasirabad, Chittagong 4000",
      phone: "+880 1800-000000",
      hours: "9:00 AM - 6:00 PM (Closed on Fridays)",
      services: ["Driver Registration", "Account Support", "Payment Issues"]
    },
    {
      name: "OnWay Sylhet Branch",
      address: "Zindabazar, Sylhet 3100",
      phone: "+880 1800-000001",
      hours: "10:00 AM - 6:00 PM (Closed on Fridays)",
      services: ["General Support", "Driver Onboarding"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Walk-In Support Centers</h1>
          <p className="text-lg text-gray-300 mb-4">
            Visit our physical locations for in-person assistance
          </p>
          <p className="text-sm text-gray-400">
            Please bring a valid ID and any relevant documents
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-start">
            <div className="text-3xl mr-4">ℹ️</div>
            <div>
              <h3 className="font-bold text-lg mb-2">Before You Visit</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Bring your government-issued ID</li>
                <li>• Have your OnWay account details ready</li>
                <li>• For driver registration, bring vehicle documents</li>
                <li>• Walk-ins are welcome, but appointments are recommended for faster service</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Support Centers List */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Our Support Centers
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {supportCenters.map((center, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
                <h3 className="text-2xl font-bold text-gray-900">{center.name}</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start">
                  <div className="text-2xl mr-3">📍</div>
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-gray-600">{center.address}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-2xl mr-3">📞</div>
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-gray-600">{center.phone}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-2xl mr-3">🕒</div>
                  <div>
                    <p className="font-semibold text-gray-900">Hours</p>
                    <p className="text-gray-600">{center.hours}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-2xl mr-3">🛠️</div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">Services Offered</p>
                    <div className="flex flex-wrap gap-2">
                      {center.services.map((service, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <button className="w-full bg-yellow-400 text-black py-3 rounded-lg hover:bg-yellow-500 transition font-medium">
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Help */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Can't Visit in Person?
          </h2>
          <p className="text-gray-600 mb-8">
            We offer multiple ways to get support
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-bold mb-2">Live Chat</h3>
              <p className="text-gray-600 text-sm">Available 24/7 in the app</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-3">📧</div>
              <h3 className="font-bold mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm">support@onway.com</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-3">📞</div>
              <h3 className="font-bold mb-2">Phone Support</h3>
              <p className="text-gray-600 text-sm">+880 1700-ONWAY</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
