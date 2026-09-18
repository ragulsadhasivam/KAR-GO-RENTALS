"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-gold-400 to-gold-600 text-[#1a1409] font-semibold shadow-[0_1px_0_rgba(255,255,255,0.22)_inset] shadow-glow-gold hover:brightness-[1.05] active:brightness-95",
  secondary:
    "bg-surface-2 text-ink-1 border border-border hover:bg-surface-3 hover:border-border-strong active:bg-surface-2",
  outline:
    "bg-transparent text-ink-1 border border-border-strong hover:bg-surface-2",
  ghost: "bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink-1",
  danger:
    "bg-danger-500/15 text-danger-300 border border-danger-500/30 hover:bg-danger-500/25",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-lg",
  icon: "h-10 w-10 rounded-lg justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center font-medium transition-[background-color,border-color,box-shadow,filter,transform] duration-150 ease-out",
          "focus-ring disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap select-none active:scale-[0.98]",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
