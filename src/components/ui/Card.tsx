import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "solid" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Card({
  className,
  variant = "solid",
  padding = "md",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border shadow-card",
        variant === "solid" && "bg-surface border-border-subtle",
        variant === "glass" && "glass rounded-2xl",
        paddingClasses[padding],
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-between gap-4 mb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-card-title", className)} {...props} />;
}
