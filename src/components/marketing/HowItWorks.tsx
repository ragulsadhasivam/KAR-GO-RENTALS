import { Search, CalendarCheck, KeyRound, MapPin } from "lucide-react";
import { Reveal } from "./Reveal";

const STEPS = [
  { icon: Search, title: "Choose your car", desc: "Pick the vehicle that fits your trip from the fleet above." },
  { icon: CalendarCheck, title: "Book by call or WhatsApp", desc: "Share your dates and we confirm availability. No counter, no queue." },
  { icon: MapPin, title: "Doorstep delivery", desc: "We bring the car to you, cleaned, fuelled and inspected." },
  { icon: KeyRound, title: "Drive away", desc: "Take the keys and go. We collect the car the same way when you're done." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
        <Reveal className="max-w-xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold-400">How it works</p>
          <h2 className="mt-3 text-[32px] leading-[1.1] font-bold tracking-tight text-white sm:text-[44px]">
            Four steps to the road.
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Reveal delay={i * 0.06}>
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl border border-gold-500/25 bg-gold-500/10">
                    <s.icon className="size-5 text-gold-400" aria-hidden />
                  </div>
                  <span aria-hidden className="text-[28px] font-semibold text-white/25">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 text-[17px] font-semibold text-ink-1">{s.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-3">{s.desc}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
