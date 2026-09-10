import { differenceInCalendarDays } from "date-fns";
import type { DocumentStatus } from "@/lib/constants";

export function getDocumentStatus(
  expiryDate: Date | string | null | undefined,
  thresholdDays = 30
): DocumentStatus {
  if (!expiryDate) return "NO_EXPIRY";
  const expiry = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  const daysLeft = differenceInCalendarDays(expiry, new Date());
  if (daysLeft < 0) return "EXPIRED";
  if (daysLeft <= thresholdDays) return "EXPIRING_SOON";
  return "VALID";
}

export function daysUntil(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return differenceInCalendarDays(d, new Date());
}
