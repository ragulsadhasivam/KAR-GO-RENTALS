"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
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
];

const BOTTOM_ITEMS = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ businessName }: { businessName: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col shrink-0 border-r border-border-subtle bg-surface/60 backdrop-blur-xl transition-[width] duration-150 ease-out",
        collapsed ? "w-[76px]" : "w-[320px]"
      )}
    >
      <div className={cn("flex items-center h-16 shrink-0 px-4 gap-2", collapsed && "justify-center px-3")}>
        <LogoMark className={collapsed ? "h-8 w-[52px]" : "h-6 w-[128px]"} />
        {!collapsed && (
          <span className="text-[13px] font-semibold tracking-tight text-ink-1 truncate flex-1 min-w-0">{businessName}</span>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-ink-4 hover:text-ink-1 hover:bg-surface-2 transition-colors focus-ring"
          >
            <PanelLeftClose className="size-4" />
          </button>
        )}
      </div>
      {collapsed && (
        <div className="flex justify-center pb-2">
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="flex size-7 items-center justify-center rounded-lg text-ink-4 hover:text-ink-1 hover:bg-surface-2 transition-colors focus-ring"
          >
            <PanelLeftOpen className="size-4" />
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} collapsed={collapsed} />
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border-subtle space-y-1">
        {BOTTOM_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} collapsed={collapsed} />
        ))}
      </div>
    </aside>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: { href: string; label: string; icon: any };
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 h-10 text-[13.5px] font-medium transition-all duration-150",
        collapsed && "justify-center px-0",
        active
          ? "bg-surface-3 text-ink-1 shadow-[inset_0_0_0_1px_var(--color-gold-500)/30] ring-1 ring-gold-500/25"
          : "text-ink-3 hover:text-ink-1 hover:bg-surface-2"
      )}
      title={collapsed ? item.label : undefined}
    >
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-gradient-to-b from-gold-400 to-gold-600" />}
      <Icon className={cn("size-[18px] shrink-0", active && "text-gold-400")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
