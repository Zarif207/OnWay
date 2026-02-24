"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Container from "./Container";
import SectionHeading from "./SectionHeading";
import { services } from "./homeData";

export default function Platform() {
  const initial = services[0]?.key ?? "ride";
  const [active, setActive] = useState(initial);

  const current = useMemo(
    () => services.find((s) => s.key === active) ?? services[0],
    [active]
  );

  const Icon = current?.icon;

  return (
    <section id="services" className="bg-white py-16 sm:py-20">
      <Container>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div data-aos="fade-up">
            <SectionHeading
              eyebrow="The OnWay platform"
              title="Everything you need, right in your pocket"
              description="Ride, travel, and pay — OnWay brings everyday mobility services together with a consistent experience across mobile and web."
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:w-[520px] lg:justify-end">
            {services.map((s) => {
              const ActiveIcon = s.icon;
              const isActive = s.key === active;
              return (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className={`group inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                  }`}
                  aria-pressed={isActive}
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-xl ${
                      isActive ? "bg-white/10" : "bg-zinc-100"
                    }`}
                  >
                    <ActiveIcon
                      className={`h-4 w-4 ${
                        isActive ? "text-yellow-300" : "text-zinc-700"
                      }`}
                    />
                  </span>
                  {s.name.replace("OnWay ", "")}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <div
            className="lg:col-span-7"
            data-aos="fade-up"
            data-aos-delay="50"
          >
            <div
              className={`relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br ${current.accent} p-8`}
            >
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/30 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/70 text-zinc-900 shadow-sm">
                    {Icon ? <Icon className="h-6 w-6" /> : null}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-700">
                      {current.name}
                    </p>
                    <h3 className="text-2xl font-bold tracking-tight text-zinc-900">
                      {current.tagline}
                    </h3>
                  </div>
                </div>

                <ul className="mt-7 space-y-3">
                  {current.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-zinc-800">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-zinc-900" />
                      <span className="text-sm leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button as="link" href={current.cta.href} variant="primary">
                    {current.cta.label} <ArrowRight className="h-4 w-4" />
                  </button>
                  <button as="link" href="#download" variant="outline">
                    Get the app
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="lg:col-span-5"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="h-full rounded-3xl border border-zinc-200 bg-white p-8">
              <p className="text-sm font-semibold text-zinc-700">
                Why users choose OnWay
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
                Consistent quality across every service
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                Whether it’s a quick ride, a family trip, or a budget-friendly
                CNG commute — OnWay keeps the experience simple, fast, and
                dependable.
              </p>

              <div className="mt-7 grid gap-3">
                {[
                  "Upfront, transparent pricing",
                  "Support that actually helps",
                  "In-app tracking and receipts",
                  "Rewards and wallet benefits",
                ].map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-4"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-400/20 text-zinc-900">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-semibold text-zinc-800">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}



