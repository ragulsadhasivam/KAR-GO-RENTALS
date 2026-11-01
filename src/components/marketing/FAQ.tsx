import { ChevronDown } from "lucide-react";
import { Reveal } from "./Reveal";
import { FAQ_ITEMS } from "./faq";

export function FAQ() {
  return (
    <section id="faq" className="relative bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-10">
        <Reveal>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold-400">FAQ</p>
          <h2 className="mt-3 text-[32px] leading-[1.1] font-bold tracking-tight text-white sm:text-[44px]">
            Questions, answered.
          </h2>
        </Reveal>
        <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-medium text-ink-1 [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown className="size-5 shrink-0 text-ink-3 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="pb-5 text-[16px] leading-relaxed text-white/75">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
