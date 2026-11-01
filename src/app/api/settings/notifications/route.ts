import { getCurrentAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  if (!(await getCurrentAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  for (const key of ["notifyBookings", "notifyPayments", "notifyDocuments", "notifyService"]) {
    if (body[key] !== undefined) data[key] = !!body[key];
  }
  if (body.documentReminderDays !== undefined) data.documentReminderDays = Number(body.documentReminderDays);

  const business = await prisma.business.update({ where: { id: "business" }, data });
  return NextResponse.json({ business });
}
