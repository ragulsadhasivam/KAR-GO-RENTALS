"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function FleetHero() {
  return (
    <section className="relative h-[92vh] min-h-[600px] overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero/kargo-hero-4k-two-cars.png"
          alt="The KAR GO RENTALS fleet"
          fill
          sizes="100vw"
          className="object-cover object-[center_35%]"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black via-black/10 to-black/60" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col justify-end px-5 pt-28 pb-12 sm:px-10 sm:pt-32 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <h2 className="text-[36px] leading-[1.02] font-bold uppercase tracking-tight text-white sm:text-[52px] lg:text-[62px]">
            Every trip, every car,
            <br />
            zero compromise.
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <a
              href="#fleet"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:border-white/60"
            >
              Discover more <ArrowRight className="size-3.5" />
            </a>
            <a href="#fleet" className="text-[13px] text-white/60 underline underline-offset-4 hover:text-white">
              Explore the full fleet
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
