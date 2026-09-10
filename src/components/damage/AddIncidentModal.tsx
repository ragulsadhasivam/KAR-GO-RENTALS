"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PhotoUploader } from "@/components/ui/PhotoUploader";
import { DAMAGE_STATUS } from "@/lib/constants";
import { vehicleName } from "@/lib/utils";

interface AddIncidentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: any[];
  bookings: any[];
  customers: any[];
  defaults?: { vehicleId?: string; bookingId?: string; customerId?: string };
}

export function AddIncidentModal({ open, onOpenChange, vehicles, bookings, customers, defaults }: AddIncidentModalProps) {
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState(defaults?.vehicleId ?? vehicles[0]?.id ?? "");
  const [bookingId, setBookingId] = useState(defaults?.bookingId ?? "");
  const [customerId, setCustomerId] = useState(defaults?.customerId ?? "");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [estimatedRepairCost, setEstimatedRepairCost] = useState<number | "">("");
  const [actualRepairCost, setActualRepairCost] = useState<number | "">("");
  const [customerCharge, setCustomerCharge] = useState<number | "">("");
  const [status, setStatus] = useState("REPORTED");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!vehicleId) e.vehicleId = "Select a vehicle";
    if (!date) e.date = "Required";
    if (!description.trim()) e.description = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/damage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          bookingId: bookingId || null,
          customerId: customerId || null,
          date,
          description,
          photos,
          estimatedRepairCost: estimatedRepairCost === "" ? null : estimatedRepairCost,
          actualRepairCost: actualRepairCost === "" ? null : actualRepairCost,
          customerCharge: customerCharge === "" ? null : customerCharge,
          status,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not add incident.");
        setLoading(false);
        return;
      }
      toast.success("Damage incident recorded.");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Report Damage / Incident"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Save Incident
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Vehicle" required value={vehicleId} error={errors.vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {vehicleName(v)}
              </option>
            ))}
          </Select>
          <Select label="Booking" placeholder="None" value={bookingId} onChange={(e) => setBookingId(e.target.value)}>
            <option value="">None</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} — {b.customer.fullName}
              </option>
            ))}
          </Select>
          <Select label="Customer" placeholder="None" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">None</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Date" type="date" required value={date} error={errors.date} onChange={(e) => setDate(e.target.value)} />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {DAMAGE_STATUS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ")}
              </option>
            ))}
          </Select>
        </div>

        <Textarea
          label="Description"
          required
          value={description}
          error={errors.description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <PhotoUploader label="Photos" folder="damage" photos={photos} onChange={setPhotos} />

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Estimated Repair Cost"
            type="number"
            value={estimatedRepairCost}
            onChange={(e) => setEstimatedRepairCost(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <Input
            label="Actual Repair Cost"
            type="number"
            value={actualRepairCost}
            onChange={(e) => setActualRepairCost(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <Input
            label="Customer Charge"
            type="number"
            value={customerCharge}
            onChange={(e) => setCustomerCharge(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>

        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </Modal>
  );
}
