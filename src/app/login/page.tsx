import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const business = await prisma.business.findFirst();
  if (!business?.setupCompletedAt) {
    redirect("/setup");
  }
  const admin = await getCurrentAdmin();
  if (admin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-base relative overflow-hidden flex items-center justify-center px-6">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[700px] rounded-full bg-gold-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 size-[500px] rounded-full bg-blue-500/10 blur-[140px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.png" alt={business.name} className="mx-auto w-full max-w-[220px] mb-6" />
          <h1 className="text-page-title">Welcome back</h1>
          <p className="text-body mt-2">Sign in to manage your fleet.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
