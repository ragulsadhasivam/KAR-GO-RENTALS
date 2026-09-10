"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { initials, cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";

export function AdminMenu({ name, email, photoUrl }: { name: string; email: string; photoUrl?: string | null }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title={name}
          aria-label={`${name} — account menu`}
          className="flex items-center justify-center rounded-full hover:ring-2 hover:ring-border-strong transition-all focus-ring"
        >
          <Avatar name={name} photoUrl={photoUrl} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <p className="text-ink-1 font-medium text-[13px]">{name}</p>
          <p className="text-ink-4 text-[11px] font-normal normal-case tracking-normal">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings?tab=account">
            <User className="size-4 text-ink-3" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="size-4 text-ink-3" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} className="text-danger-400 data-[highlighted]:text-danger-300">
          <LogOut className="size-4" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Avatar({ name, photoUrl, size = "md" }: { name: string; photoUrl?: string | null; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "size-7 text-[10px]" : "size-7 text-[11px]";
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt={name} className={cn("rounded-full object-cover", dim)} />;
  }
  return (
    <div className={cn("flex items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 font-semibold text-[#1a1409]", dim)}>
      {initials(name) || "A"}
    </div>
  );
}
