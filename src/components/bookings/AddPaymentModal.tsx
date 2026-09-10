"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PAYMENT_METHODS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export function AddPaymentModal({
  open,
  onOpenChange,
  bookingId,
  balance,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  balance: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(balance);
  const [method, setMethod] = useState("CASH");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (amount <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (amount > balance + 0.5) {
      setError(`Amount exceeds the remaining balance of ${formatCurrency(balance)}`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not add payment.");
        setLoading(false);
        return;
      }
      toast.success("Payment recorded.");
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
      title="Add Payment"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Add Payment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-secondary">Remaining balance: {formatCurrency(balance)}</p>
        <Input label="Amount" type="number" required value={amount} error={error} onChange={(e) => setAmount(Number(e.target.value))} />
        <Select label="Payment Method" value={method} onChange={(e) => setMethod(e.target.value)}>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m.replace("_", " ")}
            </option>
          ))}
        </Select>
      </div>
    </Modal>
  );
}
