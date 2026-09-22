import { redirect } from "next/navigation";
import { getSessionAdminId } from "@/lib/auth";

export default async function RootPage() {
  const adminId = await getSessionAdminId();
  redirect(adminId ? "/dashboard" : "/login");
}
