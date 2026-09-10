import { type LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="rounded-2xl border border-border-subtle bg-surface-2 p-4 mb-4">
        <Icon className="size-6 text-ink-3" />
      </div>
      <h3 className="text-card-title mb-1">{title}</h3>
      {description && <p className="text-secondary max-w-sm mb-5">{description}</p>}
      {action}
    </div>
  );
}
