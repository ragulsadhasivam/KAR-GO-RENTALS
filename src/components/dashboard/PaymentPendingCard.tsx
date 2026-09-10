import Link from "next/link";
import { IndianRupee, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { vehicleName, formatCurrency, formatDate } from "@/lib/utils";

interface PendingRow {
  booking: { id: string; code: string; totalAmount: number; returnAt: Date | string; vehicle: any; customer: any };
  paid: number;
  balance: number;
}

export function PaymentPendingCard({ items }: { items: PendingRow[] }) {
  const totalOutstanding = items.reduce((s, i) => s + i.balance, 0);

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Payment Pending</CardTitle>
        {items.length > 0 && (
          <div className="text-right">
            <p className="text-[13px] font-semibold text-warning-400">
              {items.length} Pending Payment{items.length === 1 ? "" : "s"}
            </p>
            <p className="text-meta">{formatCurrency(totalOutstanding)} Outstanding</p>
          </div>
        )}
      </CardHeader>

      {items.length === 0 ? (
        <EmptyState icon={IndianRupee} title="No pending payments" description="All active and returned bookings are fully paid." />
      ) : (
        <div className="space-y-2">
          {items.slice(0, 6).map(({ booking, paid, balance }) => (
            <Link
              key={booking.id}
              href={`/bookings/${booking.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-warning-500/15 bg-warning-500/5 px-3.5 py-2.5 hover:bg-warning-500/10 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-ink-1">{booking.code}</span>
                  <span className="text-secondary truncate">{booking.customer.fullName}</span>
                </div>
                <p className="text-[11.5px] text-ink-4 mt-0.5">
                  {vehicleName(booking.vehicle)} · Return {formatDate(booking.returnAt)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-figure text-[13px] font-semibold text-warning-400">{formatCurrency(balance)}</p>
                <p className="text-[11px] text-ink-4">
                  of {formatCurrency(booking.totalAmount)} paid {formatCurrency(paid)}
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
