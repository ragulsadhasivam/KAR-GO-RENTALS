import { prisma } from "@/lib/prisma";
import { getUtilisation } from "@/lib/services/finance";

export async function getReportsSummary(start: Date, end: Date) {
  const [payments, expenses, bookings, vehicles] = await Promise.all([
    prisma.payment.findMany({ where: { date: { gte: start, lte: end } } }),
    prisma.expense.findMany({ where: { date: { gte: start, lte: end } } }),
    // A booking is "in range" if it was picked up in the window, or actually
    // returned in the window (there's no longer a committed returnAt to
    // filter on up front — see rentalBilling.ts).
    prisma.booking.findMany({
      where: {
        OR: [{ pickupAt: { gte: start, lte: end } }, { vehicleReturn: { returnAt: { gte: start, lte: end } } }],
      },
      include: { vehicle: true, vehicleReturn: true },
    }),
    prisma.vehicle.findMany({ where: { archived: false } }),
  ]);

  const revenue = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const fuelCost = expenses.filter((e) => e.category === "FUEL").reduce((s, e) => s + e.amount, 0);
  const serviceCost = expenses.filter((e) => e.category === "SERVICE_MAINTENANCE").reduce((s, e) => s + e.amount, 0);
  // rentalDays is only meaningful for completed rentals (the value is 0 until
  // a booking is returned), so only RETURNED bookings contribute.
  const rentalDays = bookings.filter((b) => b.status === "RETURNED").reduce((s, b) => s + b.rentalDays, 0);

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
        rentalDays: vBookings.filter((b) => b.status === "RETURNED").reduce((s, b) => s + b.rentalDays, 0),
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
