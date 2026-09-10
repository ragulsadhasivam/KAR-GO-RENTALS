"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  LayoutDashboard,
  CalendarRange,
  Car,
  Wallet,
  Users,
  Wrench,
  ShieldAlert,
  FileText,
  BarChart3,
  Bell,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "./LogoMark";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookings", label: "Bookings", icon: CalendarRange },
  { href: "/cars", label: "Cars", icon: Car },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/service", label: "Service", icon: Wrench },
  { href: "/damage", label: "Damage & Incidents", icon: ShieldAlert },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav({ businessName }: { businessName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="lg:hidden flex size-9 items-center justify-center rounded-xl bg-surface-2 border border-border text-ink-2 focus-ring">
          <Menu className="size-[18px]" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" />
        <Dialog.Content className="fixed left-0 top-0 z-50 h-full w-[260px] glass-strong border-r border-border p-4 lg:hidden animate-slide-in">
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <div className="flex items-center gap-2.5 px-2 h-14">
            <LogoMark className="h-7 w-[68px]" />
            <span className="text-[14px] font-semibold text-ink-1 truncate min-w-0 flex-1">{businessName}</span>
          </div>
          <nav className="mt-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 h-10 text-[13.5px] font-medium transition-colors",
                    active ? "bg-surface-3 text-ink-1" : "text-ink-3 hover:bg-surface-2 hover:text-ink-1"
                  )}
                >
                  <Icon className={cn("size-[18px]", active && "text-gold-400")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
