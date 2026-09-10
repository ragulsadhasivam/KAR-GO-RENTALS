"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex items-center gap-1 rounded-xl bg-surface-2 border border-border-subtle p-1",
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "relative rounded-lg px-4 h-8 text-[13px] font-medium text-ink-3 transition-colors duration-150",
        "hover:text-ink-1 focus-ring",
        "data-[state=active]:bg-surface-3 data-[state=active]:text-ink-1 data-[state=active]:shadow-[inset_0_0_0_1px_var(--color-border)]",
        className
      )}
      {...props}
    />
  );
}

export const TabsContent = TabsPrimitive.Content;
