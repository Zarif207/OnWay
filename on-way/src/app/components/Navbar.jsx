"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Download, Menu, X } from "lucide-react";

const nav = [
  { label: "Home", href: "/" },
  { label: "Book Ride", href: "#services" },
  { label: "About Us", href: "about-us" },
  { label: "Earn", href: "#earn" },
  { label: "Blog", href: "blog" },
  { label: "Help", href: "help" },
];

const more = [
  { label: "OnWay for Business", href: "#business" },
  { label: "Press", href: "#press" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setOpenMenu(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-zinc-900"
          aria-label="OnWay"
        >
          <span className="rounded-xl bg-yellow-400 px-2 py-1 text-zinc-950">
            On
          </span>
          <span className="ml-1">Way</span>
        </Link>

        <div className="hidden items-center gap-7 text-sm font-semibold text-zinc-700 md:flex">
          {nav.map((i) => (
            <a
              key={i.href}
              href={i.href}
              className="transition hover:text-zinc-950"
            >
              {i.label}
            </a>
          ))}

          <div className="relative">
            <button
              className="inline-flex items-center gap-2 transition hover:text-zinc-950"
              onClick={() => setOpenMenu((v) => !v)}
              type="button"
              aria-expanded={openMenu}
            >
              More <ChevronDown className="h-4 w-4" />
            </button>

            {openMenu ? (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg">
                {more.map((m) => (
                  <a
                    key={m.label}
                    href={m.href}
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
                    onClick={() => setOpenMenu(false)}
                  >
                    {m.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#download"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
          >
            <Download className="h-4 w-4 text-yellow-500" />
            Download
          </a>
          <a
            href="#contact"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Contact
          </a>
        </div>

        <button
          className="md:hidden rounded-xl border border-zinc-200 bg-white p-2 text-zinc-900"
          onClick={() => setIsOpen((v) => !v)}
          type="button"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 pb-5 pt-4 sm:px-6">
          <div className="space-y-2">
            {nav.map((i) => (
              <a
                key={i.href}
                href={i.href}
                className="block rounded-xl px-3 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                onClick={() => setIsOpen(false)}
              >
                {i.label}
              </a>
            ))}
            {more.map((m) => (
              <a
                key={m.label}
                href={m.href}
                className="block rounded-xl px-3 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                onClick={() => setIsOpen(false)}
              >
                {m.label}
              </a>
            ))}
          </div>

          <div className="mt-4 grid gap-2">
            <a
              href="#download"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-zinc-950"
              onClick={() => setIsOpen(false)}
            >
              <Download className="h-4 w-4" />
              Download OnWay
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900"
              onClick={() => setIsOpen(false)}
            >
              Send a message
            </a>
          </div>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
