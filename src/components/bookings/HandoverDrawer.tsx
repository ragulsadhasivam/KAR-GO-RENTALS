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

const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];

export function HandoverDrawer({
  open,
  onOpenChange,
  bookingId,
  currentKm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  currentKm: number;
}) {
  const router = useRouter();
  const [startingKm, setStartingKm] = useState(currentKm);
  const [fuelLevel, setFuelLevel] = useState("FULL");
  const [exteriorCondition, setExteriorCondition] = useState("Good");
  const [interiorCondition, setInteriorCondition] = useState("Good");
  const [existingDamageNotes, setExistingDamageNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [handoverAt, setHandoverAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (startingKm < 0) e.startingKm = "Enter a valid KM reading";
    if (startingKm < currentKm) e.startingKm = `Cannot be less than current KM (${currentKm.toLocaleString("en-IN")})`;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/handover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startingKm,
          fuelLevel,
          exteriorCondition,
          interiorCondition,
          existingDamageNotes,
          photos,
          customerSignatureUrl: signature,
          handoverAt: new Date(handoverAt).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not complete handover.");
        setSubmitting(false);
        return;
      }
      toast.success("Vehicle handover completed.");
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
      title="Start Handover"
      description="Record vehicle condition before handing over to the customer."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            Confirm Handover
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Starting KM"
            type="number"
            required
            value={startingKm}
            error={errors.startingKm}
            onChange={(e) => setStartingKm(Number(e.target.value))}
          />
          <Select label="Fuel Level" value={fuelLevel} onChange={(e) => setFuelLevel(e.target.value)}>
            {FUEL_LEVELS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
          <Select label="Exterior Condition" value={exteriorCondition} onChange={(e) => setExteriorCondition(e.target.value)}>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select label="Interior Condition" value={interiorCondition} onChange={(e) => setInteriorCondition(e.target.value)}>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input
            label="Handover Date & Time"
            type="datetime-local"
            value={handoverAt}
            onChange={(e) => setHandoverAt(e.target.value)}
            wrapClassName="col-span-2"
          />
        </div>

        <Textarea
          label="Existing Scratches / Damage"
          placeholder="Note any existing scratches or damage before handover"
          value={existingDamageNotes}
          onChange={(e) => setExistingDamageNotes(e.target.value)}
        />

        <PhotoUploader label="Photos" folder="handover" photos={photos} onChange={setPhotos} />

        <SignaturePad value={signature} onSave={setSignature} />
      </div>
    </Drawer>
  );
}
