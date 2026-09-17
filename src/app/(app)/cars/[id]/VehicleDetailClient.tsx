"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  MoreVertical,
  Pencil,
  Wrench,
  CheckCircle2,
  Archive,
  Car as CarIcon,
  IndianRupee,
  Gauge,
  Fuel,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill, Badge } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { FinanceChart } from "@/components/ui/FinanceChart";
import { VehicleFormModal } from "@/components/vehicles/VehicleFormModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { formatCurrency, formatDate, formatDateTime, vehicleName, getPaymentStatus } from "@/lib/utils";
import { categoryLabel } from "@/lib/constants";
import { getDocumentStatus } from "@/lib/services/documentStatus";

export function VehicleDetailClient({ vehicle, finance, utilisation }: { vehicle: any; finance: any; utilisation: number }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [serviceConfirm, setServiceConfirm] = useState<null | "SERVICE" | "AVAILABLE">(null);
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(status: "SERVICE" | "AVAILABLE") {
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not update vehicle status.");
      } else {
        toast.success(status === "SERVICE" ? "Vehicle marked as in service." : "Vehicle marked as available.");
        router.refresh();
      }
    } finally {
      setLoading(false);
      setServiceConfirm(null);
    }
  }

  async function handleArchive() {
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      if (!res.ok) {
        toast.error("Could not archive vehicle.");
      } else {
        toast.success("Vehicle archived.");
        router.push("/cars");
        router.refresh();
      }
    } finally {
      setLoading(false);
      setArchiveOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/cars"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 hover:text-ink-1 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Fleet
      </Link>

      <Card padding="lg" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-10 size-[300px] rounded-full bg-gold-500/10 blur-[100px]" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative h-28 w-44 shrink-0 flex items-center justify-center">
              <div className="absolute inset-x-4 bottom-2 h-5 rounded-full bg-black/40 blur-lg" />
              {vehicle.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={vehicle.imageUrl} alt={vehicleName(vehicle)} className="relative h-full w-auto object-contain drop-shadow-xl" />
              ) : (
                <CarIcon className="relative size-14 text-ink-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <StatusPill status={vehicle.status} />
                <span className="text-secondary font-mono">{vehicle.registrationNumber}</span>
              </div>
              <h1 className="text-page-title">{vehicleName(vehicle)}</h1>
              <p className="text-body mt-1">
                {vehicle.variant ? `${vehicle.variant} · ` : ""}
                {vehicle.colour} · {vehicle.fuelType} · {vehicle.year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" /> Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {vehicle.status === "SERVICE" ? (
                  <DropdownMenuItem onSelect={() => setServiceConfirm("AVAILABLE")}>
                    <CheckCircle2 className="size-4 text-ink-3" /> Mark as Available
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={() => setServiceConfirm("SERVICE")}>
                    <Wrench className="size-4 text-ink-3" /> Mark as In Service
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setArchiveOpen(true)} className="text-danger-400 data-[highlighted]:text-danger-300">
                  <Archive className="size-4" /> Archive Vehicle
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border-subtle">
          <MiniStat label="Revenue (Month)" value={formatCurrency(finance.revenue)} />
          <MiniStat label="Expenses (Month)" value={formatCurrency(finance.expenses)} />
          <MiniStat label="Profit (Month)" value={formatCurrency(finance.profit)} tone={finance.profit >= 0 ? "success" : "danger"} />
          <MiniStat label="Utilisation (Month)" value={`${utilisation}%`} />
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="service">Service</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="damage">Damage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5 space-y-6">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-4">
              <InfoItem icon={CarIcon} label="Make" value={vehicle.make} />
              <InfoItem icon={CarIcon} label="Model" value={vehicle.model} />
              <InfoItem icon={CarIcon} label="Variant" value={vehicle.variant || "—"} />
              <InfoItem icon={Calendar} label="Year" value={String(vehicle.year)} />
              <InfoItem icon={Fuel} label="Fuel Type" value={vehicle.fuelType} />
              <InfoItem icon={Gauge} label="Current KM" value={`${vehicle.currentKm.toLocaleString("en-IN")} km`} />
              <InfoItem icon={Calendar} label="Purchase Date" value={formatDate(vehicle.purchaseDate)} />
              <InfoItem icon={IndianRupee} label="Purchase Price" value={formatCurrency(vehicle.purchasePrice)} />
            </div>
          </Card>

          {vehicle.pricing && (
            <Card padding="md">
              <CardHeader>
                <CardTitle>Rental Pricing</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-3 gap-4">
                <InfoItem icon={IndianRupee} label="Daily Rate" value={formatCurrency(vehicle.pricing.dailyRate)} />
                <InfoItem icon={IndianRupee} label="Extra Hour Rate" value={formatCurrency(vehicle.pricing.extraHourRate)} />
                <InfoItem icon={IndianRupee} label="Extra KM Rate" value={formatCurrency(vehicle.pricing.extraKmRate)} />
              </div>
            </Card>
          )}

          <Card padding="md">
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <FinanceChart vehicleId={vehicle.id} />
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="mt-5">
          {vehicle.bookings.length === 0 ? (
            <EmptyState icon={Calendar} title="No bookings yet" description="Bookings for this vehicle will appear here." />
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>Booking ID</TH>
                  <TH>Customer</TH>
                  <TH>Pickup</TH>
                  <TH>Return</TH>
                  <TH>Amount</TH>
                  <TH>Payment</TH>
                  <TH>Status</TH>
                </tr>
              </THead>
              <TBody>
                {vehicle.bookings.map((b: any) => {
                  const isReturned = b.status === "RETURNED" && b.vehicleReturn;
                  const paid = b.payments?.reduce((s: number, p: any) => s + p.amount, 0) ?? 0;
                  const pStatus = getPaymentStatus(b.status, b.totalAmount, paid);
                  return (
                    <TR key={b.id}>
                      <TD>
                        <Link href={`/bookings/${b.id}`} className="text-gold-400 hover:text-gold-300 font-medium">
                          {b.code}
                        </Link>
                      </TD>
                      <TD>{b.customer.fullName}</TD>
                      <TD>{formatDateTime(b.pickupAt)}</TD>
                      <TD>{isReturned ? formatDateTime(b.vehicleReturn.returnAt) : "—"}</TD>
                      <TD>{isReturned ? formatCurrency(b.totalAmount) : "Pending"}</TD>
                      <TD>
                        <Badge tone={pStatus.tone}>{pStatus.label}</Badge>
                      </TD>
                      <TD>
                        <StatusPill status={b.status} size="sm" />
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="mt-5">
          {vehicle.expenses.length === 0 ? (
            <EmptyState icon={IndianRupee} title="No expenses recorded" description="Expenses for this vehicle will appear here." />
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>Date</TH>
                  <TH>Category</TH>
                  <TH>Vendor</TH>
                  <TH>Method</TH>
                  <TH>Amount</TH>
                </tr>
              </THead>
              <TBody>
                {vehicle.expenses.map((e: any) => (
                  <TR key={e.id}>
                    <TD>{formatDate(e.date)}</TD>
                    <TD>{categoryLabel(e.category)}</TD>
                    <TD>{e.vendor || "—"}</TD>
                    <TD>{e.paymentMethod}</TD>
                    <TD className="text-ink-1 font-medium">{formatCurrency(e.amount)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="service" className="mt-5">
          {vehicle.services.length === 0 ? (
            <EmptyState icon={Wrench} title="No service history" description="Service records for this vehicle will appear here." />
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>Date</TH>
                  <TH>Service Centre</TH>
                  <TH>Bill Number</TH>
                  <TH>KM</TH>
                  <TH>Amount</TH>
                </tr>
              </THead>
              <TBody>
                {vehicle.services.map((s: any) => (
                  <TR key={s.id}>
                    <TD>{formatDate(s.date)}</TD>
                    <TD>{s.serviceCentre}</TD>
                    <TD>{s.billNumber || "—"}</TD>
                    <TD>{s.kmAtService.toLocaleString("en-IN")} km</TD>
                    <TD className="text-ink-1 font-medium">{formatCurrency(s.amount)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-5">
          {vehicle.documents.length === 0 ? (
            <EmptyState icon={CarIcon} title="No documents uploaded" description="RC, insurance, FC and other documents will appear here." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicle.documents.map((d: any) => (
                <Card key={d.id} padding="sm" className="flex items-center justify-between">
                  <div>
                    <p className="text-card-title">{d.type === "OTHER" ? d.documentName : d.type}</p>
                    <p className="text-secondary">{d.documentNumber || d.issuer || "—"}</p>
                  </div>
                  {d.expiryDate ? (
                    <StatusPill status={getDocumentStatus(d.expiryDate)} size="sm" />
                  ) : (
                    <StatusPill status="NO_EXPIRY" size="sm" />
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="damage" className="mt-5">
          {vehicle.incidents.length === 0 ? (
            <EmptyState icon={CarIcon} title="No damage reported" description="Damage and incident records for this vehicle will appear here." />
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>Incident ID</TH>
                  <TH>Date</TH>
                  <TH>Description</TH>
                  <TH>Repair Cost</TH>
                  <TH>Status</TH>
                </tr>
              </THead>
              <TBody>
                {vehicle.incidents.map((i: any) => (
                  <TR key={i.id}>
                    <TD>
                      <Link href={`/damage?id=${i.id}`} className="text-gold-400 hover:text-gold-300 font-medium">
                        {i.code}
                      </Link>
                    </TD>
                    <TD>{formatDate(i.date)}</TD>
                    <TD className="whitespace-normal max-w-xs truncate">{i.description}</TD>
                    <TD>{i.actualRepairCost ? formatCurrency(i.actualRepairCost) : "—"}</TD>
                    <TD>
                      <StatusPill status={i.status} size="sm" />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      <VehicleFormModal open={editOpen} onOpenChange={setEditOpen} vehicle={vehicle} />
      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Archive vehicle"
        description={`${vehicleName(vehicle)} will be removed from active fleet views. Historical data is preserved. You can restore it later from Settings.`}
        confirmLabel="Archive"
        loading={loading}
        onConfirm={handleArchive}
      />
      <ConfirmDialog
        open={serviceConfirm !== null}
        onOpenChange={() => setServiceConfirm(null)}
        title={serviceConfirm === "SERVICE" ? "Mark vehicle as in service" : "Mark vehicle as available"}
        description={
          serviceConfirm === "SERVICE"
            ? "This vehicle will be unavailable for new bookings until marked available again."
            : "This vehicle will become available for new bookings."
        }
        confirmLabel="Confirm"
        variant="primary"
        loading={loading}
        onConfirm={() => serviceConfirm && handleStatusChange(serviceConfirm)}
      />
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" }) {
  return (
    <div>
      <p className="text-meta mb-1.5">{label}</p>
      <p className={`text-figure text-[18px] font-semibold ${tone === "success" ? "text-success-400" : tone === "danger" ? "text-danger-400" : "text-ink-1"}`}>
        {value}
      </p>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="size-4 text-ink-4 mt-0.5 shrink-0" />
      <div>
        <p className="text-meta mb-0.5">{label}</p>
        <p className="text-[13.5px] text-ink-1 font-medium">{value}</p>
      </div>
    </div>
  );
}
