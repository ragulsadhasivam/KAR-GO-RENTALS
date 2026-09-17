"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Phone, IdCard, MapPin, ShieldAlert, Calendar, IndianRupee, CircleDot } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { KPICard } from "@/components/ui/KPICard";
import { StatusPill, Badge } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/layout/AdminMenu";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { getDocumentStatus } from "@/lib/services/documentStatus";
import { formatCurrency, formatDate, formatDateTime, vehicleName, getPaymentStatus } from "@/lib/utils";
import { calculateRentalDuration, formatDuration } from "@/lib/rentalBilling";
import { paymentMethodLabel } from "@/lib/constants";

export function CustomerDetailClient({ customer }: { customer: any }) {
  const [editOpen, setEditOpen] = useState(false);
  const totalSpent = customer.bookings.flatMap((b: any) => b.payments).reduce((s: number, p: any) => s + p.amount, 0);
  const outstandingBalance = customer.bookings.reduce((sum: number, b: any) => {
    const paid = b.payments.reduce((s: number, p: any) => s + p.amount, 0);
    return sum + Math.max(0, b.totalAmount - paid);
  }, 0);
  const activeBooking = customer.bookings.find((b: any) => b.status === "ACTIVE");
  const licenceStatus = getDocumentStatus(customer.licenceExpiry, 30);

  return (
    <div className="space-y-6">
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 hover:text-ink-1 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Customers
      </Link>

      <Card padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="scale-[1.8] ml-2">
              <Avatar name={customer.fullName} />
            </div>
            <div className="ml-3">
              <h1 className="text-page-title">{customer.fullName}</h1>
              <p className="text-body mt-1">{customer.mobile}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" /> Edit
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border-subtle">
          <MiniStat label="Total Bookings" value={String(customer.bookings.length)} />
          <MiniStat label="Total Spent" value={formatCurrency(totalSpent)} />
          <MiniStat label="Customer Since" value={formatDate(customer.createdAt)} />
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Bookings" value={String(customer.bookings.length)} icon={Calendar} tone="neutral" />
        <KPICard
          label="Active Booking"
          value={activeBooking ? vehicleName(activeBooking.vehicle) : "None"}
          icon={CircleDot}
          tone={activeBooking ? "blue" : "neutral"}
        />
        <KPICard label="Total Spent" value={formatCurrency(totalSpent)} icon={IndianRupee} tone="gold" />
        <KPICard
          label="Outstanding Balance"
          value={formatCurrency(outstandingBalance)}
          icon={IndianRupee}
          tone={outstandingBalance > 0 ? "neutral" : "success"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md">
          <CardHeader>
            <CardTitle>Driving Licence</CardTitle>
            <StatusPill status={licenceStatus} size="sm" />
          </CardHeader>
          <InfoRow icon={IdCard} label="Licence Number" value={customer.drivingLicenceNumber} />
          <InfoRow icon={Calendar} label="Expiry" value={formatDate(customer.licenceExpiry)} />
        </Card>

        <Card padding="md">
          <CardHeader>
            <CardTitle>ID Proof</CardTitle>
          </CardHeader>
          <InfoRow icon={IdCard} label="Type" value={customer.idProofType} />
          <InfoRow icon={IdCard} label="Number" value={customer.idProofNumber} />
        </Card>

        <Card padding="md">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <InfoRow icon={Phone} label="Mobile" value={customer.mobile} />
          <InfoRow icon={Phone} label="Emergency Contact" value={customer.emergencyContact || "—"} />
          <InfoRow icon={MapPin} label="Address" value={customer.address} />
        </Card>
      </div>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        {customer.bookings.length === 0 ? (
          <EmptyState icon={Calendar} title="No bookings yet" />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Booking ID</TH>
                <TH>Vehicle</TH>
                <TH>Pickup</TH>
                <TH>Return</TH>
                <TH>Duration</TH>
                <TH>Total</TH>
                <TH>Paid</TH>
                <TH>Balance</TH>
                <TH>Payment</TH>
                <TH>Status</TH>
                <TH />
              </tr>
            </THead>
            <TBody>
              {customer.bookings.map((b: any) => {
                const paid = b.payments.reduce((s: number, p: any) => s + p.amount, 0);
                const isReturned = b.status === "RETURNED" && b.vehicleReturn;
                const balance = Math.max(0, b.totalAmount - paid);
                const pStatus = getPaymentStatus(b.status, b.totalAmount, paid);
                const duration = isReturned ? calculateRentalDuration(new Date(b.pickupAt), new Date(b.vehicleReturn.returnAt)) : null;
                return (
                  <TR key={b.id}>
                    <TD>
                      <Link href={`/bookings/${b.id}`} className="text-gold-400 hover:text-gold-300 font-medium">
                        {b.code}
                      </Link>
                    </TD>
                    <TD>{vehicleName(b.vehicle)}</TD>
                    <TD>{formatDateTime(b.pickupAt)}</TD>
                    <TD>{isReturned ? formatDateTime(b.vehicleReturn.returnAt) : "Pending"}</TD>
                    <TD>{duration ? formatDuration(duration) : "Pending"}</TD>
                    <TD>{isReturned ? formatCurrency(b.totalAmount) : "Pending"}</TD>
                    <TD>{formatCurrency(paid)}</TD>
                    <TD className={isReturned && balance > 0.5 ? "text-warning-400 font-medium" : ""}>{isReturned ? formatCurrency(balance) : "—"}</TD>
                    <TD>
                      <Badge tone={pStatus.tone}>{pStatus.label}</Badge>
                    </TD>
                    <TD>
                      <StatusPill status={b.status} size="sm" />
                    </TD>
                    <TD>
                      <Link href={`/bookings/${b.id}`} className="text-ink-3 hover:text-ink-1">
                        Open
                      </Link>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        {(() => {
          const payments = customer.bookings
            .flatMap((b: any) => b.payments.map((p: any) => ({ ...p, bookingCode: b.code, bookingId: b.id })))
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          if (payments.length === 0) return <EmptyState icon={IndianRupee} title="No payments recorded" />;
          return (
            <Table>
              <THead>
                <tr>
                  <TH>Date</TH>
                  <TH>Related Booking</TH>
                  <TH>Amount</TH>
                  <TH>Method</TH>
                </tr>
              </THead>
              <TBody>
                {payments.map((p: any) => (
                  <TR key={p.id}>
                    <TD>{formatDate(p.date)}</TD>
                    <TD>
                      <Link href={`/bookings/${p.bookingId}`} className="text-gold-400 hover:text-gold-300 font-medium">
                        {p.bookingCode}
                      </Link>
                    </TD>
                    <TD className="text-ink-1 font-medium">{formatCurrency(p.amount)}</TD>
                    <TD>{paymentMethodLabel(p.method)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          );
        })()}
      </Card>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Damage History</CardTitle>
        </CardHeader>
        {customer.incidents.length === 0 ? (
          <EmptyState icon={ShieldAlert} title="No damage incidents" />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Incident ID</TH>
                <TH>Date</TH>
                <TH>Vehicle</TH>
                <TH>Booking</TH>
                <TH>Description</TH>
                <TH>Est. Repair</TH>
                <TH>Actual Repair</TH>
                <TH>Customer Charge</TH>
                <TH>Status</TH>
              </tr>
            </THead>
            <TBody>
              {customer.incidents.map((i: any) => (
                <TR key={i.id}>
                  <TD>{i.code}</TD>
                  <TD>{formatDate(i.date)}</TD>
                  <TD>{vehicleName(i.vehicle)}</TD>
                  <TD>
                    {i.bookingId ? (
                      <Link href={`/bookings/${i.bookingId}`} className="text-gold-400 hover:text-gold-300 font-medium">
                        {i.booking?.code ?? "View"}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TD>
                  <TD className="whitespace-normal max-w-xs">{i.description}</TD>
                  <TD>{i.estimatedRepairCost ? formatCurrency(i.estimatedRepairCost) : "—"}</TD>
                  <TD>{i.actualRepairCost ? formatCurrency(i.actualRepairCost) : "—"}</TD>
                  <TD>{i.customerCharge ? formatCurrency(i.customerCharge) : "—"}</TD>
                  <TD>
                    <StatusPill status={i.status} size="sm" />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <CustomerFormModal open={editOpen} onOpenChange={setEditOpen} customer={customer} />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-meta mb-1.5">{label}</p>
      <p className="text-figure text-[18px] font-semibold text-ink-1">{value}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <Icon className="size-4 text-ink-4 mt-0.5 shrink-0" />
      <div>
        <p className="text-meta mb-0.5">{label}</p>
        <p className="text-[13.5px] text-ink-1 font-medium">{value}</p>
      </div>
    </div>
  );
}
