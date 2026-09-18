"use client";

import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface FieldWrapProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldWrap({ label, error, hint, required, children, className }: FieldWrapProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-[13px] font-medium text-ink-2">
          {label} {required && <span className="text-danger-400">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="text-[12px] text-danger-400">{error}</span>
      ) : hint ? (
        <span className="text-[12px] text-ink-4">{hint}</span>
      ) : null}
    </div>
  );
}

const inputBase =
  "h-10 w-full rounded-lg bg-surface-2 border px-3.5 text-[14px] text-ink-1 placeholder:text-ink-4 transition-colors duration-150 focus-ring outline-none";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  wrapClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, className, wrapClassName, ...props }, ref) => (
    <FieldWrap label={label} error={error} hint={hint} required={required} className={wrapClassName}>
      <input
        ref={ref}
        className={cn(
          inputBase,
          error ? "border-danger-500/60" : "border-border hover:border-border-strong focus:border-gold-500/60",
          "[color-scheme:dark]",
          className
        )}
        {...props}
      />
    </FieldWrap>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, className, ...props }, ref) => (
    <FieldWrap label={label} error={error} hint={hint} required={required}>
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-lg bg-surface-2 border px-3.5 py-2.5 text-[14px] text-ink-1 placeholder:text-ink-4 transition-colors duration-150 focus-ring outline-none min-h-[88px] resize-y",
          error ? "border-danger-500/60" : "border-border hover:border-border-strong focus:border-gold-500/60",
          className
        )}
        {...props}
      />
    </FieldWrap>
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, required, className, placeholder, children, ...props }, ref) => (
    <FieldWrap label={label} error={error} hint={hint} required={required}>
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            inputBase,
            "appearance-none pr-9 cursor-pointer",
            error ? "border-danger-500/60" : "border-border hover:border-border-strong focus:border-gold-500/60",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-3"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </FieldWrap>
  )
);
Select.displayName = "Select";
