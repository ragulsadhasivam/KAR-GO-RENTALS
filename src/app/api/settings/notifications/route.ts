import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const data: any = {};
  for (const key of ["notifyBookings", "notifyPayments", "notifyDocuments", "notifyService"]) {
    if (body[key] !== undefined) data[key] = !!body[key];
  }
  if (body.documentReminderDays !== undefined) data.documentReminderDays = Number(body.documentReminderDays);

  const business = await prisma.business.update({ where: { id: "business" }, data });
  return NextResponse.json({ business });
}
