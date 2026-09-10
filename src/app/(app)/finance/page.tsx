import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getFinanceSummary, monthRange } from "@/lib/services/finance";
import { FinancePageClient } from "./FinancePageClient";

export default async function FinancePage() {
  const month = monthRange();
  const [summary, expenses, payments, transactions, admins, vehicles] = await Promise.all([
    getFinanceSummary(month.start, month.end),
    prisma.expense.findMany({ include: { vehicle: true }, orderBy: { date: "desc" } }),
    prisma.payment.findMany({ include: { booking: { include: { customer: true } } }, orderBy: { date: "desc" } }),
    prisma.partnerTransaction.findMany({ include: { partner: true }, orderBy: { date: "desc" } }),
    prisma.admin.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.vehicle.findMany({ where: { archived: false } }),
  ]);

  return (
    <Suspense>
      <FinancePageClient
        summary={summary}
        expenses={expenses}
        payments={payments}
        transactions={transactions}
        admins={admins}
        vehicles={vehicles}
      />
    </Suspense>
  );
}
