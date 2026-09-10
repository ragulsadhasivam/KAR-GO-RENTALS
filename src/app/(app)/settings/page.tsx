import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { SettingsPageClient } from "./SettingsPageClient";

export default async function SettingsPage() {
  const [business, admins, vehicles, currentAdmin] = await Promise.all([
    prisma.business.findFirst(),
    prisma.admin.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.vehicle.findMany({ include: { pricing: true }, orderBy: { createdAt: "asc" } }),
    getCurrentAdmin(),
  ]);

  const safeAdmins = admins.map(({ passwordHash, ...a }) => a);

  return (
    <Suspense>
      <SettingsPageClient
        business={business}
        admins={safeAdmins}
        vehicles={vehicles}
        currentAdminId={currentAdmin?.id}
      />
    </Suspense>
  );
}
