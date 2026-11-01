import { MapPin, MessageCircle, Phone } from "lucide-react";
import { BOOKING_PHONE_DISPLAY, BOOKING_TEL_HREF, WHATSAPP_GENERAL_HREF } from "./bookingPhone";
import { Reveal } from "./Reveal";

export function CTASection({ city, mapsHref }: { city: string; mapsHref: string }) {
  return (
    <section id="contact" className="relative border-t border-white/10 bg-black py-20 sm:py-28">
      <Reveal className="mx-auto max-w-[1600px] px-5 text-center sm:px-10">
        <h2 className="text-[34px] leading-[1.1] font-bold tracking-tight text-white sm:text-[56px]">
          Ready for the <span className="text-gold-400">open road?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[16px] text-white/75">
          Call or message us and we&apos;ll have a car ready at your doorstep in {city}.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={BOOKING_TEL_HREF}
            className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-[16px] font-semibold text-black transition-colors hover:bg-gold-400"
          >
            <Phone className="size-4" /> {BOOKING_PHONE_DISPLAY}
          </a>
          <a
            href={WHATSAPP_GENERAL_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/35 px-7 py-3.5 text-[16px] font-medium text-white transition-colors hover:border-white/70"
          >
            <MessageCircle className="size-4" /> WhatsApp
          </a>
        </div>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 text-[14px] text-white/75 underline underline-offset-4 hover:text-white"
        >
          <MapPin className="size-4" /> Find us on Google Maps
        </a>
      </Reveal>
    </section>
  );
}
