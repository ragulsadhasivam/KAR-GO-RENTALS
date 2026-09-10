"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Wrench, AlertTriangle, IndianRupee, Calendar, Gauge } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { KPICard } from "@/components/ui/KPICard";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/StatusPill";
import { AddExpenseModal } from "@/components/finance/AddExpenseModal";
import { formatCurrency, formatDate, vehicleName } from "@/lib/utils";
import { serviceReminderMessage } from "@/lib/services/serviceReminder";

const STATUS_BADGE: Record<string, { tone: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  SCHEDULED: { tone: "neutral", label: "Scheduled" },
  DUE: { tone: "warning", label: "Due" },
  OVERDUE: { tone: "danger", label: "Overdue" },
};

export function ServicePageClient({ services, vehicles, totalCost, upcoming }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setOpen(true);
      router.replace("/service");
    }
  }, [searchParams, router]);

  const dueCount = upcoming.filter((u: any) => u.status === "DUE" || u.status === "OVERDUE").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title">Service & Maintenance</h1>
          <p className="text-body mt-1.5">Track service history and upcoming maintenance.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Total Service Cost" value={formatCurrency(totalCost)} icon={IndianRupee} tone="gold" />
        <KPICard label="Service Records" value={String(services.length)} icon={Wrench} tone="blue" />
        <KPICard label="Due for Service" value={String(dueCount)} icon={AlertTriangle} tone={dueCount > 0 ? "neutral" : "success"} />
      </div>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Upcoming Service</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {upcoming.map(({ vehicle, lastService, status, reason }: any) => (
            <div key={vehicle.id} className="rounded-xl border border-border-subtle bg-surface-2/50 px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13.5px] font-medium text-ink-1">{vehicleName(vehicle)}</p>
                {status ? (
                  <Badge tone={STATUS_BADGE[status].tone}>{STATUS_BADGE[status].label}</Badge>
                ) : (
                  <Badge tone="neutral">Not Set</Badge>
                )}
              </div>
              {lastService?.nextServiceDate || lastService?.nextServiceKm ? (
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  {lastService?.nextServiceDate && (
                    <span className="flex items-center gap-1.5 text-secondary">
                      <Calendar className="size-3.5" /> {formatDate(lastService.nextServiceDate)}
                    </span>
                  )}
                  {lastService?.nextServiceKm && (
                    <span className="flex items-center gap-1.5 text-secondary">
                      <Gauge className="size-3.5" /> {lastService.nextServiceKm.toLocaleString("en-IN")} km
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-secondary mt-2">
                  {lastService ? "No next-service reminder set" : "No service on record"}
                </p>
              )}
              {(status === "DUE" || status === "OVERDUE") && (
                <p className="text-[12px] text-warning-400 mt-1.5">{serviceReminderMessage(reason)}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Service History</CardTitle>
        </CardHeader>
        {services.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="Service history will appear here."
            action={
              <Button onClick={() => setOpen(true)}>
                <Plus className="size-4" /> Add Service
              </Button>
            }
          />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Date</TH>
                <TH>Vehicle</TH>
                <TH>Service Centre</TH>
                <TH>Bill Number</TH>
                <TH>KM</TH>
                <TH>Amount</TH>
                <TH>Next Service</TH>
              </tr>
            </THead>
            <TBody>
              {services.map((s: any) => (
                <TR key={s.id}>
                  <TD>{formatDate(s.date)}</TD>
                  <TD>{vehicleName(s.vehicle)}</TD>
                  <TD>{s.serviceCentre}</TD>
                  <TD>{s.billNumber || "—"}</TD>
                  <TD>{s.kmAtService.toLocaleString("en-IN")} km</TD>
                  <TD className="text-ink-1 font-medium">{formatCurrency(s.amount)}</TD>
                  <TD>
                    {s.nextServiceDate || s.nextServiceKm
                      ? [
                          s.nextServiceDate ? formatDate(s.nextServiceDate) : null,
                          s.nextServiceKm ? `${s.nextServiceKm.toLocaleString("en-IN")} km` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")
                      : "—"}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <AddExpenseModal open={open} onOpenChange={setOpen} vehicles={vehicles} initialCategory="SERVICE_MAINTENANCE" />
    </div>
  );
}
