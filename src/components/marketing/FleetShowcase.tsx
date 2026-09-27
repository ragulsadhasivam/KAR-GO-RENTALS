"use client";

import { motion } from "framer-motion";
import { Car as CarIcon, Fuel } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export type FleetVehicle = {
  id: string;
  make: string;
  model: string;
  variant: string | null;
  fuelType: string;
  imageUrl: string | null;
  dailyRate: number | null;
};

export function FleetShowcase({ vehicles }: { vehicles: FleetVehicle[] }) {
  if (vehicles.length === 0) return null;

  return (
    <section id="fleet" className="relative bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-400">Our Fleet</p>
          <h2 className="mt-4 text-[32px] leading-[1.05] font-bold uppercase tracking-tight text-white sm:text-[44px]">
            Pick your ride.
          </h2>
          <p className="mt-3 text-[15px] text-white/55">
            Every vehicle is inspected, sanitised, and fully insured before it reaches you.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group rounded-2xl border border-border-subtle bg-surface p-5 hover:border-gold-500/30 transition-colors"
            >
              <div className="relative h-40 rounded-xl bg-gradient-to-b from-surface-3/60 to-surface-2/20 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-x-8 bottom-3 h-6 rounded-full bg-black/40 blur-lg" />
                {v.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.imageUrl}
                    alt={`${v.make} ${v.model}`}
                    className="relative h-full w-auto object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-[1.05]"
                  />
                ) : (
                  <CarIcon className="relative size-12 text-ink-4" />
                )}
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-ink-1">
                    {v.make} {v.model}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-[11.5px] text-ink-4 shrink-0">
                  <Fuel className="size-3.5" /> {v.fuelType}
                </span>
              </div>

              {v.dailyRate != null && (
                <div className="mt-4 pt-4 border-t border-border-subtle flex items-baseline justify-between">
                  <span className="text-[12px] text-ink-4">Starting at</span>
                  <span className="text-[16px] font-semibold text-gold-300">
                    {formatCurrency(v.dailyRate)}
                    <span className="text-[12px] font-normal text-ink-4">/day</span>
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
