"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, ShieldAlert } from "lucide-react";
import { Table, THead, TBody, TR, TH, TD, denseCell, denseCellText } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { Drawer } from "@/components/ui/Drawer";
import { Select } from "@/components/ui/Field";
import { AddIncidentModal } from "@/components/damage/AddIncidentModal";
import { cn, formatCurrency, formatDate, vehicleName } from "@/lib/utils";
import { DAMAGE_STATUS } from "@/lib/constants";
import { toast } from "sonner";

export function DamagePageClient({ incidents, vehicles, bookings, customers }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<any>(null);
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setOpen(true);
    }
    const id = searchParams.get("id");
    if (id) {
      const incident = incidents.find((i: any) => i.id === id);
      if (incident) setViewing(incident);
    }
  }, [searchParams, incidents]);

  function closeModal() {
    setOpen(false);
    router.replace("/damage");
  }

  async function updateStatus(newStatus: string) {
    if (!viewing) return;
    setStatusSaving(true);
    try {
      const res = await fetch(`/api/damage/${viewing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        toast.error("Could not update status.");
      } else {
        toast.success("Incident status updated.");
        setViewing({ ...viewing, status: newStatus });
        router.refresh();
      }
    } finally {
      setStatusSaving(false);
    }
  }

  const defaults = {
    vehicleId: searchParams.get("vehicleId") ?? undefined,
    bookingId: searchParams.get("bookingId") ?? undefined,
    customerId: searchParams.get("customerId") ?? undefined,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title">Damage & Incidents</h1>
          <p className="text-body mt-1.5">Track vehicle damage from report to repair.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add Incident
        </Button>
      </div>

      {incidents.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No incidents reported"
          description="Damage and incident reports will appear here."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" /> Add Incident
            </Button>
          }
        />
      ) : (
        <Table className="table-fixed">
          <colgroup>
            <col style={{ width: "12.35%" }} />
            <col style={{ width: "13.53%" }} />
            <col style={{ width: "9.3%" }} />
            <col style={{ width: "7.65%" }} />
            <col style={{ width: "7.75%" }} />
            <col style={{ width: "17.07%" }} />
            <col style={{ width: "12.35%" }} />
            <col style={{ width: "7.65%" }} />
            <col style={{ width: "12.35%" }} />
          </colgroup>
          <THead>
            <tr>
              <TH className={denseCell}>Incident ID</TH>
              <TH className={denseCell}>Date</TH>
              <TH className={denseCell}>Vehicle</TH>
              <TH className={denseCell}>Booking</TH>
              <TH className={denseCell}>Customer</TH>
              <TH className={denseCell}>Description</TH>
              <TH className={denseCell}>Repair Cost</TH>
              <TH className={denseCell}>Customer Charge</TH>
              <TH className={denseCell}>Status</TH>
            </tr>
          </THead>
          <TBody>
            {incidents.map((i: any) => (
              <TR key={i.id} className="cursor-pointer" onClick={() => setViewing(i)}>
                <TD className={cn(denseCell, denseCellText, "font-medium text-ink-1")}>{i.code}</TD>
                <TD className={cn(denseCell, denseCellText)}>{formatDate(i.date)}</TD>
                <TD className={cn(denseCell, denseCellText)}>{vehicleName(i.vehicle)}</TD>
                <TD className={cn(denseCell, denseCellText)}>{i.booking?.code || "—"}</TD>
                <TD className={cn(denseCell, denseCellText)}>{i.customer?.fullName || "—"}</TD>
                <TD className={cn(denseCell, denseCellText)}>{i.description}</TD>
                <TD className={cn(denseCell, denseCellText)}>{i.actualRepairCost ? formatCurrency(i.actualRepairCost) : i.estimatedRepairCost ? `Est. ${formatCurrency(i.estimatedRepairCost)}` : "—"}</TD>
                <TD className={cn(denseCell, denseCellText)}>{i.customerCharge ? formatCurrency(i.customerCharge) : "—"}</TD>
                <TD className={denseCell}>
                  <StatusPill status={i.status} size="sm" className="w-full max-w-full justify-center" />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <AddIncidentModal
        open={open}
        onOpenChange={(v) => (v ? setOpen(true) : closeModal())}
        vehicles={vehicles}
        bookings={bookings}
        customers={customers}
        defaults={defaults}
      />

      <Drawer
        open={!!viewing}
        onOpenChange={(v) => {
          if (!v) {
            setViewing(null);
            router.replace("/damage");
          }
        }}
        title={viewing?.code ?? ""}
        description={viewing ? vehicleName(viewing.vehicle) : ""}
        width="sm"
      >
        {viewing && (
          <div className="space-y-5">
            <Select label="Status" value={viewing.status} onChange={(e) => updateStatus(e.target.value)} disabled={statusSaving}>
              {DAMAGE_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ")}
                </option>
              ))}
            </Select>
            <div>
              <p className="text-meta mb-1">Description</p>
              <p className="text-body">{viewing.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-meta mb-1">Date</p>
                <p className="text-[13.5px] text-ink-1">{formatDate(viewing.date)}</p>
              </div>
              <div>
                <p className="text-meta mb-1">Customer</p>
                <p className="text-[13.5px] text-ink-1">{viewing.customer?.fullName || "—"}</p>
              </div>
              <div>
                <p className="text-meta mb-1">Estimated Cost</p>
                <p className="text-[13.5px] text-ink-1">{viewing.estimatedRepairCost ? formatCurrency(viewing.estimatedRepairCost) : "—"}</p>
              </div>
              <div>
                <p className="text-meta mb-1">Actual Cost</p>
                <p className="text-[13.5px] text-ink-1">{viewing.actualRepairCost ? formatCurrency(viewing.actualRepairCost) : "—"}</p>
              </div>
              <div>
                <p className="text-meta mb-1">Customer Charge</p>
                <p className="text-[13.5px] text-ink-1">{viewing.customerCharge ? formatCurrency(viewing.customerCharge) : "—"}</p>
              </div>
            </div>
            {viewing.notes && (
              <div>
                <p className="text-meta mb-1">Notes</p>
                <p className="text-body">{viewing.notes}</p>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
