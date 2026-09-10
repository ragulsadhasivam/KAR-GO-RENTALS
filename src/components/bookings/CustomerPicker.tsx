"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, User, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CustomerPicker({
  value,
  onSelect,
}: {
  value: { id: string; fullName: string; mobile: string } | null;
  onSelect: (customer: { id: string; fullName: string; mobile: string } | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; fullName: string; mobile: string }[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults((data.customers ?? []).slice(0, 8));
    }, 200);
    return () => clearTimeout(t);
  }, [query, open]);

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3.5 h-11">
        <User className="size-4 text-ink-3" />
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] text-ink-1 font-medium truncate">{value.fullName}</p>
          <p className="text-[11.5px] text-ink-4">{value.mobile}</p>
        </div>
        <button type="button" onClick={() => onSelect(null)} className="text-ink-3 hover:text-ink-1">
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-4" />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or mobile number"
          className="h-11 w-full rounded-xl bg-surface-2 border border-border pl-10 pr-3 text-[13.5px] text-ink-1 placeholder:text-ink-4 focus-ring outline-none focus:border-gold-500/50"
        />
      </div>
      {open && (
        <div className="absolute top-12 left-0 w-full z-50 rounded-xl glass-strong shadow-elevated p-1.5 max-h-64 overflow-y-auto animate-fade-in">
          {results.length === 0 ? (
            <p className="text-secondary text-center py-4">
              {query ? "No customers found" : "Start typing to search"}
            </p>
          ) : (
            results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelect(c);
                  setOpen(false);
                }}
                className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface-2 transition-colors")}
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-surface-3 text-ink-3">
                  <User className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-ink-1">{c.fullName}</p>
                  <p className="text-[11.5px] text-ink-4">{c.mobile}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
