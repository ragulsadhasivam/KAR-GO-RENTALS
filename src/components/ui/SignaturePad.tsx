"use client";

import { useRef, useState, useEffect } from "react";
import { Eraser, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SignaturePad({
  label = "Customer Signature",
  onSave,
  value,
}: {
  label?: string;
  value?: string | null;
  onSave: (url: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasDrawn = useRef(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#f5f5f7";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const point = "touches" in e ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    drawing.current = true;
    hasDrawn.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function move(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function end() {
    drawing.current = false;
  }

  function clear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false;
    onSave(null);
  }

  async function save() {
    if (!hasDrawn.current) return;
    setSaving(true);
    try {
      const canvas = canvasRef.current!;
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;
      const formData = new FormData();
      formData.append("file", new File([blob], "signature.png", { type: "image/png" }));
      formData.append("folder", "signatures");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      onSave(data.url);
    } finally {
      setSaving(false);
    }
  }

  if (value) {
    return (
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-ink-2">{label}</label>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Signature" className="h-16 rounded-lg bg-surface-3 px-2" />
          <button type="button" onClick={() => onSave(null)} className="text-[12px] font-medium text-gold-400 hover:text-gold-300">
            Re-sign
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-ink-2">{label}</label>
      <div className="rounded-xl border border-border bg-surface-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={480}
          height={140}
          className="w-full h-[140px] touch-none cursor-crosshair"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
        <div className="flex items-center justify-between border-t border-border-subtle px-3 py-2">
          <button type="button" onClick={clear} className="flex items-center gap-1.5 text-[12px] text-ink-3 hover:text-ink-1">
            <Eraser className="size-3.5" /> Clear
          </button>
          <Button size="sm" variant="secondary" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Save Signature
          </Button>
        </div>
      </div>
    </div>
  );
}
