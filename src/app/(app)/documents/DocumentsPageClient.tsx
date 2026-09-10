"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DocumentCard } from "@/components/ui/DocumentCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DocumentFormModal } from "@/components/documents/DocumentFormModal";
import { DOCUMENT_TYPES, DOCUMENT_STATUS } from "@/lib/constants";
import { getDocumentStatus } from "@/lib/services/documentStatus";
import { vehicleName } from "@/lib/utils";
import { toast } from "sonner";

export function DocumentsPageClient({ documents, vehicles }: { documents: any[]; vehicles: any[] }) {
  const router = useRouter();
  const [vehicleFilter, setVehicleFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      if (vehicleFilter !== "ALL" && d.vehicleId !== vehicleFilter) return false;
      if (typeFilter !== "ALL" && d.type !== typeFilter) return false;
      if (statusFilter !== "ALL") {
        const status = d.expiryDate ? getDocumentStatus(d.expiryDate) : "NO_EXPIRY";
        if (status !== statusFilter) return false;
      }
      return true;
    });
  }, [documents, vehicleFilter, typeFilter, statusFilter]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Could not delete document.");
      } else {
        toast.success("Document deleted.");
        router.refresh();
      }
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title">Documents</h1>
          <p className="text-body mt-1.5">RC, insurance, FC and other vehicle documents in one place.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" /> Add Document
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)} className="w-auto min-w-[180px]">
          <option value="ALL">All Vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {vehicleName(v)}
            </option>
          ))}
        </Select>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-auto min-w-[160px]">
          <option value="ALL">All Types</option>
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto min-w-[160px]">
          <option value="ALL">All Statuses</option>
          {DOCUMENT_STATUS.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description="Upload RC, insurance, FC or other documents for your vehicles."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" /> Add Document
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <DocumentCard
              key={d.id}
              document={d}
              onEdit={() => {
                setEditing(d);
                setFormOpen(true);
              }}
              onDelete={() => setDeleteId(d.id)}
            />
          ))}
        </div>
      )}

      <DocumentFormModal open={formOpen} onOpenChange={setFormOpen} vehicles={vehicles} document={editing} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete document"
        description="This document will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
