export default function PassengerDashboard() {
  return (
    <div className="max-w-4xl mx-auto py-16">
      <h1 className="text-3xl font-bold mb-6">Welcome to Passenger Dashboard</h1>

      <p className="text-gray-600 mb-8">
        From here you can book rides, track your current trip, manage your wallet,
        and view ride history.
      </p>

      <div className="grid grid-cols-2 gap-6">
        <DashboardCard
          title="Book a Ride"
          desc="Request a new ride quickly."
          href="/dashboard/passenger/book-ride"
        />
        <DashboardCard
          title="Track Ride"
          desc="See your active ride status."
          href="/dashboard/passenger/active-ride"
        />
        <DashboardCard
          title="Ride History"
          desc="View your previous trips."
          href="/dashboard/passenger/ride-history"
        />
        <DashboardCard
          title="Wallet"
          desc="Manage your balance and payments."
          href="/dashboard/passenger/wallet"
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, desc, href }) {
  return (
    <a
      href={href}
      className="block rounded-2xl border p-6 hover:shadow-lg transition"
    >
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-500">{desc}</p>
    </a>
  );
}