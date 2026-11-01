"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { BOOKING_TEL_HREF, WHATSAPP_GENERAL_HREF } from "./bookingPhone";

// Text and car never share pixels: on phones the car sits below the copy,
// on wide screens it fills the right 82% and the copy owns the left column.
export function Hero({ city }: { city: string }) {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-black pt-24 pb-20 sm:pb-0 xl:block xl:h-screen xl:min-h-[680px] xl:pt-0"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 sm:px-10 xl:flex xl:h-full xl:items-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl xl:max-w-[520px]"
        >
          <p className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.22em] text-gold-400">
            Self&#8209;drive rentals · {city}
          </p>
          <h1 className="mt-4 text-[40px] leading-[1.04] font-bold tracking-tight text-white sm:text-[56px] xl:text-[60px] 2xl:text-[68px]">
            Self-drive cars in <span className="text-gold-400">{city}</span>, booked in minutes.
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/80">
            Insured, inspected cars delivered to your door. Daily, extra-hour and extra-km rates are
            listed openly below.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={BOOKING_TEL_HREF}
              className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-[15px] font-semibold text-black transition-colors hover:bg-gold-400"
            >
              <Phone className="size-4" /> Call to book
            </a>
            <a
              href={WHATSAPP_GENERAL_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/35 px-6 py-3 text-[15px] font-medium text-white transition-colors hover:border-white/70"
            >
              <MessageCircle className="size-4" /> WhatsApp us
            </a>
          </div>
          <a
            href="#fleet"
            className="mt-5 inline-flex items-center gap-1.5 text-[14px] text-white/75 underline underline-offset-4 hover:text-white"
          >
            See cars and rates <ArrowRight className="size-3.5" />
          </a>
        </motion.div>
      </div>

      <div className="relative order-2 mt-auto aspect-video w-full xl:absolute xl:bottom-0 xl:right-0 xl:mt-0 xl:w-[82%]">
        <Image
          src="/hero/kargo-hero.jpg"
          alt="White Maruti Suzuki Baleno available for self-drive rental from KAR GO RENTALS"
          fill
          priority
          sizes="(min-width: 1280px) 82vw, 100vw"
          className="object-cover object-right"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-black to-transparent xl:block" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
    </section>
  );
}
