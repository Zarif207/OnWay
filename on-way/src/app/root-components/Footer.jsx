import Image from "next/image";
import logoImage from "../../../public/icon2.png";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Brand */}
        <div className="lg:col-span-4">
          {/* Logo */}
          <Link href="/" className="flex items-center text-2xl font-extrabold">
            <Image src={logoImage} alt="OnWay" width={120} height={94} />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            OnWay is your everyday mobility super app — ride, car, CNG, and
            secure payments in one seamless experience.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-zinc-400">
            <span className="rounded-full border border-zinc-800 px-3 py-1">
              Rides
            </span>
            <span className="rounded-full border border-zinc-800 px-3 py-1">
              CNG
            </span>
            <span className="rounded-full border border-zinc-800 px-3 py-1">
              Pay
            </span>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">Platform</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#services" className="hover:text-yellow-300">
                OnWay Ride
              </a>
            </li>
            <li>
              <a href="#services" className="hover:text-yellow-300">
                OnWay Car
              </a>
            </li>
            <li>
              <a href="#services" className="hover:text-yellow-300">
                OnWay CNG
              </a>
            </li>
            <li>
              <a href="#services" className="hover:text-yellow-300">
                OnWay Pay
              </a>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">Earn</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#earn" className="hover:text-yellow-300">
                Become a Rider
              </a>
            </li>
            <li>
              <a href="#earn" className="hover:text-yellow-300">
                Become a Driver
              </a>
            </li>
            <li>
              <a href="#earn" className="hover:text-yellow-300">
                Become a CNG Driver
              </a>
            </li>
            <li>
              <a href="#press" className="hover:text-yellow-300">
                Press
              </a>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">Help</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#contact" className="hover:text-yellow-300">
                Send a message
              </a>
            </li>
            <li>
              <a href="#safety" className="hover:text-yellow-300">
                Safety
              </a>
            </li>
            <li>
              <a href="#download" className="hover:text-yellow-300">
                Download app
              </a>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-yellow-300">
                About OnWay
              </Link>
            </li>
            <li>
              <a href="#press" className="hover:text-yellow-300">
                Press
              </a>
            </li>
            <li>
              <a href="#blog" className="hover:text-yellow-300">
                Blog
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-900">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-5 text-sm sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p className="text-zinc-400">
            © {new Date().getFullYear()} OnWay. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-zinc-400">
            <Link href="/terms" className="hover:text-yellow-300">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-yellow-300">
              Privacy
            </Link>
            <span className="text-zinc-700">•</span>
            <span>Region: Global</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
