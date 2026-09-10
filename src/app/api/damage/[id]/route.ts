import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  for (const key of ["status", "description", "notes"]) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  for (const key of ["estimatedRepairCost", "actualRepairCost", "customerCharge"]) {
    if (body[key] !== undefined) data[key] = body[key] === null ? null : Number(body[key]);
  }
  const incident = await prisma.damageIncident.update({ where: { id }, data });
  return NextResponse.json({ incident });
}
