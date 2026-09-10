"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ open, onOpenChange, title, description, children, footer, size = "md" }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2",
            "glass-strong rounded-2xl shadow-elevated max-h-[88vh] flex flex-col",
            "data-[state=open]:animate-fade-in focus:outline-none",
            sizeClasses[size]
          )}
        >
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-border-subtle">
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
          <div className="px-6 py-5 overflow-y-auto">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-subtle">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
