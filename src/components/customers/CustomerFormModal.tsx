"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ID_PROOF_TYPES } from "@/lib/constants";

const PHONE_RE = /^[6-9]\d{9}$/;

export interface CustomerFormValue {
  fullName: string;
  mobile: string;
  drivingLicenceNumber: string;
  licenceExpiry: string;
  idProofType: string;
  idProofNumber: string;
  address: string;
  emergencyContact: string;
}

export const emptyCustomerForm: CustomerFormValue = {
  fullName: "",
  mobile: "",
  drivingLicenceNumber: "",
  licenceExpiry: "",
  idProofType: "",
  idProofNumber: "",
  address: "",
  emergencyContact: "",
};

interface CustomerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: any;
  onCreated?: (customer: any) => void;
}

export function CustomerFormModal({ open, onOpenChange, customer, onCreated }: CustomerFormModalProps) {
  const router = useRouter();
  const isEdit = !!customer;
  const [form, setForm] = useState<CustomerFormValue>(
    customer
      ? {
          fullName: customer.fullName,
          mobile: customer.mobile,
          drivingLicenceNumber: customer.drivingLicenceNumber,
          licenceExpiry: customer.licenceExpiry ? new Date(customer.licenceExpiry).toISOString().slice(0, 10) : "",
          idProofType: customer.idProofType,
          idProofNumber: customer.idProofNumber,
          address: customer.address,
          emergencyContact: customer.emergencyContact ?? "",
        }
      : emptyCustomerForm
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function set(key: keyof CustomerFormValue, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!PHONE_RE.test(form.mobile)) e.mobile = "Enter a valid 10-digit mobile number";
    if (!form.drivingLicenceNumber.trim()) e.drivingLicenceNumber = "Required";
    if (!form.licenceExpiry) e.licenceExpiry = "Required";
    if (!form.idProofType) e.idProofType = "Required";
    if (!form.idProofNumber.trim()) e.idProofNumber = "Required";
    if (!form.address.trim()) e.address = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/customers/${customer.id}` : "/api/customers", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }
      toast.success(isEdit ? "Customer updated." : "Customer added.");
      onOpenChange(false);
      onCreated?.(data.customer);
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
      title={isEdit ? "Edit Customer" : "Add Customer"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {isEdit ? "Save Changes" : "Add Customer"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          required
          value={form.fullName}
          error={errors.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          wrapClassName="sm:col-span-2"
        />
        <Input
          label="Mobile Number"
          required
          value={form.mobile}
          error={errors.mobile}
          onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
        />
        <Input
          label="Emergency Contact"
          value={form.emergencyContact}
          onChange={(e) => set("emergencyContact", e.target.value.replace(/\D/g, "").slice(0, 10))}
        />
        <Input
          label="Driving Licence Number"
          required
          value={form.drivingLicenceNumber}
          error={errors.drivingLicenceNumber}
          onChange={(e) => set("drivingLicenceNumber", e.target.value.toUpperCase())}
        />
        <Input
          label="Licence Expiry"
          type="date"
          required
          value={form.licenceExpiry}
          error={errors.licenceExpiry}
          onChange={(e) => set("licenceExpiry", e.target.value)}
        />
        <Select
          label="ID Proof Type"
          required
          placeholder="Select ID proof"
          value={form.idProofType}
          error={errors.idProofType}
          onChange={(e) => set("idProofType", e.target.value)}
        >
          {ID_PROOF_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Input
          label="ID Proof Number"
          required
          value={form.idProofNumber}
          error={errors.idProofNumber}
          onChange={(e) => set("idProofNumber", e.target.value.toUpperCase())}
        />
        <Input
          label="Address"
          required
          value={form.address}
          error={errors.address}
          onChange={(e) => set("address", e.target.value)}
          wrapClassName="sm:col-span-2"
        />
      </div>
    </Modal>
  );
}
