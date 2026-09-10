"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric"];

interface VehicleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: any;
}

export function VehicleFormModal({ open, onOpenChange, vehicle }: VehicleFormModalProps) {
  const router = useRouter();
  const isEdit = !!vehicle;
  const [form, setForm] = useState({
    make: vehicle?.make ?? "",
    model: vehicle?.model ?? "",
    variant: vehicle?.variant ?? "",
    registrationNumber: vehicle?.registrationNumber ?? "",
    year: vehicle?.year ?? new Date().getFullYear(),
    colour: vehicle?.colour ?? "White",
    fuelType: vehicle?.fuelType ?? "Petrol",
    purchaseDate: vehicle?.purchaseDate ? new Date(vehicle.purchaseDate).toISOString().slice(0, 10) : "",
    purchasePrice: vehicle?.purchasePrice ?? "",
    currentKm: vehicle?.currentKm ?? 0,
    dailyRate: vehicle?.pricing?.dailyRate ?? "",
    extraHourRate: vehicle?.pricing?.extraHourRate ?? "",
    extraKmRate: vehicle?.pricing?.extraKmRate ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function set(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.make.trim()) e.make = "Required";
    if (!form.model.trim()) e.model = "Required";
    if (!form.registrationNumber.trim()) e.registrationNumber = "Required";
    if (!form.purchaseDate) e.purchaseDate = "Required";
    if (!form.purchasePrice || Number(form.purchasePrice) <= 0) e.purchasePrice = "Enter a valid amount";
    if (!form.dailyRate || Number(form.dailyRate) <= 0) e.dailyRate = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const payload = {
      make: form.make,
      model: form.model,
      variant: form.variant || null,
      registrationNumber: form.registrationNumber,
      year: Number(form.year),
      colour: form.colour,
      fuelType: form.fuelType,
      purchaseDate: form.purchaseDate,
      purchasePrice: Number(form.purchasePrice),
      currentKm: Number(form.currentKm),
      pricing: {
        dailyRate: Number(form.dailyRate),
        extraHourRate: Number(form.extraHourRate || 0),
        extraKmRate: Number(form.extraKmRate || 0),
      },
    };

    try {
      const res = await fetch(isEdit ? `/api/vehicles/${vehicle.id}` : "/api/vehicles", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }
      toast.success(isEdit ? "Vehicle updated." : "Vehicle added to fleet.");
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
      title={isEdit ? "Edit Vehicle" : "Add Vehicle"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {isEdit ? "Save Changes" : "Add Vehicle"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Make" required value={form.make} error={errors.make} onChange={(e) => set("make", e.target.value)} />
        <Input label="Model" required value={form.model} error={errors.model} onChange={(e) => set("model", e.target.value)} />
        <Input label="Variant" value={form.variant} onChange={(e) => set("variant", e.target.value)} />
        <Input
          label="Registration Number"
          required
          value={form.registrationNumber}
          error={errors.registrationNumber}
          onChange={(e) => set("registrationNumber", e.target.value.toUpperCase())}
        />
        <Input label="Manufacturing Year" type="number" value={form.year} onChange={(e) => set("year", e.target.value)} />
        <Input label="Colour" value={form.colour} onChange={(e) => set("colour", e.target.value)} />
        <Select label="Fuel Type" value={form.fuelType} onChange={(e) => set("fuelType", e.target.value)}>
          {FUEL_TYPES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </Select>
        <Input label="Current KM" type="number" value={form.currentKm} onChange={(e) => set("currentKm", e.target.value)} />
        <Input
          label="Purchase Date"
          type="date"
          required
          value={form.purchaseDate}
          error={errors.purchaseDate}
          onChange={(e) => set("purchaseDate", e.target.value)}
        />
        <Input
          label="Purchase Price"
          type="number"
          required
          value={form.purchasePrice}
          error={errors.purchasePrice}
          onChange={(e) => set("purchasePrice", e.target.value)}
        />

        <div className="sm:col-span-2 border-t border-border-subtle pt-4 mt-1">
          <p className="text-card-title mb-3">Rental Pricing</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Daily Rate"
              type="number"
              required
              value={form.dailyRate}
              error={errors.dailyRate}
              onChange={(e) => set("dailyRate", e.target.value)}
            />
            <Input label="Extra Hour Rate" type="number" value={form.extraHourRate} onChange={(e) => set("extraHourRate", e.target.value)} />
            <Input label="Extra KM Rate" type="number" value={form.extraKmRate} onChange={(e) => set("extraKmRate", e.target.value)} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
