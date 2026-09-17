/**
 * Single source of truth for rental duration and billing math. Every screen
 * that shows or charges for rental duration (booking detail, return drawer,
 * dashboard, reports, customer history) must go through these two functions
 * instead of re-deriving the numbers locally.
 */

export interface RentalDuration {
  /** Complete 24-hour periods. */
  days: number;
  /** Whole hours left over after `days` (display only). */
  hours: number;
  /** Minutes left over after `hours` (display only). */
  minutes: number;
  /**
   * Billable hours for the leftover time: any partial hour is rounded UP to
   * the next full hour. This is the app's one defined partial-hour rule —
   * used everywhere extra-hour charges are computed, never re-decided
   * per-screen. A leftover of 0 minutes bills 0 extra hours.
   */
  billableHours: number;
  totalMinutes: number;
}

/**
 * Precise pickup -> return duration. Deliberately NOT `Math.ceil(totalHours / 24)`
 * — that would turn "2 Days 1 Hour" into "3 Days". Complete days are counted
 * first via floor, then the remainder is expressed as hours/minutes.
 */
export function calculateRentalDuration(pickupAt: Date, returnAt: Date): RentalDuration {
  const totalMinutes = Math.max(0, Math.round((returnAt.getTime() - pickupAt.getTime()) / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const remainderMinutes = totalMinutes - days * 1440;
  const hours = Math.floor(remainderMinutes / 60);
  const minutes = remainderMinutes % 60;
  const billableHours = Math.ceil(remainderMinutes / 60);
  return { days, hours, minutes, billableHours, totalMinutes };
}

export function formatDuration(d: RentalDuration): string {
  const parts: string[] = [];
  if (d.days > 0) parts.push(`${d.days} Day${d.days === 1 ? "" : "s"}`);
  if (d.hours > 0) parts.push(`${d.hours} Hour${d.hours === 1 ? "" : "s"}`);
  if (d.minutes > 0) parts.push(`${d.minutes} Minute${d.minutes === 1 ? "" : "s"}`);
  if (parts.length === 0) return "0 Minutes";
  return parts.join(" ");
}

export interface RentalBillInput {
  pickupAt: Date;
  returnAt: Date;
  dailyRate: number;
  extraHourRate: number;
  extraKmRate: number;
  extraKm?: number;
  damageCharge?: number;
  otherPenalty?: number;
  discount?: number;
}

export interface RentalBillResult {
  duration: RentalDuration;
  baseRental: number;
  extraHourCharge: number;
  extraKmCharge: number;
  damageCharge: number;
  otherPenalty: number;
  discount: number;
  /** Base Rental + Extra Hour + Extra KM + Damage + Penalty - Discount, floored at 0. */
  finalTotal: number;
}

/**
 * Base Rental + Extra Hour Charges + Extra KM Charges + Damage Charge
 * + Other Penalty - Discount = Final Total. Always recomputed from scratch
 * (never incrementally adjusted) so it can never double-count or silently
 * drop a component.
 */
export function calculateRentalBill(input: RentalBillInput): RentalBillResult {
  const duration = calculateRentalDuration(input.pickupAt, input.returnAt);
  const baseRental = duration.days * input.dailyRate;
  const extraHourCharge = duration.billableHours * input.extraHourRate;
  const extraKmCharge = (input.extraKm ?? 0) * input.extraKmRate;
  const damageCharge = input.damageCharge ?? 0;
  const otherPenalty = input.otherPenalty ?? 0;
  const discount = input.discount ?? 0;
  const rawTotal = baseRental + extraHourCharge + extraKmCharge + damageCharge + otherPenalty - discount;
  const finalTotal = Math.max(0, Math.round(rawTotal * 100) / 100);
  return { duration, baseRental, extraHourCharge, extraKmCharge, damageCharge, otherPenalty, discount, finalTotal };
}
