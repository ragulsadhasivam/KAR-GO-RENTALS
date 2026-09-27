"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Wallet, Truck, Star } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, title: "Best price guaranteed", desc: "Transparent daily rates, zero hidden fees." },
  { icon: Truck, title: "Doorstep delivery", desc: "Your car arrives fuelled, cleaned, and ready." },
  { icon: Wallet, title: "No hidden charges", desc: "The price you see is exactly what you pay." },
  { icon: Star, title: "4.8★ rated service", desc: "Trusted by over a thousand renters." },
];

export function TrustStrip() {
  return (
    <section className="relative border-b border-white/10 bg-black">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-10 py-8 sm:py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-start gap-3"
            >
              <div className="flex items-center justify-center size-9 rounded-lg bg-gold-500/10 border border-gold-500/20 shrink-0">
                <item.icon className="size-4 text-gold-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-ink-1">{item.title}</p>
                <p className="text-[12px] text-ink-4 mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
