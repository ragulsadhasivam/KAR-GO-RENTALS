import { MessageCircle, Phone } from "lucide-react";
import { BOOKING_TEL_HREF, WHATSAPP_GENERAL_HREF } from "./bookingPhone";

// Always-reachable booking actions on phones.
export function MobileActionBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
      <div className="grid grid-cols-2 gap-3">
        <a
          href={BOOKING_TEL_HREF}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 py-3 text-[15px] font-semibold text-black"
        >
          <Phone className="size-4" /> Call
        </a>
        <a
          href={WHATSAPP_GENERAL_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 py-3 text-[15px] font-medium text-white"
        >
          <MessageCircle className="size-4" /> WhatsApp
        </a>
      </div>
    </div>
  );
}
