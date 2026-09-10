import { NotificationsPopover } from "./NotificationsPopover";
import { AdminMenu } from "./AdminMenu";
import { MobileNav } from "./MobileNav";

export function Header({
  businessName,
  admin,
}: {
  businessName: string;
  admin: { name: string; email: string; photoUrl?: string | null };
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border-subtle bg-base/80 backdrop-blur-xl px-4 sm:px-6">
      <MobileNav businessName={businessName} />
      <div className="flex-1" />
      <div className="flex items-center gap-2.5 sm:gap-3">
        <NotificationsPopover />
        <div className="hidden sm:block h-6 w-px bg-border-subtle" />
        <AdminMenu name={admin.name} email={admin.email} photoUrl={admin.photoUrl} />
      </div>
    </header>
  );
}
