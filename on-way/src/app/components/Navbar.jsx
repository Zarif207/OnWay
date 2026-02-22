
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X, LogOut, User, UserPlus, LogIn } from "lucide-react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

const nav = [
  { label: "Home", href: "/" },
  { label: "OnWay Book", href: "/onway-book" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Help", href: "/help" },
];

const more = [
  { label: "Press", href: "#press" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const { data: session } = useSession();

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
          className="flex items-center text-2xl font-extrabold tracking-tight text-zinc-900"
          aria-label="OnWay"
        >
          <Image src="https://i.ibb.co/pBKvRznM/92d917d29a33a23b7c186d8ffc81d4bb-removebg-preview.png" alt="OnWay" width={64} height={64} />
          <span className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-2">Way</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-7 text-sm font-semibold text-zinc-700 md:flex">
          {nav.map((i) => (
            <Link key={i.href} href={i.href} className="transition hover:text-zinc-950">
              {i.label}
            </Link>
          ))}

          <div className="relative">
            <button
              className="inline-flex items-center gap-2 transition hover:text-zinc-950"
              onClick={() => setOpenMenu((v) => !v)}
              type="button"
            >
              More <ChevronDown className="h-4 w-4" />
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg">
                {more.map((m) => (
                  <Link
                    key={m.label}
                    href={m.href}
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
                    onClick={() => setOpenMenu(false)}
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Auth Buttons - Desktop */}
        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              <div className="flex items-center gap-2 px-3 text-sm font-medium text-zinc-600">
                <User className="h-4 w-4" /> {session.user?.name || "User"}
              </div>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
              >
                <LogOut className="h-4 w-4 text-red-500" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
              >
                <LogIn className="h-4 w-4 text-primary" /> Login
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden rounded-xl border border-zinc-200 bg-white p-2 text-zinc-900"
          onClick={() => setIsOpen((v) => !v)}
          type="button"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 pb-5 pt-4 sm:px-6">
          <div className="space-y-2">
            {nav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="block rounded-xl px-3 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                onClick={() => setIsOpen(false)}
              >
                {i.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 grid gap-2">
            {session ? (
              <button
                onClick={() => { signOut(); setIsOpen(false); }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-bold text-zinc-950"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn className="h-4 w-4" /> Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <UserPlus className="h-4 w-4" /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;