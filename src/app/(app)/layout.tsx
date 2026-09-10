import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [admin, business] = await Promise.all([getCurrentAdmin(), prisma.business.findFirst()]);

  if (!business?.setupCompletedAt) redirect("/setup");
  if (!admin) redirect("/login");

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      <AmbientBackground />
      <Sidebar businessName={business.name} />
      <div className="flex flex-1 flex-col min-w-0">
        <Header businessName={business.name} admin={{ name: admin.name, email: admin.email, photoUrl: admin.photoUrl }} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
