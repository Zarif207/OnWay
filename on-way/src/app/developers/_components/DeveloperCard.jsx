"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Facebook, Globe, Crown, Sparkles } from "lucide-react";
import Link from "next/link";

const SOCIAL_CONFIG = {
  github:    { Icon: Github,   label: "GitHub",    base: "bg-[#24292e]" },
  linkedin:  { Icon: Linkedin, label: "LinkedIn",  base: "bg-[#0077b5]" },
  facebook:  { Icon: Facebook, label: "Facebook",  base: "bg-[#1877f2]" },
  portfolio: { Icon: Globe,    label: "Portfolio", base: "bg-[#2FCA71]"  },
};

const ROLE_GRADIENTS = {
  "Leader & Frontend":     "from-amber-400 to-orange-500",
  "Co-Leader & Fullstack": "from-blue-400 to-violet-500",
  "System Developer":      "from-[#2FCA71] to-teal-400",
  "MERN Stack":            "from-purple-400 to-pink-500",
  "Frontend":              "from-cyan-400 to-blue-500",
};

export default function DeveloperCard({ developer, index }) {
  const { name, role, avatar, isLeader, isCoLeader, socials = {} } = developer;
  const gradient = ROLE_GRADIENTS[role] || "from-[#2FCA71] to-teal-400";

  return (
    <motion.article
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col rounded-[2rem] overflow-hidden bg-white border border-gray-100/80 shadow-sm hover:shadow-2xl hover:shadow-black/8 hover:-translate-y-2 transition-all duration-400"
    >
      {/* Gradient top bar — unique per role */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

      {/* Card background glow on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none`} />

      {/* Leader / Co-Leader badge */}
      {(isLeader || isCoLeader) && (
        <div className="absolute top-5 right-5 z-10">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
            isLeader
              ? "bg-amber-50 border-amber-200 text-amber-600"
              : "bg-violet-50 border-violet-200 text-violet-600"
          }`}>
            {isLeader
              ? <><Crown className="w-3 h-3 fill-amber-400" /> Leader</>
              : <><Sparkles className="w-3 h-3" /> Co-Leader</>
            }
          </div>
        </div>
      )}

      <div className="flex flex-col items-center text-center px-8 pt-10 pb-8 gap-0 flex-1">
        {/* Avatar */}
        <div className="relative mb-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 shadow-md group-hover:shadow-lg transition-shadow duration-300">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="w-full h-full bg-gradient-to-br from-[#011421] to-[#0a1f3d] items-center justify-center text-3xl font-black text-[#2FCA71] select-none"
              style={{ display: avatar ? "none" : "flex" }}
            >
              {name.charAt(0)}
            </div>
          </div>
          {/* Online indicator */}
          <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-[#2FCA71] rounded-full border-2 border-white shadow-sm" />
        </div>

        {/* Name */}
        <h3 className="text-[1.15rem] font-black text-[#011421] tracking-tight leading-tight mb-2">{name}</h3>

        {/* Role pill */}
        <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r ${gradient} text-white shadow-sm mb-1.5`}>
          {role}
        </span>

        
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-6"></p>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6" />

        {/* Social icons */}
        <div className="flex items-center justify-center gap-2.5">
          {Object.entries(socials).map(([platform, href]) => {
            if (!href || !SOCIAL_CONFIG[platform]) return null;
            const { Icon, label, base } = SOCIAL_CONFIG[platform];
            return (
              <Link
                key={platform}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} on ${label}`}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${base} opacity-80 hover:opacity-100 hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 shadow-sm`}
              >
                <Icon className="w-[15px] h-[15px]" />
              </Link>
            );
          })}
        </div>
      </div>
    </motion.article>
  );
}
