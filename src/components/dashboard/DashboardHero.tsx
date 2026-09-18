"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatCurrency, vehicleName, cn } from "@/lib/utils";

interface HeroVehicle {
  vehicle: {
    id: string;
    make: string;
    model: string;
    registrationNumber: string;
    status: string;
    imageUrl?: string | null;
  };
  revenue: number;
  expenses: number;
  profit: number;
}

export function DashboardHero({ items }: { items: HeroVehicle[] }) {
  const [activeId, setActiveId] = useState(items[0]?.vehicle.id);
  const active = items.find((i) => i.vehicle.id === activeId) ?? items[0];

  if (!active) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border-subtle bg-gradient-to-br from-surface-2 via-surface to-base">
      {/* Single restrained showroom-spotlight — supports the vehicle photo rather than competing with it. */}
      <div className="pointer-events-none absolute top-1/2 right-[8%] size-[420px] -translate-y-1/2 rounded-full bg-gold-500/[0.07] blur-[110px]" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 p-6 sm:p-8">
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <StatusPill status={active.vehicle.status} />
              <span className="text-secondary font-mono">{active.vehicle.registrationNumber}</span>
            </div>
            <h2 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-ink-1 mb-1">
              {vehicleName(active.vehicle)}
            </h2>
            <Link
              href={`/cars/${active.vehicle.id}`}
              className="inline-flex items-center gap-1 text-[13px] text-gold-400 hover:text-gold-300 font-medium"
            >
              View vehicle details <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 max-w-md">
            <Stat label="This Month Revenue" value={active.revenue} />
            <Stat label="Expenses" value={active.expenses} />
            <Stat label="Profit" value={active.profit} tone={active.profit >= 0 ? "success" : "danger"} />
          </div>

          {items.length > 1 && (
            <div className="mt-8 flex gap-2">
              {items.map((item) => (
                <button
                  key={item.vehicle.id}
                  onClick={() => setActiveId(item.vehicle.id)}
                  className={cn(
                    "rounded-xl px-4 h-9 text-[13px] font-medium border transition-all",
                    item.vehicle.id === active.vehicle.id
                      ? "border-gold-500/40 bg-gold-500/10 text-gold-300"
                      : "border-border text-ink-3 hover:text-ink-1 hover:border-border-strong"
                  )}
                >
                  {item.vehicle.model}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex items-center justify-center min-h-[220px]">
          <div className="absolute inset-x-10 bottom-6 h-8 rounded-full bg-black/50 blur-xl" />
          {active.vehicle.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={active.vehicle.id}
              src={active.vehicle.imageUrl}
              alt={vehicleName(active.vehicle)}
              className="relative w-full max-w-[440px] h-auto object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.5)] animate-fade-in"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "success" | "danger" }) {
  return (
    <div>
      <p className="text-meta mb-1.5">{label}</p>
      <p
        className={cn(
          "text-figure text-[19px] sm:text-[21px] font-semibold",
          tone === "success" && "text-success-400",
          tone === "danger" && "text-danger-400",
          !tone && "text-ink-1"
        )}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}
