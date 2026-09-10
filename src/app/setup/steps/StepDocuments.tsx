"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { FileUpload } from "@/components/ui/FileUpload";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { getDocumentStatus } from "@/lib/services/documentStatus";
import { StepShell } from "../SetupWizard";
import type { VehicleData, VehicleDocData } from "../types";

export function StepDocuments({
  vehicles,
  data,
  onChange,
  onBack,
  onNext,
}: {
  vehicles: VehicleData[];
  data: Record<string, VehicleDocData>;
  onChange: (v: Record<string, VehicleDocData>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [active, setActive] = useState(vehicles[0]?.key);

  function updateVehicleDocs(key: string, patch: Partial<VehicleDocData>) {
    onChange({ ...data, [key]: { ...data[key], ...patch } });
  }

  return (
    <StepShell
      title="Vehicle documents"
      subtitle="Add what you have now — you can upload or update the rest anytime from Documents."
      footer={
        <>
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button onClick={onNext}>
            Continue <ArrowRight className="size-4" />
          </Button>
        </>
      }
    >
      <Tabs value={active} onValueChange={setActive}>
        <TabsList>
          {vehicles.map((v) => (
            <TabsTrigger key={v.key} value={v.key}>
              {v.make.split(" ").pop()} {v.model}
            </TabsTrigger>
          ))}
        </TabsList>

        {vehicles.map((v) => (
          <TabsContent key={v.key} value={v.key} className="mt-5 space-y-4">
            <RCSection docs={data[v.key]} onChange={(patch) => updateVehicleDocs(v.key, patch)} />
            <InsuranceSection docs={data[v.key]} onChange={(patch) => updateVehicleDocs(v.key, patch)} />
            <FCSection docs={data[v.key]} onChange={(patch) => updateVehicleDocs(v.key, patch)} />
            <OtherSection docs={data[v.key]} onChange={(patch) => updateVehicleDocs(v.key, patch)} />
          </TabsContent>
        ))}
      </Tabs>
    </StepShell>
  );
}

function DocCard({
  title,
  status,
  children,
}: {
  title: string;
  status?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-2/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-card-title">{title}</h4>
        {status && <StatusPill status={status} size="sm" />}
      </div>
      {children}
    </div>
  );
}

function RCSection({
  docs,
  onChange,
}: {
  docs: VehicleDocData;
  onChange: (patch: Partial<VehicleDocData>) => void;
}) {
  const rc = docs.rc;
  return (
    <DocCard title="RC">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Input
          label="RC Number"
          value={rc.number}
          onChange={(e) => onChange({ rc: { ...rc, number: e.target.value } })}
        />
        <Input
          label="Registration Date"
          type="date"
          value={rc.registrationDate}
          onChange={(e) => onChange({ rc: { ...rc, registrationDate: e.target.value } })}
        />
      </div>
      <FileUpload folder="documents" value={rc.file} onChange={(f) => onChange({ rc: { ...rc, file: f } })} compact />
    </DocCard>
  );
}

function InsuranceSection({
  docs,
  onChange,
}: {
  docs: VehicleDocData;
  onChange: (patch: Partial<VehicleDocData>) => void;
}) {
  const ins = docs.insurance;
  const status = ins.expiryDate ? getDocumentStatus(ins.expiryDate) : null;
  return (
    <DocCard title="Insurance" status={status}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Input
          label="Insurance Company"
          value={ins.company}
          onChange={(e) => onChange({ insurance: { ...ins, company: e.target.value } })}
        />
        <Input
          label="Policy Number"
          value={ins.policyNumber}
          onChange={(e) => onChange({ insurance: { ...ins, policyNumber: e.target.value } })}
        />
        <Input
          label="Start Date"
          type="date"
          value={ins.startDate}
          onChange={(e) => onChange({ insurance: { ...ins, startDate: e.target.value } })}
        />
        <Input
          label="Expiry Date"
          type="date"
          value={ins.expiryDate}
          onChange={(e) => onChange({ insurance: { ...ins, expiryDate: e.target.value } })}
        />
        <Input
          label="Premium"
          type="number"
          value={ins.premium}
          onChange={(e) => onChange({ insurance: { ...ins, premium: e.target.value } })}
        />
      </div>
      <FileUpload
        folder="documents"
        value={ins.file}
        onChange={(f) => onChange({ insurance: { ...ins, file: f } })}
        compact
      />
    </DocCard>
  );
}

function FCSection({
  docs,
  onChange,
}: {
  docs: VehicleDocData;
  onChange: (patch: Partial<VehicleDocData>) => void;
}) {
  const fc = docs.fc;
  const status = fc.expiryDate ? getDocumentStatus(fc.expiryDate) : null;
  return (
    <DocCard title="FC" status={status}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Input label="FC Number" value={fc.number} onChange={(e) => onChange({ fc: { ...fc, number: e.target.value } })} />
        <Input
          label="Start Date"
          type="date"
          value={fc.startDate}
          onChange={(e) => onChange({ fc: { ...fc, startDate: e.target.value } })}
        />
        <Input
          label="Expiry Date"
          type="date"
          value={fc.expiryDate}
          onChange={(e) => onChange({ fc: { ...fc, expiryDate: e.target.value } })}
        />
      </div>
      <FileUpload folder="documents" value={fc.file} onChange={(f) => onChange({ fc: { ...fc, file: f } })} compact />
    </DocCard>
  );
}

function OtherSection({
  docs,
  onChange,
}: {
  docs: VehicleDocData;
  onChange: (patch: Partial<VehicleDocData>) => void;
}) {
  if (!docs.other) {
    return (
      <button
        type="button"
        onClick={() => onChange({ other: { name: "", expiryDate: "", file: null } })}
        className="flex items-center gap-2 text-[13px] font-medium text-gold-400 hover:text-gold-300"
      >
        <Plus className="size-4" /> Add another document
      </button>
    );
  }
  const other = docs.other;
  const status = other.expiryDate ? getDocumentStatus(other.expiryDate) : null;
  return (
    <DocCard title="Other" status={status}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Input
          label="Document Name"
          value={other.name}
          onChange={(e) => onChange({ other: { ...other, name: e.target.value } })}
        />
        <Input
          label="Expiry Date"
          type="date"
          value={other.expiryDate}
          onChange={(e) => onChange({ other: { ...other, expiryDate: e.target.value } })}
        />
      </div>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <FileUpload
            folder="documents"
            value={other.file}
            onChange={(f) => onChange({ other: { ...other, file: f } })}
            compact
          />
        </div>
        <button
          type="button"
          onClick={() => onChange({ other: null })}
          className="mt-1 rounded-lg p-2 text-ink-3 hover:bg-danger-500/15 hover:text-danger-400"
        >
          <X className="size-4" />
        </button>
      </div>
    </DocCard>
  );
}
