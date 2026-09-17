import { prisma } from "@/lib/prisma";
import { normalizeIndianWhatsAppNumber } from "@/lib/whatsapp/phone";
import { sendBookingConfirmationTemplate } from "@/lib/whatsapp/service";
import { formatDateTime, vehicleName } from "@/lib/utils";
import type { WhatsAppDeliveryStatus } from "@/lib/whatsapp/types";

export interface BookingWhatsAppResult {
  status: WhatsAppDeliveryStatus;
  error?: string;
}

/**
 * Sends (or resends) the approved booking_confirmation WhatsApp template for
 * a booking and records the delivery outcome on the booking row. Used both
 * right after booking creation and from the "Resend WhatsApp" action — same
 * data, same template, same code path. Never throws: any failure (missing
 * config, invalid number, Meta API error, network error) is recorded as a
 * "failed" delivery status so it can never affect the booking itself.
 */
export async function sendBookingConfirmationWhatsApp(bookingId: string): Promise<BookingWhatsAppResult> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, vehicle: true },
    });
    if (!booking) return { status: "failed", error: "Booking not found." };

    await prisma.booking.update({
      where: { id: bookingId },
      data: { whatsappStatus: "sending", whatsappLastAttemptAt: new Date() },
    });

    const to = normalizeIndianWhatsAppNumber(booking.customer.mobile);
    if (!to) {
      const error = "Customer has no valid WhatsApp/mobile number.";
      await prisma.booking.update({ where: { id: bookingId }, data: { whatsappStatus: "failed", whatsappError: error } });
      return { status: "failed", error };
    }

    const result = await sendBookingConfirmationTemplate(to, {
      customer_name: booking.customer.fullName,
      booking_id: booking.code,
      vehicle: vehicleName(booking.vehicle),
      pickup_datetime: formatDateTime(booking.pickupAt),
    });

    if (result.success) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          whatsappStatus: "sent",
          whatsappMessageId: result.messageId,
          whatsappSentAt: new Date(),
          whatsappError: null,
        },
      });
      return { status: "sent" };
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { whatsappStatus: "failed", whatsappError: result.error },
    });
    return { status: "failed", error: result.error };
  } catch (err) {
    const error = "Unexpected error while sending the WhatsApp confirmation.";
    console.error("WhatsApp confirmation error:", err instanceof Error ? err.message : err);
    try {
      await prisma.booking.update({ where: { id: bookingId }, data: { whatsappStatus: "failed", whatsappError: error } });
    } catch {
      // Booking update itself failed — nothing more we can safely do here.
    }
    return { status: "failed", error };
  }
}
