import { prisma } from "@/lib/prisma";
import { getUtilisation } from "@/lib/services/finance";

export async function getReportsSummary(start: Date, end: Date) {
  const [payments, expenses, bookings, vehicles] = await Promise.all([
    prisma.payment.findMany({ where: { date: { gte: start, lte: end } } }),
    prisma.expense.findMany({ where: { date: { gte: start, lte: end } } }),
    prisma.booking.findMany({
      where: { pickupAt: { lte: end }, returnAt: { gte: start } },
      include: { vehicle: true },
    }),
    prisma.vehicle.findMany({ where: { archived: false } }),
  ]);

  const revenue = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const fuelCost = expenses.filter((e) => e.category === "FUEL").reduce((s, e) => s + e.amount, 0);
  const serviceCost = expenses.filter((e) => e.category === "SERVICE_MAINTENANCE").reduce((s, e) => s + e.amount, 0);
  const rentalDays = bookings.reduce((s, b) => s + b.rentalDays, 0);

  const vehiclePerformance = await Promise.all(
    vehicles.map(async (v) => {
      const vRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { date: { gte: start, lte: end }, booking: { vehicleId: v.id } },
      });
      const vExpenses = expenses.filter((e) => e.vehicleId === v.id).reduce((s, e) => s + e.amount, 0);
      const utilisation = await getUtilisation(v.id, start, end);
      const vBookings = bookings.filter((b) => b.vehicleId === v.id);
      return {
        vehicle: v,
        revenue: vRevenue._sum.amount ?? 0,
        expenses: vExpenses,
        profit: (vRevenue._sum.amount ?? 0) - vExpenses,
        utilisation,
        bookings: vBookings.length,
        rentalDays: vBookings.reduce((s, b) => s + b.rentalDays, 0),
      };
    })
  );

  return {
    revenue,
    expenses: totalExpenses,
    profit: revenue - totalExpenses,
    bookingsCount: bookings.length,
    rentalDays,
    fuelCost,
    serviceCost,
    vehiclePerformance,
  };
}
