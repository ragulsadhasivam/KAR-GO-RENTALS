import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export default async function RootPage() {
  const business = await prisma.business.findFirst();
  if (!business?.setupCompletedAt) {
    redirect("/setup");
  }
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/login");
  }
  redirect("/dashboard");
}
