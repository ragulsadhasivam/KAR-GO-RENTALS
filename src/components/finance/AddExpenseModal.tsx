"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { CAR_EXPENSE_CATEGORIES, BUSINESS_EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
import { vehicleName } from "@/lib/utils";

export function AddExpenseModal({
  open,
  onOpenChange,
  vehicles,
  initialCategory = "FUEL",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: any[];
  initialCategory?: string;
}) {
  const router = useRouter();
  const [type, setType] = useState<"CAR" | "BUSINESS">("CAR");
  const [category, setCategory] = useState(initialCategory);
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState<number | "">("");
  const [vendor, setVendor] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [bill, setBill] = useState<{ url: string; fileName: string; fileType: string } | null>(null);

  const [serviceCentre, setServiceCentre] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [kmAtService, setKmAtService] = useState<number | "">("");
  const [nextServiceDate, setNextServiceDate] = useState("");
  const [nextServiceKm, setNextServiceKm] = useState<number | "">("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const categories = type === "CAR" ? CAR_EXPENSE_CATEGORIES : BUSINESS_EXPENSE_CATEGORIES;
  const isService = category === "SERVICE_MAINTENANCE";

  function handleTypeChange(t: "CAR" | "BUSINESS") {
    setType(t);
    setCategory(t === "CAR" ? "FUEL" : "INSURANCE");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (type === "CAR" && !vehicleId) e.vehicleId = "Select a vehicle";
    if (!amount || Number(amount) <= 0) e.amount = "Enter a valid amount";
    if (!date) e.date = "Required";
    if (isService) {
      if (!serviceCentre.trim()) e.serviceCentre = "Required";
      if (kmAtService === "" || Number(kmAtService) < 0) e.kmAtService = "Required";
      if (nextServiceKm !== "" && kmAtService !== "" && Number(nextServiceKm) <= Number(kmAtService)) {
        e.nextServiceKm = "Must be greater than the current bill KM";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          category,
          vehicleId: type === "CAR" ? vehicleId : null,
          date,
          amount: Number(amount),
          vendor,
          paymentMethod,
          billUrl: bill?.url,
          notes,
          serviceCentre,
          billNumber,
          kmAtService: kmAtService === "" ? null : Number(kmAtService),
          nextServiceDate: nextServiceDate || null,
          nextServiceKm: nextServiceKm === "" ? null : Number(nextServiceKm),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not add expense.");
        setLoading(false);
        return;
      }
      toast.success(isService ? "Service record added." : "Expense added.");
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
      title="Add Expense"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Add Expense
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex gap-2">
          {(["CAR", "BUSINESS"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={`h-9 rounded-xl px-4 text-[13px] font-medium border transition-colors ${
                type === t ? "border-gold-500/40 bg-gold-500/10 text-gold-300" : "border-border text-ink-3"
              }`}
            >
              {t === "CAR" ? "Car Expense" : "Business Expense"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Category" required value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          {type === "CAR" && (
            <Select label="Vehicle" required value={vehicleId} error={errors.vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {vehicleName(v)}
                </option>
              ))}
            </Select>
          )}
          <Input label="Date" type="date" required value={date} error={errors.date} onChange={(e) => setDate(e.target.value)} />
          <Input
            label="Amount"
            type="number"
            required
            value={amount}
            error={errors.amount}
            onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <Input label="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
          <Select label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m.replace("_", " ")}
              </option>
            ))}
          </Select>
        </div>

        {isService && (
          <div className="rounded-xl border border-border-subtle bg-surface-2/50 p-4">
            <p className="text-card-title mb-3">Service Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Service Centre"
                required
                value={serviceCentre}
                error={errors.serviceCentre}
                onChange={(e) => setServiceCentre(e.target.value)}
              />
              <Input label="Bill Number" value={billNumber} onChange={(e) => setBillNumber(e.target.value)} />
              <Input
                label="KM Shown on Bill"
                type="number"
                required
                value={kmAtService}
                error={errors.kmAtService}
                onChange={(e) => setKmAtService(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>

            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-secondary mb-3">
                Next service reminder <span className="text-ink-4">(optional — whichever is reached first)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Next Service Date"
                  type="date"
                  value={nextServiceDate}
                  onChange={(e) => setNextServiceDate(e.target.value)}
                />
                <Input
                  label="Next Service KM"
                  type="number"
                  placeholder="e.g. 75000"
                  value={nextServiceKm}
                  error={errors.nextServiceKm}
                  onChange={(e) => setNextServiceKm(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <FileUpload label="Bill / Invoice" folder="expenses" value={bill} onChange={setBill} />
      </div>
    </Modal>
  );
}
