import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { CONTACT_PHONES } from "./bookingPhone";

const LINK = "text-[15px] text-ink-3 hover:text-ink-1 transition-colors";

export function MarketingFooter({
  businessName,
  email,
  address,
  city,
  state,
  mapsHref,
}: {
  businessName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  mapsHref: string;
}) {
  return (
    <footer className="relative border-t border-white/10 bg-black pt-14 pb-24 sm:pb-10">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <Image src="/logo-mark.png" alt="" width={700} height={123} className="h-6 w-auto" />
              <span className="text-[14px] font-semibold tracking-wide text-ink-1">{businessName.toUpperCase()}</span>
            </div>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-3">
              Self-drive car rentals in {city} with doorstep delivery and openly published rates.
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-ink-3">Explore</p>
            <div className="mt-3 flex flex-col gap-2.5">
              <a href="#fleet" className={LINK}>Fleet</a>
              <a href="#rates" className={LINK}>Rates</a>
              <a href="#how-it-works" className={LINK}>How it works</a>
              <a href="#faq" className={LINK}>FAQ</a>
            </div>
          </nav>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-ink-3">Contact</p>
            <div className="mt-3 flex flex-col gap-3">
              {CONTACT_PHONES.map((p) => (
                <a key={p.tel} href={`tel:${p.tel}`} className={`flex items-start gap-2 ${LINK}`}>
                  <Phone className="mt-1 size-4 shrink-0" aria-hidden /> {p.display}
                </a>
              ))}
              <a href={`mailto:${email}`} className={`flex items-start gap-2 break-all ${LINK}`}>
                <Mail className="mt-1 size-4 shrink-0" aria-hidden /> {email}
              </a>
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" className={`flex items-start gap-2 ${LINK}`}>
                <MapPin className="mt-1 size-4 shrink-0" aria-hidden /> {address}, {city}, {state}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border-subtle pt-6 sm:flex-row">
          <p className="text-[13px] text-ink-3">
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
          <Link href="/login" className="text-[13px] text-ink-4 hover:text-ink-2">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
