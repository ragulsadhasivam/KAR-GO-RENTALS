"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#fleet", label: "Fleet" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#why-us", label: "Why us" },
  { href: "#contact", label: "Contact" },
];

export function LandingNavbar({
  businessName,
  isAuthenticated,
}: {
  businessName: string;
  isAuthenticated: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open ? "bg-black/90 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
        <div className="flex h-16 items-center justify-between sm:h-20">
          <Link href="#top" className="flex items-center gap-2.5 shrink-0">
            <Image src="/logo-mark.png" alt={businessName} width={1142} height={202} className="h-6 w-auto sm:h-7" />
            <span className="text-[13px] sm:text-[14px] font-semibold uppercase tracking-[0.15em] text-white">
              {businessName}
            </span>
          </Link>

          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center size-10 rounded-full border border-white/20 text-white transition-colors hover:border-white/50"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-black">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-10 py-6 flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-1 py-3 text-[20px] font-medium uppercase tracking-tight text-white/80 hover:text-white transition-colors border-b border-white/10 last:border-b-0"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/50 hover:text-white transition-colors"
            >
              {isAuthenticated ? "Dashboard" : "Partner Login"}
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
