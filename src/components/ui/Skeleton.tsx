import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2 bg-[length:200%_100%]",
        className
      )}
    />
  );
}

export function KPICardSkeleton() {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 flex items-start justify-between gap-3">
      <div className="flex flex-col gap-3 w-full">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-24" />
      </div>
      <Skeleton className="size-10 rounded-xl shrink-0" />
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border-subtle bg-surface p-6", className)}>
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-3 py-3.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20 ml-auto" />
        </div>
      ))}
    </div>
  );
}
