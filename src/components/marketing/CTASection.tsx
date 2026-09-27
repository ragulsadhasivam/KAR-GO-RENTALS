"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { BOOKING_TEL_HREF } from "./bookingPhone";

export function CTASection() {
  return (
    <section id="contact" className="relative bg-black py-24 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-[1600px] px-5 sm:px-10 text-center"
      >
        <h2 className="text-[36px] leading-[1.02] font-bold uppercase tracking-tight text-white sm:text-[64px]">
          Ready for the
          <br />
          <span className="text-gold-400">open road?</span>
        </h2>
        <p className="mt-5 max-w-lg mx-auto text-[15px] text-white/55">
          Give us a call to book — we&apos;ll have a car ready at your doorstep.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            href={BOOKING_TEL_HREF}
            className="inline-flex items-center gap-2 justify-center rounded-full bg-gold-500 px-6 py-3 text-[13.5px] font-semibold text-black transition-colors hover:bg-gold-400"
          >
            <Phone className="size-4" /> Make a call and book
          </a>
        </div>
      </motion.div>
    </section>
  );
}
