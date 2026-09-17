/** Delivery state stored per booking — deliberately separate from the
 * booking's own BOOKED | ACTIVE | RETURNED lifecycle status. */
export type WhatsAppDeliveryStatus = "not_sent" | "sending" | "sent" | "failed";

export type WhatsAppSendResult =
  | { success: true; messageId: string | null }
  | { success: false; error: string; statusCode?: number };

/** Exact variable names from the approved "booking_confirmation" template —
 * the Meta payload's `parameter_name` values must match these precisely. */
export interface BookingConfirmationVariables {
  customer_name: string;
  booking_id: string;
  vehicle: string;
  pickup_datetime: string;
}
