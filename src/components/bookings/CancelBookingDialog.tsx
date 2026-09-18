"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatDateTime, vehicleName } from "@/lib/utils";

interface CancelBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    code: string;
    pickupAt: string | Date;
    customer: { fullName: string };
    vehicle: { make: string; model: string };
  };
  loading: boolean;
  onConfirm: () => void;
}

export function CancelBookingDialog({ open, onOpenChange, booking, loading, onConfirm }: CancelBookingDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={loading ? () => {} : onOpenChange}
      title="Cancel this booking?"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            Keep Booking
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Cancel Booking
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-full bg-danger-500/12 p-2 border border-danger-500/25">
            <AlertTriangle className="size-4 text-danger-400" />
          </div>
          <p className="text-body">This booking will be cancelled and the vehicle will become available again.</p>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface-2/50 divide-y divide-border-subtle">
          <Row label="Booking" value={booking.code} />
          <Row label="Customer" value={booking.customer.fullName} />
          <Row label="Vehicle" value={vehicleName(booking.vehicle)} />
          <Row label="Pickup" value={formatDateTime(booking.pickupAt)} />
        </div>
      </div>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3.5 py-2.5">
      <span className="text-meta">{label}</span>
      <span className="text-[13px] font-medium text-ink-1">{value}</span>
    </div>
  );
}
