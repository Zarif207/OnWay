"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, MapPin, Shield, Clock, ChevronDown, Navigation2 } from "lucide-react";
import Container from "./Container";
import { Button, Pill } from "./ui";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-zinc-50 to-white"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-yellow-300/30 blur-3xl" />
        <div className="absolute -bottom-36 -left-24 h-[520px] w-[520px] rounded-full bg-indigo-400/20 blur-3xl" />
      </div>

      <Container className="relative py-14 sm:py-18 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div data-aos="fade-up">
            <Pill className="w-fit">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-zinc-900">
                <BadgeCheck className="h-4 w-4" />
              </span>
              One app, all journeys — OnWay
            </Pill>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="mt-5 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl"
            >
              Your everyday{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                mobility & delivery
              </span>{" "}
              super app.
            </motion.h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
              Book rides, travel in comfort, get food delivered, send parcels,
              and pay securely — all inside OnWay. Built for speed, safety, and
              reliability.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button as="link" href="#download" variant="accent">
                Download OnWay <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as="link" href="#services" variant="outline">
                Explore services
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  <MapPin className="h-4 w-4 text-yellow-500" />
                  Live tracking
                </div>
                <p className="mt-2 text-sm text-zinc-600">
                  Share ETA and track every step in real time.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  <Shield className="h-4 w-4 text-yellow-500" />
                  Safety-first
                </div>
                <p className="mt-2 text-sm text-zinc-600">
                  Trip checks, verified partners, and support.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  <BadgeCheck className="h-4 w-4 text-yellow-500" />
                  Trusted
                </div>
                <p className="mt-2 text-sm text-zinc-600">
                  Transparent pricing and reliable service.
                </p>
              </div>
            </div>
          </div>

          <div data-aos="fade-left" className="relative">
            <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
              {/* City Selection Header */}
              <div className="mb-6 flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span className="font-medium text-zinc-900">Bogra, BD</span>
                <button className="text-zinc-600 underline underline-offset-4 hover:text-zinc-900">
                  Change city
                </button>
              </div>

              {/* Main Heading */}
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-zinc-900 lg:text-5xl">
                Go anywhere with <br />
                OnWay
              </h2>

              {/* Pickup Timing Selector */}
              <div className="mt-6">
                <button className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-200">
                  <Clock className="h-4 w-4" />
                  Pickup now
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Location Inputs */}
              <div className="relative mt-6 space-y-2">
                {/* Visual Line connecting points */}
                <div className="absolute left-[1.125rem] top-8 bottom-8 w-0.5 bg-zinc-900" />
                
                <div className="relative flex items-center gap-4 rounded-lg bg-zinc-100 p-4 transition-all focus-within:ring-2 focus-within:ring-zinc-900">
                  <div className="z-10 flex h-3 w-3 items-center justify-center rounded-full bg-zinc-900">
                    <div className="h-1 w-1 rounded-full bg-white" />
                  </div>
                  <input
                    type="text"
                    placeholder="Pickup location"
                    className="w-full bg-transparent text-sm font-medium text-zinc-900 placeholder-zinc-500 outline-none"
                  />
                  <Navigation2 className="h-4 w-4 rotate-45 text-red-600" fill="currentColor" />
                </div>

                <div className="relative flex items-center gap-4 rounded-lg bg-zinc-100 p-4 transition-all focus-within:ring-2 focus-within:ring-zinc-900">
                  <div className="z-10 h-3 w-3 bg-zinc-900" />
                  <input
                    type="text"
                    placeholder="Dropoff location"
                    className="w-full bg-transparent text-sm font-medium text-zinc-900 placeholder-zinc-500 outline-none"
                  />
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Button className="rounded-lg px-8" variant="primary">
                  See prices
                </Button>
                <button className="text-sm font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600">
                  Log in to see your recent activity
                </button>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-10 -top-10 hidden h-36 w-36 rounded-full bg-yellow-400/30 blur-2xl lg:block" />
          </div>
        </div>
      </Container>
    </section>
  );
}


