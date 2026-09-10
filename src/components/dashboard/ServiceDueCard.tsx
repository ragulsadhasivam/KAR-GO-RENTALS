import Link from "next/link";
import { Wrench, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/StatusPill";
import { vehicleName, formatDate } from "@/lib/utils";

interface ServiceDueRow {
  vehicle: { id: string; make: string; model: string };
  status: "DUE" | "OVERDUE";
  reason: "DATE" | "KM" | "BOTH" | null;
  nextServiceDate: Date | string | null;
  nextServiceKm: number | null;
}

export function ServiceDueCard({ items }: { items: ServiceDueRow[] }) {
  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Service Due</CardTitle>
        {items.length > 0 && <span className="text-meta">{items.length} vehicle{items.length === 1 ? "" : "s"}</span>}
      </CardHeader>

      {items.length === 0 ? (
        <EmptyState icon={Wrench} title="No service due" description="All vehicles are within their service schedule." />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.vehicle.id}
              href={`/cars/${item.vehicle.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2/50 px-3.5 py-2.5 hover:bg-surface-2 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-ink-1">{vehicleName(item.vehicle)}</span>
                  <Badge tone={item.status === "OVERDUE" ? "danger" : "warning"}>
                    {item.status === "OVERDUE" ? "Overdue" : "Due"}
                  </Badge>
                </div>
                <p className="text-[11.5px] text-ink-4 mt-0.5">
                  Due by{" "}
                  {[item.nextServiceKm ? `${item.nextServiceKm.toLocaleString("en-IN")} km` : null, item.nextServiceDate ? formatDate(item.nextServiceDate) : null]
                    .filter(Boolean)
                    .join(" or ")}
                </p>
              </div>
              <ArrowRight className="size-3.5 text-ink-4 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
