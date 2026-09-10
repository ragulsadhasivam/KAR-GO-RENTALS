"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, FileText, Loader2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FileUploadProps {
  label?: string;
  folder: string;
  value?: { url: string; fileName?: string; fileType?: string } | null;
  onChange: (value: { url: string; fileName: string; fileType: string } | null) => void;
  accept?: string;
  hint?: string;
  compact?: boolean;
  /** Renders as a circular avatar-style picker instead of the rectangular file row — for profile/person photos. */
  rounded?: boolean;
}

export function FileUpload({
  label,
  folder,
  value,
  onChange,
  accept = "image/*,application/pdf",
  hint = "JPG, PNG or PDF, up to 10MB",
  compact,
  rounded,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onChange({ url: data.url, fileName: data.fileName, fileType: data.fileType });
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      className="hidden"
      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
    />
  );

  if (rounded) {
    return (
      <div className="flex flex-col items-center gap-2">
        {label && <label className="self-start text-[13px] font-medium text-ink-2">{label}</label>}
        <div className="group relative">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="relative flex size-24 items-center justify-center overflow-hidden rounded-full border border-dashed border-border-strong bg-surface-2/50 transition-colors hover:border-gold-500/50 focus-ring"
          >
            {value?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.url} alt="" className="size-full object-cover" />
            ) : loading ? (
              <Loader2 className="size-5 animate-spin text-ink-3" />
            ) : (
              <UploadCloud className="size-5 text-ink-3" />
            )}
            {value?.url && !loading && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                <UploadCloud className="size-5 text-white" />
              </span>
            )}
          </button>
          {value?.url && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full border border-border bg-surface-3 text-ink-3 hover:bg-danger-500/15 hover:text-danger-400"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <span className="text-[11px] text-ink-4">{value?.url ? "Click photo to replace" : hint}</span>
        {fileInput}
      </div>
    );
  }

  if (value?.url) {
    const isPdf = value.fileType === "pdf" || value.url.endsWith(".pdf");
    return (
      <div className={cn("flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3", compact && "p-2")}>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-3 overflow-hidden">
          {isPdf ? (
            <FileText className="size-5 text-ink-3" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.url} alt="" className="size-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-ink-1">{value.fileName || "Uploaded file"}</p>
          <p className="text-[11px] text-ink-4">Uploaded</p>
        </div>
        <a href={value.url} target="_blank" rel="noreferrer" className="rounded-lg p-1.5 text-ink-3 hover:bg-surface-3 hover:text-ink-1">
          <Eye className="size-4" />
        </a>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-[12px] font-medium text-gold-400 hover:text-gold-300"
        >
          Replace
        </button>
        <button type="button" onClick={() => onChange(null)} className="rounded-lg p-1.5 text-ink-3 hover:bg-danger-500/15 hover:text-danger-400">
          <X className="size-4" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
    );
  }

  return (
    <div>
      {label && <label className="mb-1.5 block text-[13px] font-medium text-ink-2">{label}</label>}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-strong bg-surface-2/50 py-6 text-center transition-colors hover:border-gold-500/50 hover:bg-surface-2 focus-ring",
          compact && "py-4"
        )}
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin text-ink-3" />
        ) : (
          <UploadCloud className="size-5 text-ink-3" />
        )}
        <span className="text-[13px] text-ink-2">{loading ? "Uploading…" : "Click to upload"}</span>
        <span className="text-[11px] text-ink-4">{hint}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}
