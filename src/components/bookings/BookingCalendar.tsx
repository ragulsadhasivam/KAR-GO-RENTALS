"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { cn, vehicleName } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type ViewMode = "day" | "week" | "month";

const STATUS_DOT: Record<string, string> = {
  BOOKED: "bg-warning-500",
  ACTIVE: "bg-blue-500",
  RETURNED: "bg-ink-4",
};

/** Bookings no longer carry a known returnAt up front — a booking occupies
 * its vehicle from pickup until its actual (RETURNED) return, or up to now
 * if still open. Used everywhere the calendar needs an end boundary. */
function effectiveEnd(b: any) {
  return b.status === "RETURNED" && b.vehicleReturn ? new Date(b.vehicleReturn.returnAt) : new Date();
}

export function BookingCalendar({ vehicles, bookings }: { vehicles: any[]; bookings: any[] }) {
  const [view, setView] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(new Date());

  function navigate(dir: 1 | -1) {
    if (view === "day") setAnchor((d) => addDays(d, dir));
    else if (view === "week") setAnchor((d) => addWeeks(d, dir));
    else setAnchor((d) => addMonths(d, dir));
  }

  const days = useMemo(() => {
    if (view === "day") return [anchor];
    if (view === "week") {
      const start = startOfWeek(anchor, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
    const arr: Date[] = [];
    let cur = start;
    while (cur <= end) {
      arr.push(cur);
      cur = addDays(cur, 1);
    }
    return arr;
  }, [view, anchor]);

  function bookingsForVehicleAndDay(vehicleId: string, day: Date) {
    return bookings.filter((b) => b.vehicleId === vehicleId && new Date(b.pickupAt) <= endOfDay(day) && effectiveEnd(b) >= startOfDay(day));
  }

  const label =
    view === "day"
      ? format(anchor, "dd MMMM yyyy")
      : view === "week"
      ? `${format(days[0], "dd MMM")} — ${format(days[6], "dd MMM yyyy")}`
      : format(anchor, "MMMM yyyy");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAnchor(new Date())}>
            Today
          </Button>
          <span className="text-[14px] font-medium text-ink-1 ml-2">{label}</span>
        </div>
        <div className="flex gap-1 rounded-xl bg-surface-2 border border-border-subtle p-1">
          {(["day", "week", "month"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "h-7 rounded-lg px-3 text-[12px] font-medium capitalize transition-colors",
                view === v ? "bg-surface-3 text-ink-1" : "text-ink-4 hover:text-ink-2"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <MonthGrid days={days} anchor={anchor} bookings={bookings} vehicles={vehicles} />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface overflow-x-auto">
          <div
            className="grid min-w-[640px]"
            style={{ gridTemplateColumns: `140px repeat(${days.length}, minmax(120px, 1fr))` }}
          >
            <div className="sticky left-0 bg-surface-2/60 border-b border-r border-border-subtle p-3">
              <span className="text-meta">Vehicle</span>
            </div>
            {days.map((day) => (
              <div key={day.toISOString()} className="border-b border-border-subtle p-3 text-center">
                <p className="text-meta">{format(day, "EEE")}</p>
                <p className={cn("text-[13px] font-semibold mt-0.5", isSameDay(day, new Date()) ? "text-gold-400" : "text-ink-1")}>
                  {format(day, "d MMM")}
                </p>
              </div>
            ))}

            {vehicles.map((v) => (
              <Fragment key={v.id}>
                <div className="sticky left-0 bg-surface flex items-center gap-2 border-r border-b border-border-subtle p-3">
                  <span className="text-[13px] font-medium text-ink-1 truncate">{vehicleName(v)}</span>
                </div>
                {days.map((day) => {
                  const items = bookingsForVehicleAndDay(v.id, day);
                  return (
                    <div key={day.toISOString() + v.id} className="border-b border-border-subtle p-1.5 min-h-[64px] space-y-1">
                      {items.map((b) => (
                        <Link
                          key={b.id}
                          href={`/bookings/${b.id}`}
                          className="flex items-center gap-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border-subtle px-2 py-1 transition-colors"
                        >
                          <span className={cn("size-1.5 rounded-full shrink-0", STATUS_DOT[b.status])} />
                          <span className="text-[11px] text-ink-2 truncate">
                            {format(new Date(b.pickupAt), "h:mm a")} · {b.customer.fullName}
                          </span>
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mt-4">
        <Legend color="bg-warning-500" label="Booked" />
        <Legend color="bg-blue-500" label="Active" />
        <Legend color="bg-ink-4" label="Returned" />
      </div>
    </div>
  );
}

function MonthGrid({ days, anchor, bookings, vehicles }: { days: Date[]; anchor: Date; bookings: any[]; vehicles: any[] }) {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border-subtle">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="p-2.5 text-center text-meta">
            {d}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day) => {
            const dayBookings = bookings.filter((b) => new Date(b.pickupAt) <= endOfDay(day) && effectiveEnd(b) >= startOfDay(day));
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[92px] border-b border-r border-border-subtle last:border-r-0 p-2",
                  !isSameMonth(day, anchor) && "opacity-40"
                )}
              >
                <p className={cn("text-[12px] mb-1", isSameDay(day, new Date()) ? "text-gold-400 font-semibold" : "text-ink-4")}>
                  {format(day, "d")}
                </p>
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map((b) => (
                    <Link
                      key={b.id}
                      href={`/bookings/${b.id}`}
                      className="flex items-center gap-1 rounded-md bg-surface-2 hover:bg-surface-3 px-1.5 py-0.5 transition-colors"
                    >
                      <span className={cn("size-1.5 rounded-full shrink-0", STATUS_DOT[b.status])} />
                      <span className="text-[10.5px] text-ink-2 truncate">{b.vehicle.model}</span>
                    </Link>
                  ))}
                  {dayBookings.length > 3 && <p className="text-[10px] text-ink-4">+{dayBookings.length - 3} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full", color)} />
      <span className="text-secondary">{label}</span>
    </div>
  );
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
