import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatTime } from "@/lib/utils";
import { CalendarCheck2 } from "lucide-react";

interface ScheduleItem {
  time: Date;
  label: string;
  customer: string;
  vehicle: string;
  status: string;
  href: string;
}

export function TodaySchedule({ items }: { items: ScheduleItem[] }) {
  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Today&apos;s Schedule</CardTitle>
        <span className="text-meta">{items.length} events</span>
      </CardHeader>

      {items.length === 0 ? (
        <EmptyState icon={CalendarCheck2} title="Nothing scheduled today" description="Pickups and returns for today will appear here." />
      ) : (
        <ol className="relative space-y-0">
          {items.map((item, i) => (
            <li key={i}>
              <Link href={item.href} className="group flex gap-4 py-3 -mx-2 px-2 rounded-xl hover:bg-surface-2/60 transition-colors">
                <div className="flex flex-col items-center shrink-0 w-14 pt-0.5">
                  <span className="text-[13px] font-semibold text-ink-1 font-figure">{formatTime(item.time)}</span>
                </div>
                <div className="flex flex-col items-center shrink-0">
                  <span className="size-2.5 rounded-full bg-gold-400 ring-4 ring-gold-500/15" />
                  {i < items.length - 1 && <span className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="min-w-0 flex-1 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13.5px] font-medium text-ink-1">{item.vehicle}</span>
                    <StatusPill status={item.status} size="sm" />
                  </div>
                  <p className="text-secondary mt-0.5">
                    {item.customer} — {item.label}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
