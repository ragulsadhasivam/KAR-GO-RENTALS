import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const existing = await prisma.business.findFirst();
  if (existing?.setupCompletedAt) {
    return NextResponse.json({ error: "Setup has already been completed." }, { status: 400 });
  }

  const body = await req.json();
  const { business, admins, vehicles, documents, pricing } = body;

  if (!business?.name || !business?.phone || !business?.email || !business?.address || !business?.city) {
    return NextResponse.json({ error: "Business information is incomplete." }, { status: 400 });
  }
  if (!Array.isArray(admins) || admins.length < 2 || admins.some((a) => !a.name || !a.email || !a.password)) {
    return NextResponse.json({ error: "Both administrators must be filled in." }, { status: 400 });
  }
  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return NextResponse.json({ error: "Add at least one vehicle." }, { status: 400 });
  }

  const emails = admins.map((a) => a.email.toLowerCase());
  if (new Set(emails).size !== emails.length) {
    return NextResponse.json({ error: "Admin emails must be unique." }, { status: 400 });
  }

  try {
    const firstAdminId = await prisma.$transaction(async (tx) => {
      await tx.business.upsert({
        where: { id: "business" },
        create: {
          id: "business",
          name: business.name,
          logoUrl: business.logo?.url ?? null,
          phone: business.phone,
          whatsapp: business.whatsapp,
          email: business.email,
          address: business.address,
          city: business.city,
          state: business.state || "Tamil Nadu",
          setupCompletedAt: new Date(),
        },
        update: {
          name: business.name,
          logoUrl: business.logo?.url ?? null,
          phone: business.phone,
          whatsapp: business.whatsapp,
          email: business.email,
          address: business.address,
          city: business.city,
          state: business.state || "Tamil Nadu",
          setupCompletedAt: new Date(),
        },
      });

      let firstId = "";
      for (const [i, admin] of admins.entries()) {
        const created = await tx.admin.create({
          data: {
            name: admin.name,
            mobile: admin.mobile,
            email: admin.email.toLowerCase(),
            passwordHash: await hashPassword(admin.password),
            photoUrl: admin.photo?.url ?? null,
          },
        });
        if (i === 0) firstId = created.id;
      }

      for (const v of vehicles as any[]) {
        const vehicle = await tx.vehicle.create({
          data: {
            registrationNumber: v.registrationNumber.toUpperCase(),
            make: v.make,
            model: v.model,
            variant: v.variant || null,
            year: Number(v.year),
            colour: v.colour,
            fuelType: v.fuelType,
            purchaseDate: new Date(v.purchaseDate),
            purchasePrice: Number(v.purchasePrice),
            currentKm: Number(v.currentKm),
            imageUrl: `/vehicles/${v.key}.png`,
            status: "AVAILABLE",
          },
        });

        const p = pricing?.[v.key];
        if (p?.dailyRate) {
          await tx.vehiclePricing.create({
            data: {
              vehicleId: vehicle.id,
              dailyRate: Number(p.dailyRate),
              extraHourRate: Number(p.extraHourRate || 0),
              extraKmRate: Number(p.extraKmRate || 0),
            },
          });
        }

        const docs = documents?.[v.key];
        if (docs) {
          if (docs.rc?.number || docs.rc?.file) {
            await tx.vehicleDocument.create({
              data: {
                vehicleId: vehicle.id,
                type: "RC",
                documentNumber: docs.rc.number || null,
                startDate: docs.rc.registrationDate ? new Date(docs.rc.registrationDate) : null,
                fileUrl: docs.rc.file?.url ?? null,
                fileName: docs.rc.file?.fileName ?? null,
                fileType: docs.rc.file?.fileType ?? null,
              },
            });
          }
          if (docs.insurance?.policyNumber || docs.insurance?.file || docs.insurance?.expiryDate) {
            await tx.vehicleDocument.create({
              data: {
                vehicleId: vehicle.id,
                type: "INSURANCE",
                issuer: docs.insurance.company || null,
                documentNumber: docs.insurance.policyNumber || null,
                startDate: docs.insurance.startDate ? new Date(docs.insurance.startDate) : null,
                expiryDate: docs.insurance.expiryDate ? new Date(docs.insurance.expiryDate) : null,
                premium: docs.insurance.premium ? Number(docs.insurance.premium) : null,
                fileUrl: docs.insurance.file?.url ?? null,
                fileName: docs.insurance.file?.fileName ?? null,
                fileType: docs.insurance.file?.fileType ?? null,
              },
            });
          }
          if (docs.fc?.number || docs.fc?.file || docs.fc?.expiryDate) {
            await tx.vehicleDocument.create({
              data: {
                vehicleId: vehicle.id,
                type: "FC",
                documentNumber: docs.fc.number || null,
                startDate: docs.fc.startDate ? new Date(docs.fc.startDate) : null,
                expiryDate: docs.fc.expiryDate ? new Date(docs.fc.expiryDate) : null,
                fileUrl: docs.fc.file?.url ?? null,
                fileName: docs.fc.file?.fileName ?? null,
                fileType: docs.fc.file?.fileType ?? null,
              },
            });
          }
          if (docs.other?.name) {
            await tx.vehicleDocument.create({
              data: {
                vehicleId: vehicle.id,
                type: "OTHER",
                documentName: docs.other.name,
                expiryDate: docs.other.expiryDate ? new Date(docs.other.expiryDate) : null,
                fileUrl: docs.other.file?.url ?? null,
                fileName: docs.other.file?.fileName ?? null,
                fileType: docs.other.file?.fileType ?? null,
              },
            });
          }
        }
      }

      return firstId;
    });

    await createSession(firstAdminId);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "A vehicle registration number or admin email is already in use." },
        { status: 400 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Could not complete setup. Please try again." }, { status: 500 });
  }
}
