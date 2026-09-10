import { differenceInDays } from "date-fns";

export type ServiceReminderStatus = "SCHEDULED" | "DUE" | "OVERDUE";
export type ServiceReminderReason = "DATE" | "KM" | "BOTH";

export interface ServiceReminderResult {
  status: ServiceReminderStatus | null; // null = no next-service thresholds set at all
  reason: ServiceReminderReason | null;
}

const OVERDUE_DAYS_GRACE = 14;
const OVERDUE_KM_GRACE = 1000;

/**
 * Single source of truth for "is this vehicle due for service" — OR logic:
 * whichever threshold (date or KM) is reached first triggers it. `currentKm`
 * must be the vehicle's own running odometer (Vehicle.currentKm), which is
 * already kept up to date by handover/return — no separate odometer state.
 */
export function getServiceReminderStatus(params: {
  nextServiceDate?: Date | null;
  nextServiceKm?: number | null;
  currentKm: number;
  now?: Date;
}): ServiceReminderResult {
  const { nextServiceDate, nextServiceKm, currentKm } = params;
  const now = params.now ?? new Date();

  if (!nextServiceDate && nextServiceKm == null) {
    return { status: null, reason: null };
  }

  const dateReached = !!nextServiceDate && now >= nextServiceDate;
  const kmReached = nextServiceKm != null && currentKm >= nextServiceKm;

  if (!dateReached && !kmReached) {
    return { status: "SCHEDULED", reason: null };
  }

  const reason: ServiceReminderReason = dateReached && kmReached ? "BOTH" : dateReached ? "DATE" : "KM";

  const dateOverdue = !!nextServiceDate && differenceInDays(now, nextServiceDate) > OVERDUE_DAYS_GRACE;
  const kmOverdue = nextServiceKm != null && currentKm - nextServiceKm > OVERDUE_KM_GRACE;

  return { status: dateOverdue || kmOverdue ? "OVERDUE" : "DUE", reason };
}

export function serviceReminderMessage(reason: ServiceReminderReason | null): string {
  if (reason === "DATE") return "Next service is due by date.";
  if (reason === "KM") return "Next service is due by KM.";
  if (reason === "BOTH") return "Service is due.";
  return "";
}
