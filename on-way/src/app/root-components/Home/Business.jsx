"use client";

import { ArrowRight, Building2, Package } from "lucide-react";
import Container from "./Container";
import SectionHeading from "./SectionHeading";
import { Button } from "./ui";

export default function Business() {
  return (
    <section id="business" className="bg-zinc-50 py-16 sm:py-20">
      <Container>
        <div className="grid gap-8 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8" data-aos="fade-up">
            <SectionHeading
              eyebrow="OnWay for Business"
              title="Trusted & reliable delivery for your business"
              description="From same-day parcel delivery to scheduled pickups — OnWay helps you move items fast with tracking, proof of delivery, and dedicated support."
            />

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button as="link" href="#contact" variant="accent">
                Explore Business <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as="link" href="#services" variant="outline">
                See OnWay Parcel
              </Button>
            </div>
          </div>

          <div
            className="grid gap-4 sm:grid-cols-2 lg:col-span-4"
            data-aos="fade-up"
            data-aos-delay="80"
          >
            <div className="rounded-3xl bg-linear-to-br from-primary/20 to-orange-500/20 p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/70 text-zinc-900">
                  <Package className="h-6 w-6" />
                </span>
                <p className="text-sm font-bold text-zinc-900">Courier</p>
              </div>
              <p className="mt-3 text-sm text-zinc-700">
                Same-day, on-demand parcel delivery with tracking.
              </p>
            </div>
            <div className="rounded-3xl bg-linear-to-br from-indigo-500/15 to-sky-500/15 p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/70 text-zinc-900">
                  <Building2 className="h-6 w-6" />
                </span>
                <p className="text-sm font-bold text-zinc-900">Enterprise</p>
              </div>
              <p className="mt-3 text-sm text-zinc-700">
                Custom SLAs, invoicing, and account-level reporting.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}



