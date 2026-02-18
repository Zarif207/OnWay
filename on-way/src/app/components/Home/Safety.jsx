"use client";

import { AlertTriangle, PhoneCall } from "lucide-react";
import Container from "./Container";
import SectionHeading from "./SectionHeading";
import { safetyFeatures } from "./homeData";
import { Button } from "./ui";

export default function Safety() {
  return (
    <section id="safety" className="bg-zinc-50 py-16 sm:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div data-aos="fade-up">
            <SectionHeading
              eyebrow="Every step of the way"
              title="Safety and support built into every trip"
              description="OnWay pairs smart safety features with responsive support so you can ride and travel with confidence."
            />

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as="link" href="#contact" variant="primary">
                Talk to support <PhoneCall className="h-4 w-4" />
              </Button>
              <Button as="link" href="#download" variant="outline">
                Download the app
              </Button>
            </div>

            <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-yellow-400/20 text-zinc-900">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Emergency-ready
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                    Use in-app SOS tools to quickly reach help and share your
                    location. (Configure your emergency contacts inside OnWay.)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4" data-aos="fade-up" data-aos-delay="80">
            {safetyFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-50 text-zinc-900">
                      <Icon className="h-6 w-6 text-yellow-500" />
                    </span>
                    <div>
                      <p className="text-base font-bold text-zinc-900">
                        {f.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                        {f.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}



