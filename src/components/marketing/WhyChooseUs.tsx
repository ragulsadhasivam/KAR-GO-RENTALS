import { ShieldCheck, Wallet, Truck, Gauge, BadgeCheck, MessageCircle } from "lucide-react";
import { Reveal } from "./Reveal";

const FEATURES = [
  { icon: ShieldCheck, title: "Insured vehicles", desc: "Every rental car is covered by insurance." },
  { icon: Wallet, title: "Transparent pricing", desc: "Daily, extra-hour and extra-km rates are published on this page." },
  { icon: Truck, title: "Doorstep delivery", desc: "The car comes to you and is collected from you." },
  { icon: Gauge, title: "Well-maintained fleet", desc: "Routine servicing and inspections keep every car road-ready." },
  { icon: BadgeCheck, title: "Verified paperwork", desc: "RC, insurance and fitness certificates are kept current." },
  { icon: MessageCircle, title: "Reach us your way", desc: "Call or WhatsApp. A real person answers." },
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className="relative border-y border-white/10 bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
        <Reveal className="max-w-2xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold-400">Why KAR GO</p>
          <h2 className="mt-3 text-[32px] leading-[1.1] font-bold tracking-tight text-white sm:text-[44px]">
            Built around getting you moving.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-white/75">
            No queues, no paperwork pile-up. Every KAR GO car is inspected, sanitised and insured,
            then delivered to your doorstep.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <li key={f.title}>
              <Reveal delay={i * 0.05} className="h-full">
                <div className="h-full rounded-2xl border border-border-subtle bg-surface p-6">
                  <f.icon className="size-6 text-gold-400" strokeWidth={1.6} aria-hidden />
                  <h3 className="mt-4 text-[17px] font-semibold text-ink-1">{f.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-3">{f.desc}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
