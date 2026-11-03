"use client";

import Image from "next/image";
import { Car as CarIcon, Fuel, MessageCircle, Phone, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { BOOKING_TEL_HREF, whatsappCarHref } from "./bookingPhone";
import { Reveal } from "./Reveal";

export type FleetVehicle = {
  id: string;
  make: string;
  model: string;
  variant: string | null;
  fuelType: string;
  imageUrl: string | null;
  dailyRate: number | null;
  extraHourRate: number | null;
  extraKmRate: number | null;
};

// Seat counts aren't stored per vehicle; known models only.
const SEATS: Record<string, number> = { baleno: 5, ertiga: 7, "innova crysta": 7, victoris: 5, virtus: 5, venue: 5 };

function seatsFor(model: string) {
  return SEATS[model.trim().toLowerCase()] ?? null;
}

export function FleetShowcase({ vehicles }: { vehicles: FleetVehicle[] }) {
  if (vehicles.length === 0) return null;

  return (
    <section id="fleet" className="relative bg-black pb-20 sm:pb-28">
      <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
        <Image
          src="/hero/kargo-fleet.jpg"
          alt="Maruti Suzuki Baleno and Ertiga from the KAR GO RENTALS fleet"
          fill
          sizes="100vw"
          className="object-cover object-[center_62%]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
        <Reveal className="max-w-xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold-400">Our fleet</p>
          <h2 className="mt-3 text-[32px] leading-[1.1] font-bold tracking-tight text-white sm:text-[44px]">
            Pick your ride.
          </h2>
          <p className="mt-3 text-[16px] text-white/75">
            Every vehicle is inspected, sanitised and insured before it reaches you.
          </p>
        </Reveal>

        <div
          className={`mt-10 grid gap-5 sm:grid-cols-2 ${vehicles.length >= 3 ? "lg:grid-cols-3" : "mx-auto max-w-4xl"}`}
        >
          {vehicles.map((v, i) => {
            const name = `${v.make} ${v.model}`;
            const seats = seatsFor(v.model);
            const local = v.imageUrl?.startsWith("/vehicles/");
            return (
              <Reveal key={v.id} delay={i * 0.05}>
                <article className="group h-full rounded-2xl border border-border-subtle bg-surface p-5 transition-colors hover:border-gold-500/40">
                  <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-surface-3/60 to-surface-2/20">
                    <div className="absolute inset-x-8 bottom-3 h-6 rounded-full bg-black/40 blur-lg" />
                    {v.imageUrl && local ? (
                      <Image
                        src={v.imageUrl}
                        alt={name}
                        width={480}
                        height={320}
                        sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
                        className="relative h-full w-auto object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    ) : v.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={v.imageUrl}
                        alt={name}
                        loading="lazy"
                        className="relative h-full w-auto object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,0.45)]"
                      />
                    ) : (
                      <CarIcon className="relative size-12 text-ink-4" />
                    )}
                  </div>

                  <h3 className="mt-5 text-[18px] font-semibold text-ink-1">{name}</h3>
                  <div className="mt-2 flex flex-wrap gap-2 text-[13px] text-ink-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle px-2.5 py-1">
                      <Fuel className="size-3.5" /> {v.fuelType}
                    </span>
                    {seats && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle px-2.5 py-1">
                        <Users className="size-3.5" /> {seats} seats
                      </span>
                    )}
                  </div>

                  {v.dailyRate != null && (
                    <div className="mt-5 border-t border-border-subtle pt-4">
                      <p className="text-[26px] font-semibold text-gold-300">
                        {formatCurrency(v.dailyRate)}
                        <span className="text-[14px] font-normal text-ink-3"> / day</span>
                      </p>
                      {(v.extraHourRate != null || v.extraKmRate != null) && (
                        <p className="mt-1 text-[13px] text-ink-3">
                          {v.extraHourRate != null && <>Extra hour {formatCurrency(v.extraHourRate)}</>}
                          {v.extraHourRate != null && v.extraKmRate != null && " · "}
                          {v.extraKmRate != null && <>Extra km {formatCurrency(v.extraKmRate)}</>}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <a
                      href={whatsappCarHref(name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 px-4 py-2.5 text-[14px] font-semibold text-black transition-colors hover:bg-gold-400"
                    >
                      <MessageCircle className="size-4" /> Book
                    </a>
                    <a
                      href={BOOKING_TEL_HREF}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/30 px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:border-white/60"
                    >
                      <Phone className="size-4" /> Call
                    </a>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
