"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Wallet, HeadphonesIcon, Gauge, BadgeCheck, Clock3 } from "lucide-react";

const FEATURES = [
  { icon: ShieldCheck, title: "Fully insured", desc: "Every rental is backed by comprehensive insurance coverage." },
  { icon: Wallet, title: "Transparent pricing", desc: "The price you see is the price you pay — no hidden charges." },
  { icon: HeadphonesIcon, title: "24/7 support", desc: "Real humans on the phone, whenever you need help." },
  { icon: Gauge, title: "Well-maintained fleet", desc: "Routine servicing and inspections keep every car road-ready." },
  { icon: BadgeCheck, title: "Verified vehicles", desc: "RC, insurance, and fitness certificates kept current — always." },
  { icon: Clock3, title: "Flexible durations", desc: "Rent by the day, week, or month — plans that fit your trip." },
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className="relative bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-600">The Guarantee</p>
          <h2 className="mt-4 text-[32px] leading-[1.05] font-bold uppercase tracking-tight text-black sm:text-[44px]">
            Nothing left to chance.
          </h2>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="border-t border-black/10 pt-5"
            >
              <f.icon className="size-5 text-black/70" strokeWidth={1.5} />
              <h3 className="mt-4 text-[15px] font-semibold text-black">{f.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-black/55">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
