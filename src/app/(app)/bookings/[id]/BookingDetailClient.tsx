"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Car,
  User,
  Calendar,
  IndianRupee,
  ClipboardList,
  Undo2,
  ShieldAlert,
  Plus,
  Phone,
  MapPin,
  Gauge,
  Fuel,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { HandoverDrawer } from "@/components/bookings/HandoverDrawer";
import { ReturnDrawer } from "@/components/bookings/ReturnDrawer";
import { AddPaymentModal } from "@/components/bookings/AddPaymentModal";
import { formatCurrency, formatDate, formatDateTime, vehicleName, cn } from "@/lib/utils";

const STEPS = ["BOOKED", "ACTIVE", "RETURNED"];

export function BookingDetailClient({ booking }: { booking: any }) {
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const paid = booking.payments.reduce((s: number, p: any) => s + p.amount, 0);
  const balance = booking.totalAmount - paid;
  const stepIndex = STEPS.indexOf(booking.status);

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-page-title">{booking.code}</h1>
              <StatusPill status={booking.status} />
            </div>
            <p className="text-body">
              {vehicleName(booking.vehicle)} · {booking.vehicle.registrationNumber} · {booking.customer.fullName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {booking.status === "BOOKED" && (
              <Button onClick={() => setHandoverOpen(true)}>
                <Car className="size-4" /> Start Handover
              </Button>
            )}
            {booking.status === "ACTIVE" && (
              <Button onClick={() => setReturnOpen(true)}>
                <Undo2 className="size-4" /> Return Vehicle
              </Button>
            )}
            {balance > 0 && booking.status !== "BOOKED" && (
              <Button variant="secondary" onClick={() => setPaymentOpen(true)}>
                <Plus className="size-4" /> Add Payment
              </Button>
            )}
          </div>
        </div>

        {/* Lifecycle stepper */}
        <div className="flex items-center">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border text-[12px] font-semibold shrink-0",
                    i < stepIndex && "bg-success-500/15 border-success-500/40 text-success-400",
                    i === stepIndex && "bg-gold-500/15 border-gold-500/50 text-gold-300",
                    i > stepIndex && "bg-surface-2 border-border text-ink-4"
                  )}
                >
                  {i < stepIndex ? <Check className="size-3.5" /> : i + 1}
                </div>
                <span className={cn("text-[13px] font-medium", i <= stepIndex ? "text-ink-1" : "text-ink-4")}>
                  {step.charAt(0) + step.slice(1).toLowerCase()}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("h-px flex-1 mx-4", i < stepIndex ? "bg-success-500/40" : "bg-border")} />
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Rental</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-4">
              <Info icon={Calendar} label="Pickup" value={formatDateTime(booking.pickupAt)} />
              <Info icon={Calendar} label="Return" value={formatDateTime(booking.returnAt)} />
              <Info icon={Calendar} label="Duration" value={`${booking.rentalDays} day(s)`} />
              <Info icon={MapPin} label="Pickup Location" value={booking.pickupLocation} />
              <Info icon={MapPin} label="Return Location" value={booking.returnLocation} />
            </div>
          </Card>

          <Card padding="md">
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-3 gap-4 mb-5">
              <Info icon={IndianRupee} label="Total Rental Amount" value={formatCurrency(booking.totalAmount)} />
              <Info icon={IndianRupee} label="Amount Paid" value={formatCurrency(paid)} />
              <Info icon={IndianRupee} label="Balance" value={formatCurrency(balance)} highlight={balance > 0} />
            </div>
            {booking.payments.length === 0 ? (
              <p className="text-secondary">No payments recorded yet.</p>
            ) : (
              <Table>
                <THead>
                  <tr>
                    <TH>Date</TH>
                    <TH>Amount</TH>
                    <TH>Method</TH>
                    <TH>Added By</TH>
                  </tr>
                </THead>
                <TBody>
                  {booking.payments.map((p: any) => (
                    <TR key={p.id}>
                      <TD>{formatDateTime(p.date)}</TD>
                      <TD className="text-ink-1 font-medium">{formatCurrency(p.amount)}</TD>
                      <TD>{p.method.replace("_", " ")}</TD>
                      <TD>{p.addedBy?.name ?? "—"}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </Card>

          {booking.handover && (
            <Card padding="md">
              <CardHeader>
                <CardTitle>Handover</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-4 mb-4">
                <Info icon={Gauge} label="Starting KM" value={`${booking.handover.startingKm.toLocaleString("en-IN")} km`} />
                <Info icon={Fuel} label="Fuel Level" value={booking.handover.fuelLevel} />
                <Info icon={Calendar} label="Handover Time" value={formatDateTime(booking.handover.handoverAt)} />
                <Info icon={ClipboardList} label="Exterior" value={booking.handover.exteriorCondition} />
                <Info icon={ClipboardList} label="Interior" value={booking.handover.interiorCondition} />
              </div>
              {booking.handover.existingDamageNotes && (
                <p className="text-secondary bg-surface-2 rounded-lg px-3 py-2">{booking.handover.existingDamageNotes}</p>
              )}
              <PhotoGrid photos={booking.handover.photos} />
            </Card>
          )}

          {booking.vehicleReturn && (
            <Card padding="md">
              <CardHeader>
                <CardTitle>Return</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-4 mb-4">
                <Info icon={Gauge} label="Ending KM" value={`${booking.vehicleReturn.endingKm.toLocaleString("en-IN")} km`} />
                <Info icon={Fuel} label="Fuel Level" value={booking.vehicleReturn.fuelLevel} />
                <Info icon={Calendar} label="Return Time" value={formatDateTime(booking.vehicleReturn.returnAt)} />
                <Info icon={IndianRupee} label="Damage Charge" value={formatCurrency(booking.vehicleReturn.damageCharge)} />
                <Info icon={IndianRupee} label="Other Penalty" value={formatCurrency(booking.vehicleReturn.otherPenalty)} />
              </div>
              {booking.vehicleReturn.newDamageNotes && (
                <p className="text-secondary bg-surface-2 rounded-lg px-3 py-2">{booking.vehicleReturn.newDamageNotes}</p>
              )}
              <PhotoGrid photos={booking.vehicleReturn.photos} />
            </Card>
          )}

          <Card padding="md">
            <CardHeader>
              <CardTitle>Damage</CardTitle>
              <Link href={`/damage?new=1&bookingId=${booking.id}&vehicleId=${booking.vehicleId}&customerId=${booking.customerId}`}>
                <Button size="sm" variant="secondary">
                  <ShieldAlert className="size-3.5" /> Report Damage
                </Button>
              </Link>
            </CardHeader>
            {booking.incidents.length === 0 ? (
              <p className="text-secondary">No damage reported for this booking.</p>
            ) : (
              <div className="space-y-2">
                {booking.incidents.map((i: any) => (
                  <div key={i.id} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2.5">
                    <div>
                      <p className="text-[13px] text-ink-1 font-medium">{i.code}</p>
                      <p className="text-secondary">{i.description}</p>
                    </div>
                    <StatusPill status={i.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <Link href={`/customers/${booking.customerId}`} className="text-[14px] font-medium text-ink-1 hover:text-gold-300 block mb-3">
              {booking.customer.fullName}
            </Link>
            <div className="space-y-3">
              <Info icon={Phone} label="Mobile" value={booking.customer.mobile} />
              <Info icon={User} label="Driving Licence" value={booking.customer.drivingLicenceNumber} />
              <Info icon={MapPin} label="Address" value={booking.customer.address} />
            </div>
          </Card>

          <Card padding="md">
            <CardHeader>
              <CardTitle>Vehicle</CardTitle>
            </CardHeader>
            <div className="relative h-28 mb-3 rounded-xl bg-surface-2 flex items-center justify-center overflow-hidden">
              {booking.vehicle.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={booking.vehicle.imageUrl} alt="" className="h-full w-auto object-contain" />
              )}
            </div>
            <Link href={`/cars/${booking.vehicleId}`} className="text-[14px] font-medium text-ink-1 hover:text-gold-300 block mb-3">
              {vehicleName(booking.vehicle)}
            </Link>
            <Info icon={Car} label="Registration" value={booking.vehicle.registrationNumber} />
          </Card>
        </div>
      </div>

      <HandoverDrawer
        open={handoverOpen}
        onOpenChange={setHandoverOpen}
        bookingId={booking.id}
        currentKm={booking.vehicle.currentKm}
      />
      <ReturnDrawer
        open={returnOpen}
        onOpenChange={setReturnOpen}
        bookingId={booking.id}
        startingKm={booking.handover?.startingKm ?? booking.vehicle.currentKm}
      />
      <AddPaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} bookingId={booking.id} balance={balance} />
    </div>
  );
}

function Info({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="size-4 text-ink-4 mt-0.5 shrink-0" />
      <div>
        <p className="text-meta mb-0.5">{label}</p>
        <p className={cn("text-[13.5px] font-medium", highlight ? "text-warning-400" : "text-ink-1")}>{value}</p>
      </div>
    </div>
  );
}

function PhotoGrid({ photos }: { photos: string }) {
  let list: string[] = [];
  try {
    list = JSON.parse(photos);
  } catch {}
  if (!list.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {list.map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={url} alt="" className="size-20 rounded-xl object-cover border border-border" />
      ))}
    </div>
  );
}
