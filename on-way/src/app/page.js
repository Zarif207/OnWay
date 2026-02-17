export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      
      <h1 className="text-4xl font-bold text-secondary">
        Welcome to OnWay 🚗
      </h1>

      <button className="btn btn-primary text-base-100 border-none">
        Book Ride
      </button>

      <button className="btn btn-accent text-base-100 border-none">
        Become a Driver
      </button>

    </div>
  );
}
