"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Headphones,
  MapPin,
  Navigation2,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react";
import Container from "./Container";

import Image from "next/image";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      {/* Full Background Image */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="relative h-full w-full">
          <Image
            src="https://i.ibb.co/fzFZnkkH/7263163c0bf80eb3fade3c80e145d6d1.jpg"
            alt="Yellow taxi cab background"
            fill
            className="object-cover object-center"
            priority
            quality={90}
            sizes="100vw"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
        </div>
      </div>

      <Container className="relative z-20 py-10 sm:py-14 lg:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[440px_1fr] lg:gap-14">
          {/* Left Side - Booking Form */}
          <div data-aos="fade-up" className="relative z-30">
            <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_-55px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                  <span className="grid h-9 w-9 place-items-center rounded-2xl bg-yellow-400 text-zinc-950">
                    <MapPin className="h-4 w-4" />
                  </span>
                  Bogra, BD
                </div>
                <button className="text-xs font-semibold text-white/60 hover:text-white">
                  Change city
                </button>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-yellow-300/90">
                  Book a ride
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Go anywhere with OnWay
                </h2>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                    <Clock className="h-4 w-4 text-yellow-300" />
                    Pickup now
                  </div>
                  <span className="text-xs font-semibold text-white/50">
                    Anytime
                  </span>
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-white/70">
                    Pickup
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-yellow-400/50 focus-within:ring-2 focus-within:ring-yellow-400/20">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
                    <input
                      type="text"
                      placeholder="Enter pickup location"
                      className="w-full bg-transparent text-sm font-medium text-white placeholder-white/40 outline-none"
                    />
                    <Navigation2
                      className="h-4 w-4 rotate-45 text-red-400"
                      fill="currentColor"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-white/70">
                    Dropoff
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-yellow-400/50 focus-within:ring-2 focus-within:ring-yellow-400/20">
                    <span className="h-2.5 w-2.5 rounded-sm bg-white/70" />
                    <input
                      type="text"
                      placeholder="Enter destination"
                      className="w-full bg-transparent text-sm font-medium text-white placeholder-white/40 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <button
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-6 py-3 text-zinc-950 hover:bg-yellow-400 active:bg-yellow-400 focus:bg-yellow-400"
                  variant="accent"
                >
                  See prices <ArrowRight className="h-4 w-4" />
                </button>
                <button className="text-center text-xs font-semibold text-white/60 hover:text-white sm:text-right">
                  Log in to view recent trips
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-white/60">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <ShieldCheck className="h-4 w-4 text-yellow-300" />
                  Safety tools
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <Wallet className="h-4 w-4 text-yellow-300" />
                  Cashless payments
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Value prop */}
          <div
            data-aos="fade-left"
            className="relative z-30 flex flex-col justify-start pt-2 lg:pt-10"
          >
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70"
            >
              <BadgeCheck className="h-4 w-4 text-yellow-300" />
              Trusted rides & transport
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
              className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Move smarter with{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                OnWay
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.16 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
            >
              Request a ride, track your trip, and pay securely — built for busy
              days and late nights. Fast pickups, consistent safety, and support
              that answers.
            </motion.p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Star,
                  title: "4.9",
                  desc: "Average rating",
                },
                {
                  icon: Headphones,
                  title: "24/7",
                  desc: "Support",
                },
                {
                  icon: ShieldCheck,
                  title: "Safety",
                  desc: "Tools included",
                },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.title}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-yellow-400/15 text-yellow-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-lg font-bold text-white">
                          {c.title}
                        </p>
                        <p className="text-xs font-semibold text-white/60">
                          {c.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                as="link"
                href="#services"
                variant="accent"
                className="flex items-center gap-2 rounded-2xl !bg-[#fdc800] px-6 py-3 !text-zinc-950 hover:!bg-[#fdc800] hover:!text-zinc-950 active:!bg-[#fdc800] focus:!bg-[#fdc800]"
              >
                Explore services <ArrowRight className="h-4 w-4" />
              </button>
              <button
                as="link"
                href="#earn"
                variant="outline"
                className="rounded-2xl border-white/15 bg-white/0 px-6 py-3 text-white hover:bg-white/5"
              >
                Earn with OnWay
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
