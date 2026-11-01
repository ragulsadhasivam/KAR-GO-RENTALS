import { getCurrentAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getNotifications } from "@/lib/services/notifications";

export async function GET() {
  if (!(await getCurrentAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const notifications = await getNotifications();
  return NextResponse.json({ notifications });
}
