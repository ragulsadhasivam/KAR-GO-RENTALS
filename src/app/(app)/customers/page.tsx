import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CustomersPageClient } from "./CustomersPageClient";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: { bookings: { include: { payments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Suspense>
      <CustomersPageClient customers={customers} />
    </Suspense>
  );
}
