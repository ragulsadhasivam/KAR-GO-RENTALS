import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LandingPage } from "@/components/marketing/LandingPage";

export const metadata: Metadata = {
  title: "KAR GO RENTALS — Premium Self-Drive Car Rentals",
  description:
    "Verified, fully-insured self-drive cars delivered to your door. Transparent pricing, 24/7 support, and a fleet built for every trip.",
};

export default async function RootPage() {
  const adminId = await getSessionAdminId();

  const business = await prisma.business.findFirst();
  if (!business?.setupCompletedAt) {
    redirect(adminId ? "/dashboard" : "/login");
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { archived: false },
    include: { pricing: true },
    orderBy: { createdAt: "asc" },
    take: 6,
  });

  return (
    <LandingPage
      isAuthenticated={!!adminId}
      businessName={business.name}
      email={business.email}
      address={business.address}
      city={business.city}
      state={business.state}
      vehicles={vehicles.map((v) => ({
        id: v.id,
        make: v.make,
        model: v.model,
        variant: v.variant,
        fuelType: v.fuelType,
        imageUrl: v.imageUrl,
        dailyRate: v.pricing?.dailyRate ?? null,
      }))}
    />
  );
}
