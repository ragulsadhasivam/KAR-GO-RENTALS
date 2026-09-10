import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  for (const key of ["documentName", "documentNumber", "issuer", "fileUrl", "fileName", "fileType"]) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
  if (body.expiryDate !== undefined) data.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;
  if (body.premium !== undefined) data.premium = body.premium === null ? null : Number(body.premium);

  const document = await prisma.vehicleDocument.update({ where: { id }, data });
  return NextResponse.json({ document });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.vehicleDocument.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
