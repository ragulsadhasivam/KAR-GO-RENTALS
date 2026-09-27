import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { CONTACT_PHONES } from "./bookingPhone";

export function MarketingFooter({
  businessName,
  email,
  address,
  city,
  state,
}: {
  businessName: string;
  email: string;
  address: string;
  city: string;
  state: string;
}) {
  return (
    <footer className="relative bg-black border-t border-white/10 py-14">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <Image src="/logo-mark.png" alt={businessName} width={1142} height={202} className="h-6 w-auto" />
              <span className="text-[14px] font-semibold tracking-wide text-ink-1">{businessName.toUpperCase()}</span>
            </div>
            <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-ink-4">
              Premium self-drive car rentals with doorstep delivery, transparent pricing, and a
              fully verified fleet.
            </p>
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-4">Explore</p>
            <div className="mt-3 flex flex-col gap-2">
              <a href="#fleet" className="text-[13.5px] text-ink-3 hover:text-ink-1 transition-colors">Fleet</a>
              <a href="#how-it-works" className="text-[13.5px] text-ink-3 hover:text-ink-1 transition-colors">How it works</a>
              <a href="#why-us" className="text-[13.5px] text-ink-3 hover:text-ink-1 transition-colors">Why us</a>
              <Link href="/login" className="text-[13.5px] text-ink-3 hover:text-ink-1 transition-colors">Partner Login</Link>
            </div>
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-4">Contact</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {CONTACT_PHONES.map((p) => (
                <a key={p.tel} href={`tel:${p.tel}`} className="flex items-start gap-2 text-[13.5px] text-ink-3 hover:text-ink-1 transition-colors">
                  <Phone className="size-3.5 mt-0.5 shrink-0" /> {p.display}
                </a>
              ))}
              <a href={`mailto:${email}`} className="flex items-start gap-2 text-[13.5px] text-ink-3 hover:text-ink-1 transition-colors">
                <Mail className="size-3.5 mt-0.5 shrink-0" /> {email}
              </a>
              <span className="flex items-start gap-2 text-[13.5px] text-ink-3">
                <MapPin className="size-3.5 mt-0.5 shrink-0" /> {address}, {city}, {state}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-ink-4">
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
          <p className="text-[12px] text-ink-4">kargorentals.in</p>
        </div>
      </div>
    </footer>
  );
}
