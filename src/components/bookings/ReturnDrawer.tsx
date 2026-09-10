"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { PhotoUploader } from "@/components/ui/PhotoUploader";
import { SignaturePad } from "@/components/ui/SignaturePad";
import { FUEL_LEVELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export function ReturnDrawer({
  open,
  onOpenChange,
  bookingId,
  startingKm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  startingKm: number;
}) {
  const router = useRouter();
  const [endingKm, setEndingKm] = useState(startingKm);
  const [fuelLevel, setFuelLevel] = useState("FULL");
  const [newDamageNotes, setNewDamageNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [extraKm, setExtraKm] = useState(0);
  const [extraHours, setExtraHours] = useState(0);
  const [damageCharge, setDamageCharge] = useState(0);
  const [otherPenalty, setOtherPenalty] = useState(0);
  const [returnAt, setReturnAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [signature, setSignature] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const extraTotal = damageCharge + otherPenalty;

  function validate() {
    const e: Record<string, string> = {};
    if (endingKm < startingKm) e.endingKm = `Cannot be less than starting KM (${startingKm.toLocaleString("en-IN")})`;
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
          extraHours,
          damageCharge,
          otherPenalty,
          customerSignatureUrl: signature,
          returnAt: new Date(returnAt).toISOString(),
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
      description="Record vehicle condition and any additional charges on return."
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
            value={returnAt}
            onChange={(e) => setReturnAt(e.target.value)}
            wrapClassName="col-span-2"
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
          <Input label="Extra Hours" type="number" value={extraHours} onChange={(e) => setExtraHours(Number(e.target.value))} />
          <Input label="Damage Charge" type="number" value={damageCharge} onChange={(e) => setDamageCharge(Number(e.target.value))} />
          <Input label="Other Penalty" type="number" value={otherPenalty} onChange={(e) => setOtherPenalty(Number(e.target.value))} />
        </div>

        {extraTotal > 0 && (
          <div className="rounded-xl border border-warning-500/25 bg-warning-500/10 px-3.5 py-2.5 text-[13px] text-warning-300">
            {formatCurrency(extraTotal)} in damage/penalty charges will be added to the booking total.
          </div>
        )}

        <SignaturePad value={signature} onSave={setSignature} />
      </div>
    </Drawer>
  );
}
