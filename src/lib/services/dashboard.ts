import { prisma } from "@/lib/prisma";
import { getFinanceSummary, todayRange, monthRange } from "@/lib/services/finance";
import { getServiceReminderStatus } from "@/lib/services/serviceReminder";
import { startOfDay, endOfDay } from "date-fns";

export async function getDashboardData() {
  const vehicles = await prisma.vehicle.findMany({
    where: { archived: false },
    include: { pricing: true },
    orderBy: { createdAt: "asc" },
  });

  const today = todayRange();
  const month = monthRange();

  const [totalCars, available, booked, active, todayFinance, monthFinance] = await Promise.all([
    prisma.vehicle.count({ where: { archived: false } }),
    prisma.vehicle.count({ where: { archived: false, status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { archived: false, status: "BOOKED" } }),
    prisma.vehicle.count({ where: { archived: false, status: "ACTIVE" } }),
    getFinanceSummary(today.start, today.end),
    getFinanceSummary(month.start, month.end),
  ]);

  const vehiclePerf = await Promise.all(
    vehicles.map(async (v) => {
      const finance = await getFinanceSummary(month.start, month.end, v.id);
      const nextBooking = await prisma.booking.findFirst({
        where: { vehicleId: v.id, status: "BOOKED", pickupAt: { gte: new Date() } },
        orderBy: { pickupAt: "asc" },
        include: { customer: true },
      });
      return {
        vehicle: v,
        ...finance,
        nextBooking: nextBooking
          ? { customerName: nextBooking.customer.fullName, pickupAt: nextBooking.pickupAt }
          : null,
      };
    })
  );

  const now = new Date();
  const todaysBookings = await prisma.booking.findMany({
    where: {
      OR: [
        { pickupAt: { gte: startOfDay(now), lte: endOfDay(now) } },
        { returnAt: { gte: startOfDay(now), lte: endOfDay(now) } },
      ],
    },
    include: { customer: true, vehicle: true },
  });

  const schedule = todaysBookings
    .flatMap((b) => {
      const items: { time: Date; label: string; customer: string; vehicle: string; status: string; href: string }[] = [];
      if (b.pickupAt >= startOfDay(now) && b.pickupAt <= endOfDay(now)) {
        items.push({
          time: b.pickupAt,
          label: b.status === "ACTIVE" || b.status === "RETURNED" ? "Picked up" : "Pickup",
          customer: b.customer.fullName,
          vehicle: `${b.vehicle.make} ${b.vehicle.model}`,
          status: b.status,
          href: `/bookings/${b.id}`,
        });
      }
      if (b.returnAt >= startOfDay(now) && b.returnAt <= endOfDay(now)) {
        items.push({
          time: b.returnAt,
          label: b.status === "RETURNED" ? "Returned" : "Return",
          customer: b.customer.fullName,
          vehicle: `${b.vehicle.make} ${b.vehicle.model}`,
          status: b.status,
          href: `/bookings/${b.id}`,
        });
      }
      return items;
    })
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  const pendingCandidates = await prisma.booking.findMany({
    where: { status: { in: ["ACTIVE", "RETURNED"] } },
    include: { customer: true, vehicle: true, payments: true },
    orderBy: { returnAt: "asc" },
  });
  const paymentPending = pendingCandidates
    .map((b) => {
      const paid = b.payments.reduce((s, p) => s + p.amount, 0);
      const balance = b.totalAmount - paid;
      return { booking: b, paid, balance };
    })
    .filter((p) => p.balance > 0.5);

  const serviceDue = await Promise.all(
    vehicles.map(async (v) => {
      const last = await prisma.serviceRecord.findFirst({ where: { vehicleId: v.id }, orderBy: [{ date: "desc" }, { createdAt: "desc" }] });
      const { status, reason } = getServiceReminderStatus({
        nextServiceDate: last?.nextServiceDate ?? null,
        nextServiceKm: last?.nextServiceKm ?? null,
        currentKm: v.currentKm,
      });
      return { vehicle: v, status, reason, nextServiceDate: last?.nextServiceDate ?? null, nextServiceKm: last?.nextServiceKm ?? null };
    })
  ).then((rows) =>
    rows.filter(
      (r): r is typeof r & { status: "DUE" | "OVERDUE" } => r.status === "DUE" || r.status === "OVERDUE"
    )
  );

  return {
    vehicles,
    kpis: {
      totalCars,
      available,
      booked,
      active,
      todayRevenue: todayFinance.revenue,
      monthProfit: monthFinance.profit,
    },
    vehiclePerf,
    schedule,
    paymentPending,
    serviceDue,
  };
}
