import { cn } from "@/lib/utils";

/**
 * The real KAR GO RENTALS mark (the car-outline motif from the uploaded
 * logo), scaled with `object-fit: contain` inside a flex-centred, padded
 * box — the full asset is always visible, never cropped, with a small
 * margin of breathing room on every side. The box's own width/height
 * (via `className`) is the only thing that changes between contexts; the
 * image itself is never recoloured, filtered, stretched, or forced into
 * a circle.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center justify-center p-1", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.png" alt="KAR GO RENTALS" className="max-h-full max-w-full object-contain" />
    </div>
  );
}
