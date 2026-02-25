"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Container from "./Container";
import { stats } from "./homeData";

function formatNumber(n) {
  return new Intl.NumberFormat(undefined).format(Math.round(n));
}

export default function Stats() {
  const wrapperRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || hasAnimated) return;

    const numbers = Array.from(el.querySelectorAll("[data-stat-value]"));
    if (numbers.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;

        setHasAnimated(true);
        numbers.forEach((node) => {
          const target = Number(node.getAttribute("data-stat-value") ?? "0");
          const suffix = node.getAttribute("data-stat-suffix") ?? "";
          const obj = { v: 0 };

          gsap.to(obj, {
            v: target,
            duration: 1.25,
            ease: "power2.out",
            onUpdate: () => {
              node.textContent = `${formatNumber(obj.v)}${suffix}`;
            },
          });
        });

        obs.disconnect();
      },
      { threshold: 0.35 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [hasAnimated]);

  return (
    <section className="bg-white" aria-label="OnWay stats">
      <Container>
        <div
          ref={wrapperRef}
          className="grid gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8 lg:grid-cols-4"
          data-aos="fade-up"
        >
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-zinc-50 p-5">
              <p
                className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl"
                data-stat-value={s.value}
                data-stat-suffix={s.suffix ?? ""}
              >
                0{s.suffix ?? ""}
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-600">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}



