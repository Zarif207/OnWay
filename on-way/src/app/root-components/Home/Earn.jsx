"use client";

import { ArrowRight, Bike, Car, Package, Store } from "lucide-react";
import Container from "./Container";
import SectionHeading from "./SectionHeading";

const roles = [
  {
    title: "Become a Rider",
    description: "Earn flexibly with quick bike trips and transparent payouts.",
    icon: Bike,
  },
  {
    title: "Become a Driver",
    description: "Drive with comfort-focused car trips and schedule options.",
    icon: Car,
  },
];

export default function Earn() {
  return (
    <section id="earn" className="bg-white py-16 sm:py-20">
      <Container>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div data-aos="fade-up">
            <SectionHeading
              eyebrow="Earn with OnWay"
              title="Turn time into income"
              description="Join OnWay as a rider or driver. Tools, support, and steady demand — designed for real people."
            />
          </div>
          <div data-aos="fade-up" data-aos-delay="60">
            <button as="link" href="#contact" variant="accent" className="flex items-center gap-2">
              Start earning <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.title}
                className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                data-aos="fade-up"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/20 text-zinc-900">
                  <Icon className="h-6 w-6 text-primary" />
                </span>
                <p className="mt-4 text-base font-bold text-zinc-900">
                  {r.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {r.description}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  Learn more <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}



