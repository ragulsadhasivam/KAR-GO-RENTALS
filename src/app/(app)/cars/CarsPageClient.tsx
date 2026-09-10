"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Car as CarIcon, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { VehicleFormModal } from "@/components/vehicles/VehicleFormModal";
import { formatCurrency, vehicleName } from "@/lib/utils";

interface VehicleRow {
  vehicle: any;
  revenue: number;
  expenses: number;
  profit: number;
  bookingsCount: number;
}

export function CarsPageClient({ vehicles }: { vehicles: VehicleRow[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title">Fleet</h1>
          <p className="text-body mt-1.5">All vehicles in your rental fleet.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicles.map(({ vehicle, revenue, expenses, profit, bookingsCount }) => (
          <Link key={vehicle.id} href={`/cars/${vehicle.id}`}>
            <Card className="group h-full transition-all duration-200 hover:border-gold-500/30 hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="text-card-title">{vehicleName(vehicle)}</h3>
                  <p className="text-secondary font-mono">{vehicle.registrationNumber}</p>
                </div>
                <StatusPill status={vehicle.status} size="sm" />
              </div>

              <div className="relative h-36 my-3 rounded-xl bg-gradient-to-b from-surface-3/60 to-surface-2/20 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-x-8 bottom-3 h-6 rounded-full bg-black/40 blur-lg" />
                {vehicle.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vehicle.imageUrl}
                    alt={vehicleName(vehicle)}
                    className="relative h-full w-auto object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                ) : (
                  <CarIcon className="relative size-12 text-ink-4" />
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center border-t border-border-subtle pt-3">
                <div>
                  <p className="text-meta mb-1">Revenue</p>
                  <p className="text-figure text-[13.5px] font-semibold text-ink-1">{formatCurrency(revenue)}</p>
                </div>
                <div>
                  <p className="text-meta mb-1">Expenses</p>
                  <p className="text-figure text-[13.5px] font-semibold text-ink-1">{formatCurrency(expenses)}</p>
                </div>
                <div>
                  <p className="text-meta mb-1">Profit</p>
                  <p className={`text-figure text-[13.5px] font-semibold ${profit >= 0 ? "text-success-400" : "text-danger-400"}`}>
                    {formatCurrency(profit)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-4 border-t border-border-subtle pt-3">
                <CalendarClock className="size-3.5" />
                <span>
                  {bookingsCount} booking{bookingsCount === 1 ? "" : "s"} all time
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <VehicleFormModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
