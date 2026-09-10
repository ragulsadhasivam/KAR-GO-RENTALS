"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { FileUpload } from "@/components/ui/FileUpload";
import { StepShell } from "../SetupWizard";
import type { BusinessData } from "../types";
import { TN_CITIES } from "@/lib/constants";

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function StepBusiness({
  data,
  onChange,
  onBack,
  onNext,
}: {
  data: BusinessData;
  onChange: (v: BusinessData) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof BusinessData>(key: K, value: BusinessData[K]) {
    onChange({ ...data, [key]: value });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!data.name.trim()) e.name = "Business name is required";
    if (!PHONE_RE.test(data.phone)) e.phone = "Enter a valid 10-digit phone number";
    if (!PHONE_RE.test(data.whatsapp)) e.whatsapp = "Enter a valid 10-digit WhatsApp number";
    if (!EMAIL_RE.test(data.email)) e.email = "Enter a valid email address";
    if (!data.address.trim()) e.address = "Address is required";
    if (!data.city.trim()) e.city = "City is required";
    if (!data.state.trim()) e.state = "State is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <StepShell
      title="Business Information"
      subtitle="This appears on invoices, receipts and customer communication."
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Business Name"
          required
          placeholder="KAR GO RENTALS"
          value={data.name}
          error={errors.name}
          onChange={(e) => set("name", e.target.value)}
          wrapClassName="sm:col-span-2"
        />

        <div className="sm:col-span-2">
          <FileUpload
            label="Business Logo (optional)"
            folder="business"
            value={data.logo}
            onChange={(v) => set("logo", v)}
            accept="image/*"
            hint="PNG or JPG, square works best"
            compact
          />
        </div>

        <Input
          label="Business Phone"
          required
          placeholder="98765 43210"
          value={data.phone}
          error={errors.phone}
          onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
        />
        <Input
          label="Business WhatsApp Number"
          required
          placeholder="98765 43210"
          value={data.whatsapp}
          error={errors.whatsapp}
          onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 10))}
        />
        <Input
          label="Email"
          required
          type="email"
          placeholder="hello@kargorentals.in"
          value={data.email}
          error={errors.email}
          onChange={(e) => set("email", e.target.value)}
          wrapClassName="sm:col-span-2"
        />
        <Input
          label="Business Address"
          required
          placeholder="Street, area"
          value={data.address}
          error={errors.address}
          onChange={(e) => set("address", e.target.value)}
          wrapClassName="sm:col-span-2"
        />
        <Select
          label="City"
          required
          value={data.city}
          error={errors.city}
          placeholder="Select city"
          onChange={(e) => set("city", e.target.value)}
        >
          {TN_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Input
          label="State"
          required
          value={data.state}
          error={errors.state}
          onChange={(e) => set("state", e.target.value)}
        />
      </div>
    </StepShell>
  );
}
