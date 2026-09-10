import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SetupWizard } from "./SetupWizard";

export default async function SetupPage() {
  const business = await prisma.business.findFirst();
  if (business?.setupCompletedAt) {
    redirect("/login");
  }
  return <SetupWizard />;
}
