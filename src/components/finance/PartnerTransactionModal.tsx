"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PARTNER_TXN_TYPES } from "@/lib/constants";

export function PartnerTransactionModal({
  open,
  onOpenChange,
  admins,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admins: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [partnerId, setPartnerId] = useState(admins[0]?.id ?? "");
  const [type, setType] = useState<(typeof PARTNER_TXN_TYPES)[number]["value"]>(PARTNER_TXN_TYPES[0].value);
  const [amount, setAmount] = useState<number | "">("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/partner-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId, type, amount: Number(amount), date, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not add transaction.");
        setLoading(false);
        return;
      }
      toast.success("Partner transaction recorded.");
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
      title="Add Partner Transaction"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Add Transaction
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select label="Partner" value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
          {admins.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as (typeof PARTNER_TXN_TYPES)[number]["value"])}
        >
          {PARTNER_TXN_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Amount" type="number" required value={amount} error={error} onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))} />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </Modal>
  );
}
