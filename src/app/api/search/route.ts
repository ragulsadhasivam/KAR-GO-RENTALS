import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vehicleName } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const [bookings, customers, vehicles] = await Promise.all([
    prisma.booking.findMany({
      where: {
        OR: [
          { code: { contains: q } },
          { customer: { fullName: { contains: q } } },
          { customer: { mobile: { contains: q } } },
        ],
      },
      include: { customer: true, vehicle: true },
      take: 5,
    }),
    prisma.customer.findMany({
      where: { OR: [{ fullName: { contains: q } }, { mobile: { contains: q } }] },
      take: 5,
    }),
    prisma.vehicle.findMany({
      where: {
        OR: [
          { make: { contains: q } },
          { model: { contains: q } },
          { registrationNumber: { contains: q } },
        ],
      },
      take: 5,
    }),
  ]);

  const results = [
    ...bookings.map((b) => ({
      type: "booking" as const,
      id: b.id,
      title: b.code,
      subtitle: `${b.customer.fullName} — ${vehicleName(b.vehicle)}`,
      href: `/bookings/${b.id}`,
    })),
    ...customers.map((c) => ({
      type: "customer" as const,
      id: c.id,
      title: c.fullName,
      subtitle: c.mobile,
      href: `/customers/${c.id}`,
    })),
    ...vehicles.map((v) => ({
      type: "vehicle" as const,
      id: v.id,
      title: vehicleName(v),
      subtitle: v.registrationNumber,
      href: `/cars/${v.id}`,
    })),
  ];

  return NextResponse.json({ results });
}
