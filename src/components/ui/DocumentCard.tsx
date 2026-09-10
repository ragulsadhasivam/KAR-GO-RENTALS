import { FileText, Image as ImageIcon, Pencil, Trash2, Eye } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { getDocumentStatus } from "@/lib/services/documentStatus";
import { formatDate, vehicleName } from "@/lib/utils";

export function DocumentCard({
  document,
  onEdit,
  onDelete,
}: {
  document: any;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = document.expiryDate ? getDocumentStatus(document.expiryDate) : "NO_EXPIRY";
  const title = document.type === "OTHER" ? document.documentName : document.type;
  const subtitle = document.documentNumber || document.issuer || "—";

  return (
    <Card padding="sm" className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-card-title">{title}</p>
          <p className="text-secondary">{vehicleName(document.vehicle)}</p>
        </div>
        <StatusPill status={status} size="sm" />
      </div>

      <div className="flex items-center gap-2 text-secondary">
        <span className="truncate">{subtitle}</span>
      </div>

      {document.expiryDate && (
        <p className="text-[12px] text-ink-4">Expires {formatDate(document.expiryDate)}</p>
      )}

      <div className="flex items-center justify-between border-t border-border-subtle pt-3 mt-1">
        {document.fileUrl ? (
          <a
            href={document.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[12px] text-gold-400 hover:text-gold-300"
          >
            {document.fileType === "pdf" ? <FileText className="size-3.5" /> : <ImageIcon className="size-3.5" />}
            <Eye className="size-3 -ml-1" /> Preview
          </a>
        ) : (
          <span className="text-[12px] text-ink-4">No file</span>
        )}
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="rounded-lg p-1.5 text-ink-3 hover:bg-surface-2 hover:text-ink-1">
            <Pencil className="size-3.5" />
          </button>
          <button onClick={onDelete} className="rounded-lg p-1.5 text-ink-3 hover:bg-danger-500/15 hover:text-danger-400">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
}
