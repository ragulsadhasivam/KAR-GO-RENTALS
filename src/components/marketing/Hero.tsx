"use client";

import { useRef, type PointerEvent } from "react";
import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { BOOKING_TEL_HREF } from "./bookingPhone";

// Tilt tuning — keep angles small so the full-bleed photo never shows an edge.
const MAX_ROTATE_Y = 5; // deg, left/right
const MAX_ROTATE_X = 3.5; // deg, up/down
const MAX_SHIFT = 18; // px, background drift
const TEXT_SHIFT = 8; // px, headline counter-drift for depth
const SPRING = { stiffness: 90, damping: 18, mass: 0.6 };

export function Hero({ city }: { city: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // Pointer position, normalised to -0.5 … 0.5 (0 = centre)
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);

  const rotateY = useTransform(sx, [-0.5, 0.5], [-MAX_ROTATE_Y, MAX_ROTATE_Y]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [MAX_ROTATE_X, -MAX_ROTATE_X]);
  const bgX = useTransform(sx, [-0.5, 0.5], [MAX_SHIFT, -MAX_SHIFT]);
  const bgY = useTransform(sy, [-0.5, 0.5], [MAX_SHIFT * 0.6, -MAX_SHIFT * 0.6]);
  const textX = useTransform(sx, [-0.5, 0.5], [-TEXT_SHIFT, TEXT_SHIFT]);
  const textY = useTransform(sy, [-0.5, 0.5], [-TEXT_SHIFT * 0.6, TEXT_SHIFT * 0.6]);

  // Soft light that follows the cursor across the car's paintwork
  const glareX = useTransform(sx, [-0.5, 0.5], [20, 80]);
  const glareY = useTransform(sy, [-0.5, 0.5], [25, 75]);
  const glare = useMotionTemplate`radial-gradient(700px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.14), transparent 60%)`;

  // Scroll parallax — also gives touch devices a sense of depth
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  function handlePointerMove(e: PointerEvent<HTMLElement>) {
    if (reduceMotion || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <section
      ref={sectionRef}
      id="top"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative min-h-screen sm:h-screen overflow-hidden bg-black"
    >
      {/* Full-bleed background photo — tilts in 3D with the cursor */}
      <motion.div
        className="absolute inset-0 z-0"
        style={reduceMotion ? undefined : { y: scrollY }}
      >
        <motion.div
          className="absolute will-change-transform"
          style={
            reduceMotion
              ? { inset: 0 }
              : {
                  inset: "-5%", // bleed so tilted edges stay off-screen
                  rotateX,
                  rotateY,
                  x: bgX,
                  y: bgY,
                  transformPerspective: 1400,
                }
          }
        >
          <Image
            src="/hero/kargo-hero-4k-v2.png"
            alt="KAR GO RENTALS — Maruti Suzuki Baleno"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[38%_center]"
          />
          {!reduceMotion && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 mix-blend-soft-light"
              style={{ backgroundImage: glare }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Minimal scrim — the photo already carries most of its own contrast */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/55 via-transparent to-black/70" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/35 via-transparent to-transparent sm:hidden" />

      <div className="relative z-10 flex h-full flex-col justify-between pt-24 pb-10 sm:pt-28 sm:pb-14">
        <motion.div
          className="mx-auto w-full max-w-[1600px] px-5 sm:px-10"
          style={reduceMotion ? undefined : { x: textX, y: textY }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.28em] text-gold-400">
              Self&#8209;Drive Rentals — {city}
            </p>
            <h1 className="mt-4 max-w-3xl text-[52px] leading-[0.94] font-bold uppercase tracking-tight text-white sm:text-[88px] lg:text-[112px]">
              Booked in
              <br />
              minutes.
            </h1>
          </motion.div>
        </motion.div>

        <div className="mx-auto flex w-full max-w-[1600px] flex-col-reverse gap-6 px-5 sm:flex-row sm:items-end sm:justify-between sm:px-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-sm text-[14.5px] leading-relaxed text-white/70"
          >
            Verified, fully-insured vehicles delivered to your door. Transparent pricing, zero
            hidden fees — every rental, effortless.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3"
          >
            <a
              href="#fleet"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:border-white/50"
            >
              Explore fleet <ArrowRight className="size-3.5" />
            </a>
            <a
              href={BOOKING_TEL_HREF}
              className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-[13px] font-semibold text-black transition-colors hover:bg-gold-400"
            >
              <Phone className="size-3.5" /> Call to book
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
