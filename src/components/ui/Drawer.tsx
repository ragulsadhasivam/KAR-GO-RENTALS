"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
}

const widthClasses = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

export function Drawer({ open, onOpenChange, title, description, children, footer, width = "md" }: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            "fixed right-0 top-0 z-50 h-full w-full glass-strong border-l border-border shadow-elevated",
            "flex flex-col focus:outline-none animate-slide-in",
            widthClasses[width]
          )}
        >
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-border-subtle shrink-0">
            <div>
              <Dialog.Title className="text-section-title">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="text-secondary mt-1">{description}</Dialog.Description>
              )}
            </div>
            <Dialog.Close className="rounded-lg p-1.5 text-ink-3 hover:bg-surface-2 hover:text-ink-1 transition-colors focus-ring">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <div className="px-6 py-5 overflow-y-auto grow">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-subtle shrink-0">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
