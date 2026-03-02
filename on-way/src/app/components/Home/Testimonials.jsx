import React from "react";

const Riders = () => {
  const riders = [
    {
      id: 1,
      name: "Daniel Carter",
      role: "Top Rated Driver",
      image: "https://i.guim.co.uk/img/media/ac9bb8cc6b8dad151a8d0a74ef2f272271013b7f/234_638_5244_3146/master/5244.jpg?width=1200&quality=85&auto=format&fit=max&s=3aeb009050b2b7ac85f1103af4025a79",
      review:
        "Driving with OnWay has given me the flexibility I was looking for. I can choose my own hours and earn consistently without feeling pressured. The app is smooth, and payments are always on time.",
    },
    {
      id: 2,
      name: "Emily Roberts",
      role: "Premium Ride Specialist",
      image: "https://explorerdubailtd.com/uganda/wp-content/uploads/sites/22/2025/08/professional-african-american-truck-driver-in-casu-scaled.jpg",
      review:
        "What I appreciate most about OnWay is the transparent pricing system. I always know how much I’ll earn before accepting a ride, and there are no hidden deductions. It feels fair and professional.",
    },
    {
      id: 3,
      name: "Sofia Martinez",
      role: "5★ Rider Favorite",
      image: "https://img.freepik.com/free-photo/man-car-driving_23-2148889981.jpg?semt=ais_rp_progressive&w=740&q=80",
      review:
        "OnWay really prioritizes rider safety. The emergency support and real-time tracking features make me feel secure on every trip. Plus, the support team responds quickly whenever I need help.",
    },
    {
      id: 4,
      name: "Michael Brown",
      role: "City Ride Expert",
      image: "https://cdn.prod.website-files.com/595d6b420002832258c527cb/602edff72af06859a9cf846a_driver-behavior-professional-truck-driver-driving-truck-vehicle-1000.jpg",
      review:
        "Being part of OnWay feels like joining a community. The passengers are respectful, the ratings system is balanced, and the platform values its riders. It’s more than just a driving job.",
    },
  ];

  return (
    <section className="bg-[#f4f4f4] py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Small Top Label */}
        <div className="flex items-center justify-center gap-4 text-secondary text-sm font-semibold uppercase tracking-widest mb-6">
          <span className="w-12 h-[2px] bg-secondary"></span>
          Our Top Riders
          <span className="w-12 h-[2px] bg-secondary"></span>
        </div>

        {/* Main Heading */}
        <h2 className="text-center text-4xl sm:text-5xl font-extrabold text-primary leading-tight mb-20">
          Meet Our Professional <br /> OnWay Riders
        </h2>

        {/* Cards */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {riders.map((rider) => (
            <div
              key={rider.id}
              className="text-center transition duration-300 hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-tl-[30px] rounded-tr-[80px] rounded-bl-[30px] rounded-br-[30px] shadow-md">
                <img
                  src={rider.image}
                  alt={rider.name}
                  className="w-full h-[420px] object-cover transition duration-500 hover:scale-105"
                />

                {/* Orange Circle Icon */}
                <div className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-white text-lg shadow-lg">
                  ↗
                </div>
              </div>

              {/* Name */}
              <h4 className="mt-6 text-xl font-bold text-primary">
                {rider.name}
              </h4>

              {/* Role */}
              <p className="text-secondary text-xs font-semibold uppercase tracking-widest mt-1">
                {rider.role}
              </p>

              {/* Divider */}
              <div className="w-10 h-[2px] bg-secondary mx-auto my-4 rounded-full"></div>

              {/* Review */}
              <p className="text-zinc-600 text-sm leading-relaxed px-4 italic">
                “{rider.review}”
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Riders;
