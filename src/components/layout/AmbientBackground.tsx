/**
 * Ambient lighting behind the app shell — deliberately restrained: a deep
 * layered base gradient, two soft ambient glows, a faint technical grid,
 * and a single hairline outline for depth. No floating particles or
 * decorative geometric shapes — every layer here supports the dark
 * automotive surface without competing with the business data on top of it.
 *
 * Motion is CSS `transform`/`opacity` only (keyframes in globals.css, no JS
 * loop). `.bg-anim` is the one class `prefers-reduced-motion: reduce`
 * switches off — layers stay put as still ambient light in that case.
 */

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

const GLOWS: { className: string; style: Vars }[] = [
  // top-right — very subtle gold, echoes the brand accent
  {
    className: "-top-[12%] -right-[10%] size-[560px] bg-[radial-gradient(circle,rgba(201,162,76,0.07),transparent_70%)]",
    style: { "--dx": "-3%", "--dy": "4%", "--s": 1.04, "--dur": "50s", "--delay": "-6s" },
  },
  // bottom-left — deep blue/violet, balances the composition
  {
    className: "-bottom-[16%] -left-[12%] size-[620px] bg-[radial-gradient(circle,rgba(76,124,240,0.08),transparent_70%)]",
    style: { "--dx": "3%", "--dy": "-3%", "--s": 1.05, "--dur": "56s", "--delay": "-20s" },
  },
];

export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* deep layered base (near-black → charcoal → a hint of violet) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(140% 100% at 15% 0%, #100e18 0%, transparent 55%), " +
            "radial-gradient(120% 90% at 100% 100%, #0c1020 0%, transparent 55%), " +
            "linear-gradient(180deg, #08080a 0%, #0a090d 45%, #08080a 100%)",
        }}
      />

      {GLOWS.map((g, i) => (
        <div key={i} className={`bg-anim animate-orb absolute rounded-full blur-3xl ${g.className}`} style={g.style} />
      ))}

      {/* extremely subtle technical grid, faded toward the edges */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(75% 75% at 50% 40%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(75% 75% at 50% 40%, black 30%, transparent 100%)",
        }}
      />

      {/* single hairline outline, far behind everything — quiet sense of depth, not decoration */}
      <div
        className="bg-anim animate-outline absolute top-[30%] -right-[10%] size-[460px] rounded-full border border-white/[0.04] hidden sm:block"
        style={{ "--dur": "60s", "--delay": "-18s" } as Vars}
      />
    </div>
  );
}
