"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PhotoUploader({
  label,
  folder,
  photos,
  onChange,
}: {
  label?: string;
  folder: string;
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFiles(files: FileList) {
    setLoading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) continue;
        const data = await res.json();
        uploaded.push(data.url);
      }
      onChange([...photos, ...uploaded]);
    } catch {
      toast.error("Some photos failed to upload.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {label && <label className="mb-1.5 block text-[13px] font-medium text-ink-2">{label}</label>}
      <div className="flex flex-wrap gap-2.5">
        {photos.map((url, i) => (
          <div key={i} className="relative size-20 rounded-xl overflow-hidden border border-border bg-surface-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(photos.filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex size-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-strong text-ink-3 hover:border-gold-500/50 hover:text-ink-1 transition-colors"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          <span className="text-[10.5px]">Add photo</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}
