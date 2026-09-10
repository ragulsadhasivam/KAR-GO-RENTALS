"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/layout/AdminMenu";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { formatCurrency, formatDate } from "@/lib/utils";

export function CustomersPageClient({ customers }: { customers: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setOpen(true);
      router.replace("/customers");
    }
  }, [searchParams, router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title">Customers</h1>
          <p className="text-body mt-1.5">Everyone who has rented from you.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add Customer
        </Button>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Customers will appear automatically when bookings are created, or you can add one now."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" /> Add Customer
            </Button>
          }
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Name</TH>
              <TH>Phone</TH>
              <TH>Bookings</TH>
              <TH>Total Spent</TH>
              <TH>Last Booking</TH>
              <TH>Current Booking</TH>
            </tr>
          </THead>
          <TBody>
            {customers.map((c) => {
              const totalSpent = c.bookings.flatMap((b: any) => b.payments).reduce((s: number, p: any) => s + p.amount, 0);
              const sortedBookings = [...c.bookings].sort(
                (a: any, b: any) => new Date(b.pickupAt).getTime() - new Date(a.pickupAt).getTime()
              );
              const lastBooking = sortedBookings[0];
              const currentBooking = c.bookings.find((b: any) => b.status === "ACTIVE" || b.status === "BOOKED");
              return (
                <TR key={c.id}>
                  <TD>
                    <Link href={`/customers/${c.id}`} className="flex items-center gap-2.5 text-ink-1 font-medium hover:text-gold-300">
                      <Avatar name={c.fullName} />
                      {c.fullName}
                    </Link>
                  </TD>
                  <TD>{c.mobile}</TD>
                  <TD>{c.bookings.length}</TD>
                  <TD className="text-ink-1 font-medium">{formatCurrency(totalSpent)}</TD>
                  <TD>{lastBooking ? formatDate(lastBooking.pickupAt) : "—"}</TD>
                  <TD>{currentBooking ? currentBooking.code : "—"}</TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}

      <CustomerFormModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
