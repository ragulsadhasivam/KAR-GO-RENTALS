"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Car } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { StepShell } from "../SetupWizard";
import type { VehicleData } from "../types";

const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric"];

export function StepVehicles({
  data,
  onChange,
  onBack,
  onNext,
}: {
  data: VehicleData[];
  onChange: (v: VehicleData[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  function setVehicle(key: string, patch: Partial<VehicleData>) {
    onChange(data.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  function validate() {
    const errs: Record<string, Record<string, string>> = {};
    const plates = new Set<string>();
    for (const v of data) {
      const e: Record<string, string> = {};
      const reg = v.registrationNumber.trim().toUpperCase();
      if (!reg) e.registrationNumber = "Registration number is required";
      else if (plates.has(reg)) e.registrationNumber = "Duplicate registration number";
      plates.add(reg);
      const year = Number(v.year);
      if (!year || year < 1990 || year > new Date().getFullYear() + 1) e.year = "Enter a valid year";
      if (!v.colour.trim()) e.colour = "Colour is required";
      if (!v.purchaseDate) e.purchaseDate = "Purchase date is required";
      if (!v.purchasePrice || Number(v.purchasePrice) <= 0) e.purchasePrice = "Enter a valid amount";
      if (v.currentKm === "" || Number(v.currentKm) < 0) e.currentKm = "Enter a valid KM reading";
      errs[v.key] = e;
    }
    setErrors(errs);
    return Object.values(errs).every((e) => Object.keys(e).length === 0);
  }

  return (
    <StepShell
      title="Build your fleet"
      subtitle="Enter details for each vehicle exactly as they appear on the RC."
      footer={
        <>
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button
            onClick={() => {
              if (validate()) onNext();
            }}
          >
            Continue <ArrowRight className="size-4" />
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {data.map((v) => (
          <div key={v.key} className="rounded-xl border border-border-subtle bg-surface-2/50 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-surface-3 p-2 border border-border">
                <Car className="size-4 text-gold-400" />
              </div>
              <div>
                <h3 className="text-card-title">
                  {v.make} {v.model}
                </h3>
                <p className="text-secondary">{v.colour}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Registration Number"
                required
                placeholder="TN 37 AB 1234"
                value={v.registrationNumber}
                error={errors[v.key]?.registrationNumber}
                onChange={(e) => setVehicle(v.key, { registrationNumber: e.target.value.toUpperCase() })}
              />
              <Input
                label="Variant"
                placeholder="Zeta / VXI / ZXI+"
                value={v.variant}
                onChange={(e) => setVehicle(v.key, { variant: e.target.value })}
              />
              <Input
                label="Manufacturing Year"
                required
                type="number"
                value={v.year}
                error={errors[v.key]?.year}
                onChange={(e) => setVehicle(v.key, { year: e.target.value })}
              />
              <Input
                label="Colour"
                required
                value={v.colour}
                error={errors[v.key]?.colour}
                onChange={(e) => setVehicle(v.key, { colour: e.target.value })}
              />
              <Select
                label="Fuel Type"
                required
                value={v.fuelType}
                onChange={(e) => setVehicle(v.key, { fuelType: e.target.value })}
              >
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
              <Input
                label="Current KM"
                required
                type="number"
                value={v.currentKm}
                error={errors[v.key]?.currentKm}
                onChange={(e) => setVehicle(v.key, { currentKm: e.target.value })}
              />
              <Input
                label="Purchase Date"
                required
                type="date"
                value={v.purchaseDate}
                error={errors[v.key]?.purchaseDate}
                onChange={(e) => setVehicle(v.key, { purchaseDate: e.target.value })}
              />
              <Input
                label="Purchase Price"
                required
                type="number"
                placeholder="₹"
                value={v.purchasePrice}
                error={errors[v.key]?.purchasePrice}
                onChange={(e) => setVehicle(v.key, { purchasePrice: e.target.value })}
                wrapClassName="sm:col-span-2"
              />
            </div>
          </div>
        ))}
      </div>
    </StepShell>
  );
}
