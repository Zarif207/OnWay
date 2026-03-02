import {
  Bike,
  Car,
  CreditCard,
  BriefcaseMedical,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

export const stats = [
  { label: "App Downloads", value: 1500000, suffix: "+" },
  { label: "Trips Served", value: 22000000, suffix: "+" },
  { label: "Cities Covered", value: 35, suffix: "+" },
  { label: "Partners Empowered", value: 180000, suffix: "+" },
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


