import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

interface KPICardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: "gold" | "blue" | "success" | "neutral";
  trend?: { value: string; positive: boolean } | null;
  className?: string;
}

const toneStyles = {
  gold: "text-gold-300 bg-gold-500/8 border-gold-500/15",
  blue: "text-blue-300 bg-blue-500/8 border-blue-500/15",
  success: "text-success-300 bg-success-500/8 border-success-500/15",
  neutral: "text-ink-3 bg-surface-3 border-border",
};

export function KPICard({ label, value, icon: Icon, tone = "neutral", trend, className }: KPICardProps) {
  return (
    <Card padding="sm" className={cn("flex items-start justify-between gap-2 sm:gap-3 sm:p-5", className)}>
      <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
        <span className="text-meta truncate">{label}</span>
        <span className="text-figure text-[19px] sm:text-[24px] lg:text-[28px] font-semibold text-ink-1 truncate">
          {value}
        </span>
        {trend && (
          <span className={cn("text-[12px] font-medium", trend.positive ? "text-success-400" : "text-danger-400")}>
            {trend.positive ? "+" : ""}
            {trend.value}
          </span>
        )}
      </div>
      {Icon && (
        <div className={cn("shrink-0 rounded-lg border p-2 sm:p-2.5", toneStyles[tone])}>
          <Icon className="size-4 sm:size-5" />
        </div>
      )}
    </Card>
  );
}
