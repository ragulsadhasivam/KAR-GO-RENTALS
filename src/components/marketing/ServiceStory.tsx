"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { BOOKING_TEL_HREF } from "./bookingPhone";

export function ServiceStory() {
  return (
    <section className="relative bg-black py-20 sm:py-28">
      <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-5 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-400">Why KAR GO</p>
          <h2 className="mt-4 text-[32px] leading-[1.05] font-bold uppercase tracking-tight text-white sm:text-[44px]">
            Built around one thing —
            <br />
            getting you moving.
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/60">
            No queues, no paperwork, no waiting at a counter. Every KAR GO vehicle is inspected,
            sanitised, and fully insured, then delivered straight to your doorstep — so the only
            thing left to do is drive.
          </p>
          <a
            href={BOOKING_TEL_HREF}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:border-white/60"
          >
            <Phone className="size-3.5" /> Call to book your ride
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10"
        >
          <Image
            src="/hero/baleno-header.png"
            alt="Maruti Suzuki Baleno — KAR GO RENTALS"
            fill
            sizes="(min-width: 1024px) 700px, 100vw"
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
