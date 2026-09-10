import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const vehicleId = req.nextUrl.searchParams.get("vehicleId");
  const type = req.nextUrl.searchParams.get("type");

  const documents = await prisma.vehicleDocument.findMany({
    where: {
      vehicleId: vehicleId || undefined,
      type: type && type !== "ALL" ? type : undefined,
    },
    include: { vehicle: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ documents });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.vehicleId || !body.type) {
    return NextResponse.json({ error: "Vehicle and document type are required." }, { status: 400 });
  }

  const document = await prisma.vehicleDocument.create({
    data: {
      vehicleId: body.vehicleId,
      type: body.type,
      documentName: body.documentName || null,
      documentNumber: body.documentNumber || null,
      issuer: body.issuer || null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      premium: body.premium ? Number(body.premium) : null,
      fileUrl: body.fileUrl || null,
      fileName: body.fileName || null,
      fileType: body.fileType || null,
    },
  });
  return NextResponse.json({ document }, { status: 201 });
}
