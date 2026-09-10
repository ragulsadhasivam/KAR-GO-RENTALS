/**
 * Ambient lighting behind the app shell — a stack of purely decorative,
 * purely-CSS layers (deep gradient base, ambient glow, floating orbs,
 * a faint technical grid, large abstract outlines, tiny geometric shapes,
 * drifting dots and soft light trails) that give the dark theme depth
 * without ever competing with the actual UI for attention.
 *
 * Everything here animates via `transform`/`opacity` keyframes defined in
 * globals.css (no JS animation loop), parameterised per-instance through
 * CSS custom properties set in `style`. `.bg-anim` is the one class
 * `prefers-reduced-motion: reduce` switches off (see globals.css) — the
 * layers themselves stay put as still ambient light.
 */

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

const GLOWS: { className: string; style: Vars }[] = [
  // top-left — soft purple
  {
    className: "-top-[16%] -left-[12%] size-[620px] bg-[radial-gradient(circle,rgba(139,92,246,0.13),transparent_70%)]",
    style: { "--dx": "5%", "--dy": "4%", "--s": 1.07, "--dur": "38s", "--delay": "0s" },
  },
  // top-right — very subtle gold
  {
    className: "-top-[12%] -right-[10%] size-[560px] bg-[radial-gradient(circle,rgba(201,162,76,0.08),transparent_70%)]",
    style: { "--dx": "-4%", "--dy": "5%", "--s": 1.05, "--dur": "46s", "--delay": "-6s" },
  },
  // bottom-right — deep blue/violet
  {
    className: "-bottom-[18%] -right-[14%] size-[700px] bg-[radial-gradient(circle,rgba(76,124,240,0.12),transparent_70%)]",
    style: { "--dx": "-5%", "--dy": "-4%", "--s": 1.08, "--dur": "42s", "--delay": "-14s" },
  },
  // bottom-left — very subtle purple
  {
    className: "-bottom-[14%] -left-[10%] size-[540px] bg-[radial-gradient(circle,rgba(124,58,237,0.09),transparent_70%)]",
    style: { "--dx": "4%", "--dy": "-5%", "--s": 1.06, "--dur": "50s", "--delay": "-22s" },
  },
  // dead centre — very faint neutral depth glow
  {
    className: "top-1/2 left-1/2 size-[900px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(255,255,255,0.025),transparent_72%)]",
    style: { "--dx": "2%", "--dy": "2%", "--s": 1.03, "--dur": "58s", "--delay": "-9s" },
  },
];

const SHAPES: { className: string; style: Vars; kind: "square" | "diamond" | "circle" }[] = [
  { kind: "square", className: "top-[14%] left-[8%] size-14 border border-white/[0.06] rounded-md", style: { "--dur": "36s" } },
  { kind: "circle", className: "top-[64%] left-[6%] size-3 border border-gold-400/10 rounded-full", style: {} },
  { kind: "diamond", className: "top-[22%] left-[42%] size-10 border border-purple-400/10 rounded-md rotate-45", style: { "--dur": "42s" } },
  { kind: "square", className: "top-[78%] left-[38%] size-8 border border-white/[0.05] rounded-lg", style: { "--dur": "30s" } },
  { kind: "circle", className: "top-[10%] right-[16%] size-2.5 border border-blue-400/12 rounded-full", style: {} },
  { kind: "diamond", className: "top-[46%] right-[10%] size-16 border border-white/[0.05] rounded-xl rotate-45", style: { "--dur": "46s" } },
  { kind: "square", className: "bottom-[12%] right-[26%] size-6 border border-gold-400/10 rounded", style: { "--dur": "26s" } },
];

const DOTS: { top: string; left: string; size: string; color: string; style: Vars; mobile?: boolean }[] = [
  { top: "18%", left: "22%", size: "size-1.5", color: "bg-purple-400/40", style: { "--dx": "8px", "--dy": "-14px", "--op": 0.45, "--dur": "18s" }, mobile: true },
  { top: "30%", left: "72%", size: "size-1", color: "bg-gold-400/40", style: { "--dx": "-10px", "--dy": "10px", "--op": 0.4, "--dur": "22s", "--delay": "-4s" }, mobile: true },
  { top: "58%", left: "12%", size: "size-1", color: "bg-blue-400/40", style: { "--dx": "6px", "--dy": "12px", "--op": 0.4, "--dur": "20s", "--delay": "-9s" } },
  { top: "70%", left: "60%", size: "size-1.5", color: "bg-purple-400/35", style: { "--dx": "-8px", "--dy": "-10px", "--op": 0.4, "--dur": "26s", "--delay": "-2s" }, mobile: true },
  { top: "42%", left: "90%", size: "size-1", color: "bg-white/25", style: { "--dx": "-6px", "--dy": "8px", "--op": 0.35, "--dur": "24s", "--delay": "-12s" } },
  { top: "84%", left: "20%", size: "size-1", color: "bg-gold-400/35", style: { "--dx": "8px", "--dy": "-8px", "--op": 0.35, "--dur": "19s", "--delay": "-7s" } },
  { top: "8%", left: "55%", size: "size-1.5", color: "bg-blue-400/35", style: { "--dx": "-6px", "--dy": "10px", "--op": 0.4, "--dur": "23s", "--delay": "-15s" }, mobile: true },
  { top: "50%", left: "36%", size: "size-1", color: "bg-purple-400/30", style: { "--dx": "10px", "--dy": "6px", "--op": 0.3, "--dur": "21s", "--delay": "-5s" } },
  { top: "94%", left: "48%", size: "size-1", color: "bg-white/20", style: { "--dx": "-8px", "--dy": "-6px", "--op": 0.3, "--dur": "27s", "--delay": "-10s" } },
  { top: "26%", left: "86%", size: "size-1.5", color: "bg-gold-400/30", style: { "--dx": "6px", "--dy": "8px", "--op": 0.35, "--dur": "25s", "--delay": "-3s" } },
];

export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* 1 — deep layered base (near-black → charcoal → a hint of violet), replacing a flat black canvas */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(140% 100% at 15% 0%, #100e18 0%, transparent 55%), " +
            "radial-gradient(120% 90% at 100% 100%, #0c1020 0%, transparent 55%), " +
            "linear-gradient(180deg, #08080a 0%, #0a090d 45%, #08080a 100%)",
        }}
      />

      {/* 2 & 3 — ambient glow sources + slow floating orbs (same elements do both jobs) */}
      {GLOWS.map((g, i) => (
        <div key={i} className={`bg-anim animate-orb absolute rounded-full blur-3xl ${g.className}`} style={g.style} />
      ))}

      {/* 6 — subtle technical grid, faded toward the edges so it never reads as a hard pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(75% 75% at 50% 40%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(75% 75% at 50% 40%, black 30%, transparent 100%)",
        }}
      />

      {/* 7 — large abstract outline shapes, far behind everything */}
      <div
        className="bg-anim animate-outline absolute -top-[6%] left-[20%] size-[520px] rounded-[64px] border border-white/[0.04]"
        style={{ "--dur": "54s" } as Vars}
      />
      <div
        className="bg-anim animate-outline absolute top-[38%] -right-[8%] size-[420px] rounded-full border border-purple-400/[0.06]"
        style={{ "--dur": "60s", "--delay": "-18s" } as Vars}
      />
      <div
        className="bg-anim animate-outline absolute bottom-[2%] left-[6%] size-[380px] rotate-12 rounded-[48px] border border-gold-400/[0.05] hidden sm:block"
        style={{ "--dur": "48s", "--delay": "-30s" } as Vars}
      />

      {/* 4 — small floating geometric elements (squares / diamonds / circles) */}
      {SHAPES.map((s, i) => (
        <div
          key={i}
          className={`bg-anim absolute ${s.className} ${
            s.kind === "diamond" ? (i % 2 ? "animate-spin-ccw" : "animate-spin-cw") : i % 3 === 0 ? "animate-spin-cw" : ""
          } ${i >= 4 ? "hidden sm:block" : ""}`}
          style={s.style}
        />
      ))}

      {/* 5 — tiny drifting digital particles */}
      {DOTS.map((d, i) => (
        <div
          key={i}
          className={`bg-anim animate-dot absolute rounded-full blur-[1px] ${d.size} ${d.color} ${d.mobile ? "" : "hidden sm:block"}`}
          style={{ top: d.top, left: d.left, ...d.style }}
        />
      ))}

      {/* 8 — soft light trails, like a faint reflection sweeping across a car body */}
      <div
        className="bg-anim animate-trail absolute top-[12%] left-0 h-px w-[45%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent blur-[2px] hidden sm:block"
        style={{ "--dur": "34s", "--op": 0.6 } as Vars}
      />
      <div
        className="bg-anim animate-trail absolute top-[64%] left-0 h-px w-[38%] rotate-[-14deg] bg-gradient-to-r from-transparent via-gold-400/[0.10] to-transparent blur-[2px] hidden sm:block"
        style={{ "--dur": "40s", "--delay": "-16s", "--op": 0.5 } as Vars}
      />
    </div>
  );
}
