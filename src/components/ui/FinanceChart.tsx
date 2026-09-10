"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Range = "7d" | "30d" | "3m";

const RANGE_LABELS: Record<Range, string> = { "7d": "7D", "30d": "30D", "3m": "3M" };

export function FinanceChart({ vehicleId, defaultRange = "30d" }: { vehicleId?: string; defaultRange?: Range }) {
  const [range, setRange] = useState<Range>(defaultRange);
  const [data, setData] = useState<{ date: string; revenue: number; expenses: number; profit: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ range });
    if (vehicleId) params.set("vehicleId", vehicleId);
    fetch(`/api/finance/timeseries?${params}`)
      .then((r) => r.json())
      .then((d) => setData(d.data ?? []))
      .finally(() => setLoading(false));
  }, [range, vehicleId]);

  return (
    <div>
      <div className="flex items-center justify-end gap-1 mb-4">
        {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "h-7 rounded-lg px-3 text-[12px] font-medium transition-colors",
              range === r ? "bg-surface-3 text-ink-1" : "text-ink-4 hover:text-ink-2"
            )}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="h-[260px] w-full">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-surface-2" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-gold-400)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-gold-400)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-blue-400)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-blue-400)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border-subtle)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--color-ink-4)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                stroke="var(--color-ink-4)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(24,24,30,0.95)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--color-ink-2)" }}
                formatter={(value, name) => [formatCurrency(Number(value ?? 0)), String(name)]}
              />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-gold-400)" strokeWidth={2} fill="url(#revenueGrad)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="var(--color-blue-400)" strokeWidth={2} fill="url(#expenseGrad)" />
              <Area type="monotone" dataKey="profit" name="Profit" stroke="var(--color-success-500)" strokeWidth={2} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
