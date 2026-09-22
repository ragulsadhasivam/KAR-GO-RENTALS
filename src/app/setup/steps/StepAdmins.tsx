"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { FileUpload } from "@/components/ui/FileUpload";
import { Badge } from "@/components/ui/StatusPill";
import { StepShell } from "../SetupWizard";
import type { AdminData } from "../types";

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function StepAdmins({
  data,
  onChange,
  onBack,
  onNext,
}: {
  data: [AdminData, AdminData];
  onChange: (v: [AdminData, AdminData]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>[]>([{}, {}]);

  function setAdmin(index: 0 | 1, patch: Partial<AdminData>) {
    const next = [...data] as [AdminData, AdminData];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function validate() {
    const errs: Record<string, string>[] = [{}, {}];
    data.forEach((admin, i) => {
      if (!admin.name.trim()) errs[i].name = "Name is required";
      if (!PHONE_RE.test(admin.mobile)) errs[i].mobile = "Enter a valid 10-digit mobile number";
      if (!EMAIL_RE.test(admin.email)) errs[i].email = "Enter a valid email address";
      if (admin.password.length < 6) errs[i].password = "At least 6 characters";
    });
    if (data[0].email && data[1].email && data[0].email.toLowerCase() === data[1].email.toLowerCase()) {
      errs[1].email = "Must be different from Admin 1's email";
    }
    setErrors(errs);
    return errs.every((e) => Object.keys(e).length === 0);
  }

  return (
    <StepShell
      title="Add your administrators"
      subtitle="Both administrators have complete access."
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {data.map((admin, i) => (
          <AdminCard
            key={i}
            index={i as 0 | 1}
            admin={admin}
            errors={errors[i]}
            onChange={(patch) => setAdmin(i as 0 | 1, patch)}
          />
        ))}
      </div>
    </StepShell>
  );
}

function AdminCard({
  index,
  admin,
  errors,
  onChange,
}: {
  index: 0 | 1;
  admin: AdminData;
  errors: Record<string, string>;
  onChange: (patch: Partial<AdminData>) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-2/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-card-title">Admin {index + 1}</h3>
        <Badge tone="success">
          <ShieldCheck className="size-3" /> FULL ACCESS
        </Badge>
      </div>

      <div className="space-y-4">
        <FileUpload
          folder="admins"
          value={admin.photo}
          onChange={(v) => onChange({ photo: v })}
          accept="image/*"
          hint="Profile photo (optional)"
          compact
        />
        <Input
          label="Name"
          required
          placeholder="Full name"
          value={admin.name}
          error={errors.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
        <Input
          label="Mobile"
          required
          placeholder="98765 43210"
          value={admin.mobile}
          error={errors.mobile}
          onChange={(e) => onChange({ mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
        />
        <Input
          label="Email"
          required
          type="email"
          placeholder="admin@kargorentals.in"
          value={admin.email}
          error={errors.email}
          onChange={(e) => onChange({ email: e.target.value })}
        />
        <Input
          label="Password"
          required
          type={showPassword ? "text" : "password"}
          placeholder="Minimum 6 characters"
          value={admin.password}
          error={errors.password}
          onChange={(e) => onChange({ password: e.target.value })}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-ink-3 hover:text-ink-1"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />
      </div>
    </div>
  );
}
