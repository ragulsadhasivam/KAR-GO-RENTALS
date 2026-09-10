import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, differenceInCalendarDays, max, min } from "date-fns";

export async function getRevenue(start: Date, end: Date, vehicleId?: string) {
  const result = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      date: { gte: start, lte: end },
      booking: vehicleId ? { vehicleId } : undefined,
    },
  });
  return result._sum.amount ?? 0;
}

export async function getExpenses(start: Date, end: Date, vehicleId?: string) {
  const result = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: {
      date: { gte: start, lte: end },
      ...(vehicleId ? { vehicleId } : {}),
    },
  });
  return result._sum.amount ?? 0;
}

export async function getFinanceSummary(start: Date, end: Date, vehicleId?: string) {
  const [revenue, expenses] = await Promise.all([
    getRevenue(start, end, vehicleId),
    getExpenses(start, end, vehicleId),
  ]);
  return { revenue, expenses, profit: revenue - expenses };
}

export async function getUtilisation(vehicleId: string, start: Date, end: Date) {
  const bookings = await prisma.booking.findMany({
    where: {
      vehicleId,
      status: { in: ["ACTIVE", "RETURNED"] },
      pickupAt: { lte: end },
      returnAt: { gte: start },
    },
    select: { pickupAt: true, returnAt: true },
  });

  const totalDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
  let bookedDays = 0;
  for (const b of bookings) {
    const from = max([b.pickupAt, start]);
    const to = min([b.returnAt, end]);
    bookedDays += Math.max(0, differenceInCalendarDays(to, from) + 1);
  }
  return Math.min(100, Math.round((bookedDays / totalDays) * 100));
}

export function todayRange() {
  const now = new Date();
  return { start: startOfDay(now), end: endOfDay(now) };
}

export function monthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}
