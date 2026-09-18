"use client";

import { useEffect, useState } from "react";
import {
  startOfToday,
  endOfToday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { IndianRupee, TrendingDown, TrendingUp, CalendarRange, Gauge, Fuel, Wrench } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { KPICard } from "@/components/ui/KPICard";
import { KPICardSkeleton } from "@/components/ui/Skeleton";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Input } from "@/components/ui/Field";
import { formatCurrency, cn, vehicleName } from "@/lib/utils";

type Preset = "today" | "week" | "month" | "lastMonth" | "custom";

const PRESETS: { value: Preset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
];

function getRange(preset: Preset, customStart: string, customEnd: string) {
  const now = new Date();
  switch (preset) {
    case "today":
      return { start: startOfToday(), end: endOfToday() };
    case "week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "lastMonth": {
      const last = subMonths(now, 1);
      return { start: startOfMonth(last), end: endOfMonth(last) };
    }
    case "custom":
      return {
        start: customStart ? new Date(customStart) : startOfMonth(now),
        end: customEnd ? new Date(customEnd) : endOfToday(),
      };
  }
}

export function ReportsPageClient({ vehicles }: { vehicles: any[] }) {
  const [preset, setPreset] = useState<Preset>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { start, end } = getRange(preset, customStart, customEnd);
    setLoading(true);
    const params = new URLSearchParams({ start: start.toISOString(), end: end.toISOString() });
    fetch(`/api/reports?${params}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [preset, customStart, customEnd]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title">Reports</h1>
        <p className="text-body mt-1.5">Business performance, calculated from your actual records.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl bg-surface-2 border border-border-subtle p-1">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={cn(
                "h-8 rounded-lg px-3 text-[12.5px] font-medium transition-colors",
                preset === p.value ? "bg-surface-3 text-ink-1" : "text-ink-4 hover:text-ink-2"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex items-center gap-2">
            <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="h-9" />
            <span className="text-ink-4">to</span>
            <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="h-9" />
          </div>
        )}
      </div>

      {loading || !data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard label="Revenue" value={formatCurrency(data.revenue)} icon={TrendingUp} tone="gold" />
            <KPICard label="Expenses" value={formatCurrency(data.expenses)} icon={TrendingDown} tone="blue" />
            <KPICard label="Profit" value={formatCurrency(data.profit)} icon={IndianRupee} tone="success" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Bookings" value={String(data.bookingsCount)} icon={CalendarRange} tone="neutral" />
            <KPICard label="Rental Days" value={String(data.rentalDays)} icon={Gauge} tone="neutral" />
            <KPICard label="Fuel Cost" value={formatCurrency(data.fuelCost)} icon={Fuel} tone="neutral" />
            <KPICard label="Service Cost" value={formatCurrency(data.serviceCost)} icon={Wrench} tone="neutral" />
          </div>

          <Card padding="md">
            <CardHeader>
              <CardTitle>Vehicle Performance & Profitability</CardTitle>
            </CardHeader>
            <Table>
              <THead>
                <tr>
                  <TH>Vehicle</TH>
                  <TH>Revenue</TH>
                  <TH>Expenses</TH>
                  <TH>Profit</TH>
                  <TH>Bookings</TH>
                  <TH>Rental Days</TH>
                  <TH>Utilisation</TH>
                </tr>
              </THead>
              <TBody>
                {data.vehiclePerformance.map((v: any) => (
                  <TR key={v.vehicle.id}>
                    <TD className="text-ink-1 font-medium">{vehicleName(v.vehicle)}</TD>
                    <TD>{formatCurrency(v.revenue)}</TD>
                    <TD>{formatCurrency(v.expenses)}</TD>
                    <TD className={v.profit >= 0 ? "text-success-400" : "text-danger-400"}>{formatCurrency(v.profit)}</TD>
                    <TD>{v.bookings}</TD>
                    <TD>{v.rentalDays}</TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-surface-3 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-gold-400 to-gold-600" style={{ width: `${v.utilisation}%` }} />
                        </div>
                        <span className="text-[12px] text-ink-3">{v.utilisation}%</span>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
