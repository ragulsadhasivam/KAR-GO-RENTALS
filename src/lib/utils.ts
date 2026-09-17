import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${formatDate(d)}, ${formatTime(d)}`;
}

export function formatTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(d);
}

export function formatShortDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function vehicleName(v: { make: string; model: string }) {
  return `${v.make} ${v.model}`;
}

/**
 * A booking's totalAmount is only meaningful once it has been returned (the
 * final bill can't be known before then — see rentalBilling.ts), so payment
 * status must never be derived from totalAmount/paid alone without checking
 * status first. A vehicle being returned does not by itself mean fully paid.
 */
export function getPaymentStatus(
  status: string,
  totalAmount: number,
  paid: number
): { label: string; tone: "success" | "warning" | "danger" | "neutral" } {
  if (status !== "RETURNED") return { label: "Calculated at Return", tone: "neutral" };
  if (paid >= totalAmount - 0.5) return { label: "Fully Paid", tone: "success" };
  if (paid > 0) return { label: "Payment Pending", tone: "warning" };
  return { label: "Payment Pending", tone: "danger" };
}
