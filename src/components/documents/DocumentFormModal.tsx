"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { vehicleName } from "@/lib/utils";

export function DocumentFormModal({
  open,
  onOpenChange,
  vehicles,
  document,
  defaultVehicleId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: any[];
  document?: any;
  defaultVehicleId?: string;
}) {
  const router = useRouter();
  const isEdit = !!document;
  const [vehicleId, setVehicleId] = useState(document?.vehicleId ?? defaultVehicleId ?? vehicles[0]?.id ?? "");
  const [type, setType] = useState(document?.type ?? "RC");
  const [documentName, setDocumentName] = useState(document?.documentName ?? "");
  const [documentNumber, setDocumentNumber] = useState(document?.documentNumber ?? "");
  const [issuer, setIssuer] = useState(document?.issuer ?? "");
  const [startDate, setStartDate] = useState(document?.startDate ? new Date(document.startDate).toISOString().slice(0, 10) : "");
  const [expiryDate, setExpiryDate] = useState(document?.expiryDate ? new Date(document.expiryDate).toISOString().slice(0, 10) : "");
  const [premium, setPremium] = useState(document?.premium ?? "");
  const [file, setFile] = useState<{ url: string; fileName: string; fileType: string } | null>(
    document?.fileUrl ? { url: document.fileUrl, fileName: document.fileName, fileType: document.fileType } : null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!vehicleId) e.vehicleId = "Required";
    if (type === "OTHER" && !documentName.trim()) e.documentName = "Required";
    if (type !== "RC" && type !== "OTHER" && !expiryDate) e.expiryDate = "Required";
    if (type === "OTHER" && !expiryDate) e.expiryDate = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const payload = {
      vehicleId,
      type,
      documentName: type === "OTHER" ? documentName : null,
      documentNumber: documentNumber || null,
      issuer: type === "INSURANCE" ? issuer : null,
      startDate: startDate || null,
      expiryDate: expiryDate || null,
      premium: type === "INSURANCE" && premium ? Number(premium) : null,
      fileUrl: file?.url ?? null,
      fileName: file?.fileName ?? null,
      fileType: file?.fileType ?? null,
    };
    try {
      const res = await fetch(isEdit ? `/api/documents/${document.id}` : "/api/documents", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not save document.");
        setLoading(false);
        return;
      }
      toast.success("Document uploaded.");
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
      title={isEdit ? "Edit Document" : "Add Document"}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Vehicle" required value={vehicleId} error={errors.vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {vehicleName(v)}
              </option>
            ))}
          </Select>
          <Select label="Document Type" required value={type} onChange={(e) => setType(e.target.value)} disabled={isEdit}>
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>

        {type === "OTHER" && (
          <Input label="Document Name" required value={documentName} error={errors.documentName} onChange={(e) => setDocumentName(e.target.value)} />
        )}

        {type === "INSURANCE" && (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Insurance Company" value={issuer} onChange={(e) => setIssuer(e.target.value)} />
            <Input label="Premium" type="number" value={premium} onChange={(e) => setPremium(e.target.value)} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={type === "RC" ? "RC Number" : type === "INSURANCE" ? "Policy Number" : type === "FC" ? "FC Number" : "Document Number"}
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
          />
          {type === "RC" ? (
            <Input label="Registration Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          ) : (
            <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          )}
        </div>

        {type !== "RC" && (
          <Input
            label="Expiry Date"
            type="date"
            required
            value={expiryDate}
            error={errors.expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        )}

        <FileUpload folder="documents" value={file} onChange={setFile} />
      </div>
    </Modal>
  );
}
