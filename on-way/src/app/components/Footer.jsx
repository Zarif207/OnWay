import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-yellow-400">OnWay</h2>
          <p className="mt-4 text-sm">
            Smart Ride Sharing Platform providing safe,
            fast and reliable transportation.
          </p>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-white font-semibold mb-4">Services</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/book-ride" className="hover:text-yellow-400">Book Ride</Link></li>
            <li><Link href="/schedule" className="hover:text-yellow-400">Schedule Ride</Link></li>
            <li><Link href="/pricing" className="hover:text-yellow-400">Pricing</Link></li>
            <li><Link href="/safety" className="hover:text-yellow-400">SOS Support</Link></li>
          </ul>
        </div>

        {/* Dashboards */}
        <div>
          <h3 className="text-white font-semibold mb-4">Dashboards</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/admin" className="hover:text-yellow-400">Admin</Link></li>
            <li><Link href="/rider" className="hover:text-yellow-400">Rider</Link></li>
            <li><Link href="/passenger" className="hover:text-yellow-400">Passenger</Link></li>
            <li><Link href="/support" className="hover:text-yellow-400">Support Agent</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-white font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="hover:text-yellow-400">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-yellow-400">Privacy Policy</Link></li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {new Date().getFullYear()} OnWay. All rights reserved.</p>
          <div className="flex gap-4 mt-3 md:mt-0">
            <span className="hover:text-yellow-400 cursor-pointer">Facebook</span>
            <span className="hover:text-yellow-400 cursor-pointer">Twitter</span>
            <span className="hover:text-yellow-400 cursor-pointer">LinkedIn</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;