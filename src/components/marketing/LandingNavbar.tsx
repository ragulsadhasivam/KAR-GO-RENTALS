"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOOKING_TEL_HREF } from "./bookingPhone";

const LINKS = [
  { href: "#fleet", label: "Fleet" },
  { href: "#rates", label: "Rates" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#why-us", label: "Why us" },
  { href: "#faq", label: "FAQ" },
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open ? "bg-black/90 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
        <div className="flex h-16 items-center justify-between gap-6 sm:h-20">
          <Link href="#top" className="flex items-center gap-2.5 shrink-0">
            <Image src="/logo-mark.png" alt="" width={700} height={123} className="h-6 w-auto sm:h-7" />
            <span className="text-[13px] sm:text-[14px] font-semibold uppercase tracking-[0.15em] text-white">
              {businessName}
            </span>
          </Link>

          <nav aria-label="Main" className="hidden lg:flex items-center gap-8">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[14px] font-medium text-white/75 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={BOOKING_TEL_HREF}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-[14px] font-semibold text-black transition-colors hover:bg-gold-400"
            >
              <Phone className="size-4" /> Call to book
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex lg:hidden items-center justify-center size-11 rounded-full border border-white/25 text-white transition-colors hover:border-white/50"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="lg:hidden border-t border-white/10 bg-black">
          <nav aria-label="Mobile" className="mx-auto max-w-[1600px] px-5 sm:px-10 py-4 flex flex-col">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-1 py-4 text-[18px] font-medium text-white/85 hover:text-white transition-colors border-b border-white/10"
              >
                {l.label}
              </a>
            ))}
            {isAuthenticated && (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="px-1 py-4 text-[15px] font-medium text-white/60 hover:text-white"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
