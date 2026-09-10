"use client";

import Link from "next/link";
import { Bell, CalendarClock, Undo2, IndianRupee, FileWarning, Wrench } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/StatusPill";
import { cn, formatDateTime } from "@/lib/utils";
import type { AppNotification } from "@/lib/services/notifications";

const ICONS: Record<AppNotification["type"], any> = {
  BOOKING_UPCOMING: CalendarClock,
  VEHICLE_RETURN_DUE: Undo2,
  PAYMENT_PENDING: IndianRupee,
  DOCUMENT_EXPIRING: FileWarning,
  DOCUMENT_EXPIRED: FileWarning,
  SERVICE_REMINDER: Wrench,
};

const TONE_CLASSES = {
  info: "text-blue-300 bg-blue-500/10",
  warning: "text-warning-300 bg-warning-500/10",
  critical: "text-danger-300 bg-danger-500/10",
};

const TONE_BADGE = {
  info: "info" as const,
  warning: "warning" as const,
  critical: "danger" as const,
};

export function NotificationsPageClient({ notifications }: { notifications: AppNotification[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title">Notifications</h1>
        <p className="text-body mt-1.5">Everything that needs your attention, generated from live data.</p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="New alerts about bookings, payments, documents and service will appear here." />
      ) : (
        <Card padding="none" className="divide-y divide-border-subtle overflow-hidden">
          {notifications.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <Link key={n.id} href={n.href} className="flex items-start gap-4 px-5 py-4 hover:bg-surface-2/60 transition-colors">
                <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", TONE_CLASSES[n.severity])}>
                  <Icon className="size-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-medium text-ink-1">{n.title}</p>
                    <Badge tone={TONE_BADGE[n.severity]}>{n.severity}</Badge>
                  </div>
                  <p className="text-secondary mt-0.5">{n.description}</p>
                  <p className="text-[11.5px] text-ink-4 mt-1">{formatDateTime(n.date)}</p>
                </div>
              </Link>
            );
          })}
        </Card>
      )}
    </div>
  );
}
