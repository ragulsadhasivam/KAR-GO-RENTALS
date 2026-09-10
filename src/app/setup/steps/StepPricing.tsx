"use client";

import { useState } from "react";
import { ArrowLeft, Check, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { StepShell } from "../SetupWizard";
import type { VehicleData, PricingData } from "../types";

export function StepPricing({
  vehicles,
  data,
  onChange,
  onBack,
  onFinish,
  submitting,
}: {
  vehicles: VehicleData[];
  data: Record<string, PricingData>;
  onChange: (v: Record<string, PricingData>) => void;
  onBack: () => void;
  onFinish: () => void;
  submitting: boolean;
}) {
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  function setPricing(key: string, patch: Partial<PricingData>) {
    onChange({ ...data, [key]: { ...data[key], ...patch } });
  }

  function validate() {
    const errs: Record<string, Record<string, string>> = {};
    for (const v of vehicles) {
      const e: Record<string, string> = {};
      const p = data[v.key];
      if (!p?.dailyRate || Number(p.dailyRate) <= 0) e.dailyRate = "Required";
      if (!p?.extraHourRate || Number(p.extraHourRate) < 0) e.extraHourRate = "Required";
      if (!p?.extraKmRate || Number(p.extraKmRate) < 0) e.extraKmRate = "Required";
      errs[v.key] = e;
    }
    setErrors(errs);
    return Object.values(errs).every((e) => Object.keys(e).length === 0);
  }

  return (
    <StepShell
      title="Rental pricing"
      subtitle="Set a default rate per vehicle — you can always override it on individual bookings."
      footer={
        <>
          <Button variant="ghost" onClick={onBack} disabled={submitting}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button
            onClick={() => {
              if (validate()) onFinish();
            }}
            loading={submitting}
          >
            <Check className="size-4" /> Finish Setup
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {vehicles.map((v) => (
          <div key={v.key} className="rounded-xl border border-border-subtle bg-surface-2/50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <IndianRupee className="size-4 text-gold-400" />
              <h3 className="text-card-title">
                {v.make} {v.model}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Daily Rate"
                required
                type="number"
                placeholder="e.g. 1800"
                value={data[v.key]?.dailyRate ?? ""}
                error={errors[v.key]?.dailyRate}
                onChange={(e) => setPricing(v.key, { dailyRate: e.target.value })}
              />
              <Input
                label="Extra Hour Rate"
                required
                type="number"
                placeholder="e.g. 150"
                value={data[v.key]?.extraHourRate ?? ""}
                error={errors[v.key]?.extraHourRate}
                onChange={(e) => setPricing(v.key, { extraHourRate: e.target.value })}
              />
              <Input
                label="Extra KM Rate"
                required
                type="number"
                placeholder="e.g. 8"
                value={data[v.key]?.extraKmRate ?? ""}
                error={errors[v.key]?.extraKmRate}
                onChange={(e) => setPricing(v.key, { extraKmRate: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </StepShell>
  );
}
