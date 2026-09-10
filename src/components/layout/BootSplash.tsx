"use client";

import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "kargo_booted";

/**
 * A hard cap on how long the splash can ever stay on screen, independent of
 * the CSS animation lifecycle. If `animationend` never fires for any reason
 * (browser quirk, tab backgrounded during boot, etc.) this guarantees the
 * overlay still resolves instead of blocking the app underneath forever.
 */
const MAX_HOLD_MS = 2200;
const HOLD_AFTER_ENTER_MS = 500;

type Phase = "idle" | "entering" | "holding" | "exiting" | "done";

export function BootSplash() {
  const [phase, setPhase] = useState<Phase>("idle");
  const resolvedRef = useRef(false);

  // Decide once, on mount, whether this browser session has already seen the
  // splash. This effect owns ONLY that decision — it must not also own the
  // animation timers, otherwise React Strict Mode's dev-only
  // mount -> cleanup -> mount replay (which runs before this state update is
  // even painted) cancels a timer started here and the guard above then
  // blocks the replay from starting a new one, leaving the splash stuck
  // forever on first load. Splitting "should we show it" from "how long does
  // it stay" keeps each effect's cleanup idempotent under that replay.
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setPhase("entering");
  }, []);

  // Owns the timed phases. Only starts once `phase` actually becomes
  // "entering", i.e. after the mount-decision effect above has settled — so
  // it is never subject to that same replay, and its cleanup always pairs
  // with a timer it actually owns.
  useEffect(() => {
    if (phase !== "entering") return;
    const fallback = setTimeout(() => setPhase("exiting"), MAX_HOLD_MS);
    return () => clearTimeout(fallback);
  }, [phase]);

  useEffect(() => {
    if (phase !== "holding") return;
    const t = setTimeout(() => setPhase("exiting"), HOLD_AFTER_ENTER_MS);
    return () => clearTimeout(t);
  }, [phase]);

  function resolveEnter() {
    // onAnimationEnd can fire more than once (bubbling from nothing else
    // here, but cheap to guard) — only the first call should advance phase.
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setPhase((p) => (p === "entering" ? "holding" : p));
  }

  if (phase === "idle" || phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-base transition-opacity duration-[450ms] ease-out"
      style={{ opacity: phase === "exiting" ? 0 : 1 }}
      onTransitionEnd={() => phase === "exiting" && setPhase("done")}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/10 blur-[120px]" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-full.png"
        alt="KAR GO RENTALS"
        className="relative w-full max-w-[280px] px-8 animate-boot-in"
        onAnimationEnd={resolveEnter}
      />
    </div>
  );
}
