"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full bg-surface-3 border border-border transition-colors",
        "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-gold-500 data-[state=checked]:to-gold-600 data-[state=checked]:border-gold-500/50",
        "focus-ring",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-4 translate-x-1 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
    </SwitchPrimitive.Root>
  );
}
