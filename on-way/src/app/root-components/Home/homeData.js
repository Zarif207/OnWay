import {
  Bike,
  Car,
  CreditCard,
  BriefcaseMedical,
  ShieldCheck,
  Sparkles,
  Wallet,
  Route,
  Users,
  Clock,
  Star,
} from "lucide-react";

export const stats = [
  {
    label: "Rides Completed",
    value: "120K+",
    icon: Route
  },
  {
    label: "Driver Partners",
    value: "50+",
    icon: Users
  },
  {
    label: "Years of Service",
    value: "5+",
    icon: Clock
  },
  {
    label: "Happy Riders",
    value: "50K+",
    icon: Star
  },
];

export const services = [
  {
    key: "bike",
    name: "OnWay Bike",
    icon: Bike,
    tagline: "Beat the traffic, arrive on time.",
    bullets: [
      "Fast pickups with smart matching",
      "Live trip tracking & shareable ETA",
      "Safety-first rides with trusted partners",
    ],
    cta: { label: "Explore Ride", href: "#services" },
    accent: "from-primary/20 to-orange-500/20",
  },
  {
    key: "car",
    name: "OnWay Car",
    icon: Car,
    tagline: "Comfort when you need it.",
    bullets: [
      "Everyday economy to premium comfort",
      "Upfront pricing with transparent breakdown",
      "Quick rebooking and scheduled rides",
    ],
    cta: { label: "Explore Car", href: "#services" },
    accent: "from-sky-500/20 to-indigo-500/20",
  },
  {
    key: "ambulance",
    name: "OnWay Ambulance",
    icon: BriefcaseMedical,
    tagline: "Eco-friendly, budget-friendly rides.",
    bullets: [
      "Optimized for short city distances",
      "Affordable rates with fixed pricing",
      "Available across all major city hubs",
    ],
    cta: { label: "Explore Ambulance", href: "#services" },
    accent: "from-emerald-500/20 to-teal-500/20",
  },
  {
    key: "pay",
    name: "OnWay Pay",
    icon: Wallet,
    tagline: "Move money the way you want.",
    bullets: [
      "One wallet across all rides",
      "Split bills, top-up, and pay later options",
      "Track spending with smart insights",
    ],
    cta: { label: "Explore Pay", href: "#services" },
    accent: "from-violet-500/20 to-fuchsia-500/20",
  },
];

export const safetyFeatures = [
  {
    title: "Live location share",
    description:
      "Share your trip and ETA with trusted contacts in a single tap — anytime.",
    icon: ShieldCheck,
  },
  {
    title: "24/7 support",
    description:
      "Reach OnWay Support any time via in‑app chat and priority helplines.",
    icon: Sparkles,
  },
  {
    title: "Secure payments",
    description:
      "Pay with card, wallet, or cash — with fraud monitoring and receipts.",
    icon: CreditCard,
  },
];

export const press = [
  { name: "Forbes", blurb: "OnWay is helping cities move smarter." },
  { name: "TechCrunch", blurb: "A super app experience built for everyday mobility." },
  { name: "The Financial Express", blurb: "OnWay expands services across new regions." },
  { name: "The Business Standard", blurb: "OnWay raises the bar on safety & support." },
  { name: "Rest of World", blurb: "OnWay reimagines urban mobility." },
];

export const blogPosts = [
  {
    title: "OnWay Launches Smart Pickups",
    date: "Product Updates • Feb 2026",
    excerpt:
      "Smarter matching and faster pickups — engineered for busy city streets.",
    tag: "Product",
  },
  {
    title: "Rewards That Move With You",
    date: "OnWay Pay • Jan 2026",
    excerpt:
      "Earn points on rides and referrals — then redeem them anywhere in-app.",
    tag: "Pay",
  },
  {
    title: "OnWay Safety: Every Step of the Way",
    date: "Safety • Dec 2025",
    excerpt:
      "From live location sharing to rapid response support — here’s how we protect you.",
    tag: "Safety",
  },
];
export const transportationServices = [
  {
    side: "left",
    title: "City Express",
    desc: "Swift intra-city deliveries via bike.",
    icon: Bike,
  },
  {
    side: "left",
    title: "Ground Logistics",
    desc: "Massive fleet of trucks for land cargo.",
    icon: Car, // Using Car for now, will find better or use placeholder
  },
  {
    side: "left",
    title: "Medical Wing",
    desc: "Priority ambulance & emergency transport.",
    icon: BriefcaseMedical,
  },
  {
    side: "right",
    title: "Air Freight",
    desc: "International air shipping solutions.",
    icon: Sparkles, // Placeholder for Plane
  },
  {
    side: "right",
    title: "Premium Fleet",
    desc: "Executive luxury rides for VIPs.",
    icon: ShieldCheck,
  },
  {
    side: "right",
    title: "Sea Logistics",
    desc: "Bulk ocean freight and shipping.",
    icon: Wallet, // Placeholder for Ship
  },
];

export const earnFeatures = [
  {
    title: "Flexible Schedule",
    desc: "Work on your own terms and choose when to drive.",
    icon: Clock,
  },
  {
    title: "Instant Payouts",
    desc: "Get your earnings deposited directly to your wallet.",
    icon: Wallet,
  },
  {
    title: "Driver Support",
    desc: "24/7 dedicated assistance for all our partners.",
    icon: Users,
  },
  {
    title: "Performance Bonus",
    desc: "Earn more with weekly incentives and rewards.",
    icon: Star,
  },
];
