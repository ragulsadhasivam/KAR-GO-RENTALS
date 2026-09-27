import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "warning";

const toneClasses: Record<Tone, string> = {
  neutral: "border-border-subtle bg-surface-2/50 hover:bg-surface-2",
  warning: "border-warning-500/15 bg-warning-500/5 hover:bg-warning-500/10",
};

/**
 * Shared row for the dashboard's "list card" pattern (Payment Pending, Service
 * Due): left content, an optional right-aligned two-line amount block, and a
 * trailing arrow — each in its own grid column so the arrow and amount stay
 * pinned to a dedicated position instead of drifting with content length.
 * A fixed min-height keeps every row the same size regardless of how much
 * text a given row has, so rows stay aligned to each other, not just
 * internally consistent.
 */
export function DashboardListRow({
  href,
  tone = "neutral",
  amount,
  children,
  className,
}: {
  href: string;
  tone?: Tone;
  amount?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "grid items-center gap-3 min-h-[52px] rounded-xl border px-3.5 py-2.5 transition-colors",
        amount ? "grid-cols-[minmax(0,1fr)_auto_auto]" : "grid-cols-[minmax(0,1fr)_auto]",
        toneClasses[tone],
        className
      )}
    >
      <div className="min-w-0">{children}</div>
      {amount && <div className="text-right shrink-0">{amount}</div>}
      <ArrowRight className="size-3.5 text-ink-4 shrink-0" />
    </Link>
  );
}
