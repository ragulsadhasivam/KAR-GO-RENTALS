"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import { Bell, CalendarClock, IndianRupee, FileWarning, Wrench } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import type { AppNotification } from "@/lib/services/notifications";

const ICONS: Record<AppNotification["type"], any> = {
  BOOKING_UPCOMING: CalendarClock,
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

export function NotificationsPopover() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setItems(d.notifications ?? []));
  }, []);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="relative flex size-9 items-center justify-center rounded-xl bg-surface-2 border border-border text-ink-2 hover:text-ink-1 hover:bg-surface-3 transition-colors focus-ring">
          <Bell className="size-[17px]" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-danger-500 text-[9px] font-bold text-white">
              {items.length > 9 ? "9+" : items.length}
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          className="z-50 w-[360px] rounded-2xl glass-strong shadow-elevated animate-fade-in"
        >
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border-subtle">
            <h3 className="text-card-title">Notifications</h3>
            <span className="text-meta">{items.length} active</span>
          </div>
          <div className="max-h-[360px] overflow-y-auto p-2">
            {items.length === 0 ? (
              <p className="text-secondary text-center py-8">You&apos;re all caught up.</p>
            ) : (
              items.map((n) => {
                const Icon = ICONS[n.type];
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 rounded-xl px-2.5 py-2.5 hover:bg-surface-2 transition-colors"
                  >
                    <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", TONE_CLASSES[n.severity])}>
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] text-ink-1">{n.title}</p>
                      <p className="text-[12px] text-ink-4 truncate">{n.description}</p>
                      <p className="text-[11px] text-ink-4 mt-0.5">{formatDateTime(n.date)}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
