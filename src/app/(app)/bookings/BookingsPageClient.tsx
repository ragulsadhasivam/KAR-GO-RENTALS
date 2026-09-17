"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Search, CalendarRange, List, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { StatusPill, Badge } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewBookingDrawer } from "@/components/bookings/NewBookingDrawer";
import { BookingCalendar } from "@/components/bookings/BookingCalendar";
import { formatCurrency, formatDateTime, cn, vehicleName, getPaymentStatus } from "@/lib/utils";
import { calculateRentalDuration, formatDuration } from "@/lib/rentalBilling";

const TABS = ["ALL", "BOOKED", "ACTIVE", "RETURNED"];

export function BookingsPageClient({ bookings, vehicles }: { bookings: any[]; vehicles: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setDrawerOpen(true);
      router.replace("/bookings");
    }
  }, [searchParams, router]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (status !== "ALL" && b.status !== status) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          b.code.toLowerCase().includes(q) ||
          b.customer.fullName.toLowerCase().includes(q) ||
          b.customer.mobile.includes(q) ||
          b.vehicle.registrationNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bookings, status, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-page-title">Bookings</h1>
          <p className="text-body mt-1.5">Manage every rental from pickup to return.</p>
        </div>
        <Button onClick={() => setDrawerOpen(true)}>
          <Plus className="size-4" /> New Booking
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t} value={t}>
                {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {view === "list" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-4" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search bookings…"
                className="h-9 w-56 rounded-xl bg-surface-2 border border-border pl-8 pr-3 text-[13px] text-ink-1 placeholder:text-ink-4 focus-ring outline-none focus:border-gold-500/50"
              />
            </div>
          )}
          <div className="flex gap-1 rounded-xl bg-surface-2 border border-border-subtle p-1">
            <button
              onClick={() => setView("list")}
              className={cn("h-7 rounded-lg px-3 text-[12px] font-medium flex items-center gap-1.5", view === "list" ? "bg-surface-3 text-ink-1" : "text-ink-4")}
            >
              <List className="size-3.5" /> List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={cn("h-7 rounded-lg px-3 text-[12px] font-medium flex items-center gap-1.5", view === "calendar" ? "bg-surface-3 text-ink-1" : "text-ink-4")}
            >
              <CalendarRange className="size-3.5" /> Calendar
            </button>
          </div>
        </div>
      </div>

      {view === "calendar" ? (
        <BookingCalendar vehicles={vehicles} bookings={bookings} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No rentals yet"
          description="Your first booking will appear here."
          action={
            <Button onClick={() => setDrawerOpen(true)}>
              <Plus className="size-4" /> Create Booking
            </Button>
          }
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Booking ID</TH>
              <TH>Customer</TH>
              <TH>Vehicle</TH>
              <TH>Pickup</TH>
              <TH>Return</TH>
              <TH>Duration</TH>
              <TH>Amount</TH>
              <TH>Paid</TH>
              <TH>Balance</TH>
              <TH>Payment</TH>
              <TH>Status</TH>
              <TH />
            </tr>
          </THead>
          <TBody>
            {filtered.map((b) => {
              const paid = b.payments.reduce((s: number, p: any) => s + p.amount, 0);
              const isReturned = b.status === "RETURNED" && b.vehicleReturn;
              const balance = b.totalAmount - paid;
              const duration = isReturned ? calculateRentalDuration(new Date(b.pickupAt), new Date(b.vehicleReturn.returnAt)) : null;
              const pStatus = getPaymentStatus(b.status, b.totalAmount, paid);
              return (
                <TR key={b.id}>
                  <TD className="font-medium text-ink-1">{b.code}</TD>
                  <TD>{b.customer.fullName}</TD>
                  <TD>{vehicleName(b.vehicle)}</TD>
                  <TD>{formatDateTime(b.pickupAt)}</TD>
                  <TD>{isReturned ? formatDateTime(b.vehicleReturn.returnAt) : "—"}</TD>
                  <TD>{duration ? formatDuration(duration) : "Pending"}</TD>
                  <TD>{isReturned ? formatCurrency(b.totalAmount) : "Pending"}</TD>
                  <TD>{formatCurrency(paid)}</TD>
                  <TD className={isReturned && balance > 0.5 ? "text-warning-400 font-medium" : ""}>{isReturned ? formatCurrency(Math.max(0, balance)) : "—"}</TD>
                  <TD>
                    <Badge tone={pStatus.tone}>{pStatus.label}</Badge>
                  </TD>
                  <TD>
                    <StatusPill status={b.status} size="sm" />
                  </TD>
                  <TD>
                    <Link href={`/bookings/${b.id}`} className="flex items-center gap-1 text-gold-400 hover:text-gold-300 font-medium">
                      View <ArrowRight className="size-3.5" />
                    </Link>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}

      <NewBookingDrawer open={drawerOpen} onOpenChange={setDrawerOpen} vehicles={vehicles} />
    </div>
  );
}
