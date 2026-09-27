"use client";

import { motion } from "framer-motion";
import { Search, CalendarCheck, KeyRound, MapPin } from "lucide-react";

const STEPS = [
  { icon: Search, title: "Choose your car", desc: "Browse our verified fleet and pick the vehicle that fits your trip." },
  { icon: CalendarCheck, title: "Book instantly", desc: "Confirm your dates with a quick call — no paperwork, no waiting." },
  { icon: MapPin, title: "Doorstep delivery", desc: "We bring the car to you, fully fuelled, cleaned, and inspected." },
  { icon: KeyRound, title: "Drive away", desc: "Grab the keys and go. Return it the same way when you're done." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-black py-20 sm:py-28 border-y border-white/10">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-400">How it works</p>
          <h2 className="mt-4 text-[32px] leading-[1.05] font-bold uppercase tracking-tight text-white sm:text-[44px]">
            No queues. No paperwork.
          </h2>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-11 rounded-xl bg-gold-500/10 border border-gold-500/20">
                  <s.icon className="size-5 text-gold-400" />
                </div>
                <span className="text-[28px] font-semibold text-ink-4/40">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-ink-1">{s.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-3">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
