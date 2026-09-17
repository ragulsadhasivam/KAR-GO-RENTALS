"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { PhotoUploader } from "@/components/ui/PhotoUploader";
import { SignaturePad } from "@/components/ui/SignaturePad";
import { FUEL_LEVELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { calculateRentalBill, formatDuration } from "@/lib/rentalBilling";

export function ReturnDrawer({
  open,
  onOpenChange,
  bookingId,
  startingKm,
  pickupAt,
  dailyRate,
  extraHourRate,
  extraKmRate,
  discount,
  amountPaid,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  startingKm: number;
  pickupAt: string | Date;
  dailyRate: number;
  extraHourRate: number;
  extraKmRate: number;
  discount: number;
  amountPaid: number;
}) {
  const router = useRouter();
  const [endingKm, setEndingKm] = useState(startingKm);
  const [fuelLevel, setFuelLevel] = useState("FULL");
  const [newDamageNotes, setNewDamageNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [extraKm, setExtraKm] = useState(0);
  const [damageCharge, setDamageCharge] = useState(0);
  const [otherPenalty, setOtherPenalty] = useState(0);
  const [returnAt, setReturnAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [returnLocation, setReturnLocation] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const pickup = useMemo(() => new Date(pickupAt), [pickupAt]);
  const returnDate = useMemo(() => (returnAt ? new Date(returnAt) : null), [returnAt]);
  const isReturnAfterPickup = !!returnDate && returnDate.getTime() > pickup.getTime();

  const bill = useMemo(() => {
    if (!isReturnAfterPickup || !returnDate) return null;
    return calculateRentalBill({
      pickupAt: pickup,
      returnAt: returnDate,
      dailyRate,
      extraHourRate,
      extraKmRate,
      extraKm,
      damageCharge,
      otherPenalty,
      discount,
    });
  }, [isReturnAfterPickup, returnDate, pickup, dailyRate, extraHourRate, extraKmRate, extraKm, damageCharge, otherPenalty, discount]);

  const distanceTravelled = Math.max(0, endingKm - startingKm);
  const projectedBalance = bill ? Math.max(0, bill.finalTotal - amountPaid) : null;

  function validate() {
    const e: Record<string, string> = {};
    if (endingKm < startingKm) e.endingKm = `Cannot be less than starting KM (${startingKm.toLocaleString("en-IN")})`;
    if (!returnAt) e.returnAt = "Required";
    else if (!isReturnAfterPickup) e.returnAt = "Return date and time must be later than the pickup date and time.";
    if (!returnLocation.trim()) e.returnLocation = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endingKm,
          fuelLevel,
          newDamageNotes,
          photos,
          extraKm,
          damageCharge,
          otherPenalty,
          customerSignatureUrl: signature,
          returnAt: new Date(returnAt).toISOString(),
          returnLocation,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not complete return.");
        setSubmitting(false);
        return;
      }
      toast.success("Vehicle returned successfully.");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Return Vehicle"
      description="Record the actual return details — the final bill is calculated from these."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            Confirm Return
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ending KM"
            type="number"
            required
            value={endingKm}
            error={errors.endingKm}
            onChange={(e) => setEndingKm(Number(e.target.value))}
            hint={distanceTravelled > 0 ? `${distanceTravelled.toLocaleString("en-IN")} km travelled` : undefined}
          />
          <Select label="Fuel Level" value={fuelLevel} onChange={(e) => setFuelLevel(e.target.value)}>
            {FUEL_LEVELS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
          <Input
            label="Return Date & Time"
            type="datetime-local"
            required
            value={returnAt}
            error={errors.returnAt}
            onChange={(e) => setReturnAt(e.target.value)}
          />
          <Input
            label="Return Location"
            required
            value={returnLocation}
            error={errors.returnLocation}
            onChange={(e) => setReturnLocation(e.target.value)}
          />
        </div>

        <Textarea
          label="New Scratches / Damage"
          placeholder="Note any new scratches or damage found on return"
          value={newDamageNotes}
          onChange={(e) => setNewDamageNotes(e.target.value)}
        />

        <PhotoUploader label="Photos" folder="return" photos={photos} onChange={setPhotos} />

        <div className="grid grid-cols-2 gap-4 border-t border-border-subtle pt-5">
          <Input label="Extra Kilometres" type="number" value={extraKm} onChange={(e) => setExtraKm(Number(e.target.value))} />
          <Input label="Damage Charge" type="number" value={damageCharge} onChange={(e) => setDamageCharge(Number(e.target.value))} />
          <Input label="Other Penalty" type="number" value={otherPenalty} onChange={(e) => setOtherPenalty(Number(e.target.value))} />
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface-2 p-4">
          <p className="text-meta mb-3">Bill Preview</p>
          {!bill ? (
            <p className="text-secondary">Enter a valid return date and time to see the calculated bill.</p>
          ) : (
            <div className="space-y-2">
              <BillRow label={`Rental Duration (${formatDuration(bill.duration)})`} value="" muted />
              <BillRow label={`Base Rental (${bill.duration.days} day${bill.duration.days === 1 ? "" : "s"} × ${formatCurrency(dailyRate)})`} value={formatCurrency(bill.baseRental)} />
              <BillRow
                label={`Extra Hours (${bill.duration.billableHours} hr × ${formatCurrency(extraHourRate)})`}
                value={formatCurrency(bill.extraHourCharge)}
              />
              {bill.duration.minutes > 0 && (
                <p className="text-[11px] text-ink-4 -mt-1">
                  Partial hour ({bill.duration.minutes} min) is billed as a full extra hour.
                </p>
              )}
              <BillRow label={`Extra KM (${extraKm} × ${formatCurrency(extraKmRate)})`} value={formatCurrency(bill.extraKmCharge)} />
              <BillRow label="Damage Charge" value={formatCurrency(bill.damageCharge)} />
              <BillRow label="Other Penalty" value={formatCurrency(bill.otherPenalty)} />
              <BillRow label="Discount" value={`− ${formatCurrency(bill.discount)}`} />
              <div className="h-px bg-border-subtle my-2" />
              <BillRow label="Final Total" value={formatCurrency(bill.finalTotal)} strong />
              <BillRow label="Amount Paid" value={formatCurrency(amountPaid)} />
              <BillRow
                label={projectedBalance && projectedBalance > 0.5 ? "Balance Due" : "Status"}
                value={projectedBalance && projectedBalance > 0.5 ? formatCurrency(projectedBalance) : "Fully Paid"}
                strong
                warn={!!projectedBalance && projectedBalance > 0.5}
              />
            </div>
          )}
        </div>

        <SignaturePad value={signature} onSave={setSignature} />
      </div>
    </Drawer>
  );
}

function BillRow({ label, value, strong, muted, warn }: { label: string; value: string; strong?: boolean; muted?: boolean; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={muted ? "text-[12px] text-ink-4" : "text-[12.5px] text-ink-3"}>{label}</span>
      {value && (
        <span
          className={
            strong
              ? warn
                ? "text-[13.5px] font-semibold text-warning-400 font-figure"
                : "text-[13.5px] font-semibold text-ink-1 font-figure"
              : "text-[12.5px] text-ink-2 font-figure"
          }
        >
          {value}
        </span>
      )}
    </div>
  );
}
