import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Wrench,
  CircleDot,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "info" | "warning" | "danger" | "neutral";

const toneClasses: Record<Tone, string> = {
  success: "bg-success-500/12 text-success-300 border-success-500/25",
  info: "bg-blue-500/12 text-blue-300 border-blue-500/25",
  warning: "bg-warning-500/12 text-warning-300 border-warning-500/25",
  danger: "bg-danger-500/12 text-danger-300 border-danger-500/25",
  neutral: "bg-surface-3 text-ink-3 border-border",
};

const STATUS_CONFIG: Record<string, { label: string; tone: Tone; icon: LucideIcon }> = {
  AVAILABLE: { label: "Available", tone: "success", icon: CheckCircle2 },
  BOOKED: { label: "Booked", tone: "warning", icon: Clock },
  ACTIVE: { label: "Active", tone: "info", icon: CircleDot },
  SERVICE: { label: "In Service", tone: "neutral", icon: Wrench },
  RETURNED: { label: "Returned", tone: "neutral", icon: CheckCircle2 },
  VALID: { label: "Valid", tone: "success", icon: CheckCircle2 },
  EXPIRING_SOON: { label: "Expiring Soon", tone: "warning", icon: AlertTriangle },
  EXPIRED: { label: "Expired", tone: "danger", icon: XCircle },
  NO_EXPIRY: { label: "No Expiry", tone: "neutral", icon: CheckCircle2 },
  REPORTED: { label: "Reported", tone: "danger", icon: AlertTriangle },
  UNDER_REPAIR: { label: "Under Repair", tone: "warning", icon: Wrench },
  COMPLETED: { label: "Completed", tone: "success", icon: CheckCircle2 },
};

export function StatusPill({
  status,
  className,
  size = "md",
}: {
  status: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const config = STATUS_CONFIG[status] ?? { label: status, tone: "neutral" as Tone, icon: CircleDot };
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]",
        toneClasses[config.tone],
        className
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} />
      {config.label}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
