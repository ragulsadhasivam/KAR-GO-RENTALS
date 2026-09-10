import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eachDayOfInterval, startOfDay, endOfDay, subDays, format } from "date-fns";

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get("range") ?? "30d";
  const vehicleId = req.nextUrl.searchParams.get("vehicleId") ?? undefined;
  const customStart = req.nextUrl.searchParams.get("start");
  const customEnd = req.nextUrl.searchParams.get("end");

  let start: Date, end: Date;
  const now = new Date();
  if (range === "custom" && customStart && customEnd) {
    start = startOfDay(new Date(customStart));
    end = endOfDay(new Date(customEnd));
  } else {
    const days = range === "7d" ? 7 : range === "3m" ? 90 : 30;
    start = startOfDay(subDays(now, days - 1));
    end = endOfDay(now);
  }

  const [payments, expenses] = await Promise.all([
    prisma.payment.findMany({
      where: { date: { gte: start, lte: end }, booking: vehicleId ? { vehicleId } : undefined },
      select: { date: true, amount: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: start, lte: end }, ...(vehicleId ? { vehicleId } : {}) },
      select: { date: true, amount: true },
    }),
  ]);

  const days = eachDayOfInterval({ start, end });
  const data = days.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const revenue = payments
      .filter((p) => format(p.date, "yyyy-MM-dd") === key)
      .reduce((s, p) => s + p.amount, 0);
    const expense = expenses
      .filter((e) => format(e.date, "yyyy-MM-dd") === key)
      .reduce((s, e) => s + e.amount, 0);
    return {
      date: format(day, "dd MMM"),
      revenue,
      expenses: expense,
      profit: revenue - expense,
    };
  });

  return NextResponse.json({ data });
}
