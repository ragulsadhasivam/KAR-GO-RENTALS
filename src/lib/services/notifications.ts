import { prisma } from "@/lib/prisma";
import { getDocumentStatus } from "@/lib/services/documentStatus";
import { getServiceReminderStatus, serviceReminderMessage } from "@/lib/services/serviceReminder";
import { vehicleName } from "@/lib/utils";
import { addHours } from "date-fns";

export type AppNotification = {
  id: string;
  type:
    | "BOOKING_UPCOMING"
    | "PAYMENT_PENDING"
    | "DOCUMENT_EXPIRING"
    | "DOCUMENT_EXPIRED"
    | "SERVICE_REMINDER";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  href: string;
  date: Date;
};

export async function getNotifications(): Promise<AppNotification[]> {
  const business = await prisma.business.findFirst();
  const thresholdDays = business?.documentReminderDays ?? 30;
  const notifications: AppNotification[] = [];
  const now = new Date();
  const soon = addHours(now, 24);

  if (business?.notifyBookings ?? true) {
    const upcoming = await prisma.booking.findMany({
      where: { status: "BOOKED", pickupAt: { gte: now, lte: soon } },
      include: { customer: true, vehicle: true },
    });
    for (const b of upcoming) {
      notifications.push({
        id: `booking-${b.id}`,
        type: "BOOKING_UPCOMING",
        severity: "info",
        title: "Upcoming booking",
        description: `${vehicleName(b.vehicle)} — ${b.customer.fullName} picks up soon`,
        href: `/bookings/${b.id}`,
        date: b.pickupAt,
      });
    }
  }

  // A booking's totalAmount is only meaningful once returned (the final
  // bill is unknown before then — see rentalBilling.ts), so pending-payment
  // notifications only ever apply to RETURNED bookings.
  if (business?.notifyPayments ?? true) {
    const bookings = await prisma.booking.findMany({
      where: { status: "RETURNED" },
      include: { customer: true, vehicle: true, payments: true },
    });
    for (const b of bookings) {
      const paid = b.payments.reduce((s, p) => s + p.amount, 0);
      const balance = b.totalAmount - paid;
      if (balance > 0.5) {
        notifications.push({
          id: `payment-${b.id}`,
          type: "PAYMENT_PENDING",
          severity: "critical",
          title: "Pending payment",
          description: `${b.customer.fullName} — balance due`,
          href: `/bookings/${b.id}`,
          date: b.updatedAt,
        });
      }
    }
  }

  if (business?.notifyDocuments ?? true) {
    const docs = await prisma.vehicleDocument.findMany({ include: { vehicle: true } });
    for (const d of docs) {
      if (!d.expiryDate) continue;
      const status = getDocumentStatus(d.expiryDate, thresholdDays);
      if (status === "EXPIRING_SOON") {
        notifications.push({
          id: `doc-${d.id}`,
          type: "DOCUMENT_EXPIRING",
          severity: "warning",
          title: `${d.type === "OTHER" ? d.documentName ?? "Document" : d.type} expiring soon`,
          description: `${vehicleName(d.vehicle)}`,
          href: `/documents`,
          date: d.expiryDate,
        });
      } else if (status === "EXPIRED") {
        notifications.push({
          id: `doc-${d.id}`,
          type: "DOCUMENT_EXPIRED",
          severity: "critical",
          title: `${d.type === "OTHER" ? d.documentName ?? "Document" : d.type} expired`,
          description: `${vehicleName(d.vehicle)}`,
          href: `/documents`,
          date: d.expiryDate,
        });
      }
    }
  }

  if (business?.notifyService ?? true) {
    const vehicles = await prisma.vehicle.findMany({
      where: { archived: false },
      include: { services: { orderBy: [{ date: "desc" }, { createdAt: "desc" }], take: 1 } },
    });
    for (const v of vehicles) {
      const last = v.services[0];
      // Only the most recent service record's thresholds are live — recording
      // a new service naturally supersedes the old one and resets this check,
      // with nothing to separately "clear" or persist.
      const { status, reason } = getServiceReminderStatus({
        nextServiceDate: last?.nextServiceDate ?? null,
        nextServiceKm: last?.nextServiceKm ?? null,
        currentKm: v.currentKm,
        now,
      });
      if (status === "DUE" || status === "OVERDUE") {
        notifications.push({
          id: `service-${v.id}`,
          type: "SERVICE_REMINDER",
          severity: status === "OVERDUE" ? "critical" : "warning",
          title: status === "OVERDUE" ? "Service overdue" : "Service due",
          description: `${vehicleName(v)} — ${serviceReminderMessage(reason)}`,
          href: `/service`,
          date: last?.nextServiceDate ?? now,
        });
      }
    }
  }

  return notifications.sort((a, b) => a.date.getTime() - b.date.getTime());
}
