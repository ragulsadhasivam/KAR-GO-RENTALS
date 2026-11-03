import { formatCurrency } from "@/lib/utils";
import { Reveal } from "./Reveal";
import type { FleetVehicle } from "./FleetShowcase";

const DEFAULT_RULES = [
  "Rates are per day. Kilometres beyond the agreed limit are charged extra, as shown.",
  "Kilometres beyond the agreed limit or billed per extra km at the rate shown.",
  "Keep a valid driving licence and a government ID ready at handover.",
  "Deposit, km limit, fuel policy and cancellation are confirmed with you before you pay. Just ask.",
];

export function RatesAndRules({
  vehicles,
  rentalTerms,
}: {
  vehicles: FleetVehicle[];
  rentalTerms: string | null;
}) {
  const priced = vehicles.filter((v) => v.dailyRate != null);
  const custom = (rentalTerms ?? "")
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s\-•*\d.)]+/, "").trim())
    .filter(Boolean);
  const rules = custom.length > 0 ? custom : DEFAULT_RULES;

  return (
    <section id="rates" className="relative border-y border-white/10 bg-black py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 sm:px-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold-400">Rates</p>
          <h2 className="mt-3 text-[32px] leading-[1.1] font-bold tracking-tight text-white sm:text-[44px]">
            Clear rates, no surprises.
          </h2>
          {priced.length > 0 && (
            <div className="mt-8 overflow-x-auto rounded-2xl border border-border-subtle">
              <table className="w-full text-left text-[14px] sm:text-[15px]">
                <caption className="sr-only">Rental rates per car</caption>
                <thead className="bg-surface text-[13px] text-ink-3">
                  <tr>
                    <th scope="col" className="px-3 py-3 font-medium sm:px-4">Car</th>
                    <th scope="col" className="px-3 py-3 font-medium sm:px-4">Per day</th>
                    <th scope="col" className="px-3 py-3 font-medium sm:px-4">Extra km</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {priced.map((v) => (
                    <tr key={v.id}>
                      <th scope="row" className="px-3 py-4 font-semibold text-ink-1 sm:px-4">
                        {v.make} {v.model}
                      </th>
                      <td className="px-3 py-4 font-semibold text-gold-300 sm:px-4">{formatCurrency(v.dailyRate!)}</td>
                      <td className="px-3 py-4 text-ink-2 sm:px-4">
                        {v.extraKmRate != null ? formatCurrency(v.extraKmRate) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Reveal>

        <Reveal delay={0.08}>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold-400">Good to know</p>
          <h2 className="mt-3 text-[32px] leading-[1.1] font-bold tracking-tight text-white sm:text-[44px]">
            Rental rules.
          </h2>
          <ul className="mt-8 space-y-4">
            {rules.map((r) => (
              <li key={r} className="flex gap-3 text-[16px] leading-relaxed text-white/80">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold-400" />
                {r}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
