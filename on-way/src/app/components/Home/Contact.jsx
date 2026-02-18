"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, Mail, MessageSquare, Phone } from "lucide-react";
import Container from "./Container";
import SectionHeading from "./SectionHeading";
import { Button } from "./ui";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const defaultValues = useMemo(
    () => ({ name: "", email: "", topic: "General", message: "" }),
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues, mode: "onTouched" });

  const onSubmit = async (values) => {
    // Demo submission — wire this to your API later
    await new Promise((r) => setTimeout(r, 650));
    setSubmitted(true);
    reset(defaultValues);
    setTimeout(() => setSubmitted(false), 4500);
    // eslint-disable-next-line no-console
    console.log("OnWay contact form:", values);
  };

  return (
    <section id="contact" className="bg-zinc-50 py-16 sm:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div data-aos="fade-up">
            <SectionHeading
              eyebrow="Help & support"
              title="Send a message"
              description="Got questions about OnWay? Reach out — we’ll get back with the right help."
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-zinc-200 bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  <Phone className="h-4 w-4 text-yellow-500" />
                  Helpline
                </div>
                <p className="mt-2 text-sm text-zinc-600">+1 (555) 010‑010</p>
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  <Mail className="h-4 w-4 text-yellow-500" />
                  Email
                </div>
                <p className="mt-2 text-sm text-zinc-600">support@onway.app</p>
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  <MessageSquare className="h-4 w-4 text-yellow-500" />
                  Live chat
                </div>
                <p className="mt-2 text-sm text-zinc-600">In-app, 24/7</p>
              </div>
            </div>
          </div>

          <div
            className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
            data-aos="fade-up"
            data-aos-delay="80"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-zinc-900">
                    Full name
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
                    placeholder="Your name"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name ? (
                    <p className="mt-1 text-xs font-semibold text-rose-600">
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-900">
                    Email
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
                    placeholder="you@company.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email",
                      },
                    })}
                  />
                  {errors.email ? (
                    <p className="mt-1 text-xs font-semibold text-rose-600">
                      {errors.email.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  Topic
                </label>
                <select
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
                  {...register("topic")}
                >
                  <option>General</option>
                  <option>Rides</option>
                  <option>Food</option>
                  <option>Parcel</option>
                  <option>Payments</option>
                  <option>Partnership</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  Message
                </label>
                <textarea
                  className="mt-2 min-h-[120px] w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
                  placeholder="How can we help?"
                  {...register("message", {
                    required: "Message is required",
                    minLength: { value: 10, message: "Write a bit more detail" },
                  })}
                />
                {errors.message ? (
                  <p className="mt-1 text-xs font-semibold text-rose-600">
                    {errors.message.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="accent"
                  className="w-full sm:w-auto"
                  as="button"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send message"}
                </Button>

                {submitted ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Message sent — we’ll reply soon.
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-zinc-500">
                    By sending, you agree to our support terms.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}


