import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function StepWelcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-full.png"
        alt="KAR GO RENTALS"
        className="mx-auto w-full max-w-[240px] mb-8"
        style={{ animation: "boot-in 700ms cubic-bezier(0.16,1,0.3,1) both" }}
      />

      <div className="mx-auto mb-8 inline-flex items-center gap-2.5 rounded-full border border-gold-500/25 bg-gold-500/10 px-4 py-1.5">
        <span className="size-1.5 rounded-full bg-gold-400" />
        <span className="text-[12px] font-medium tracking-wide text-gold-300">FIRST-TIME SETUP</span>
      </div>

      <h1 className="text-[36px] sm:text-[44px] font-semibold leading-[1.1] tracking-tight text-ink-1 mb-5">
        Build your <span className="gold-gradient-text">rental business.</span>
      </h1>
      <p className="text-body text-[16px] max-w-lg mx-auto mb-10">
        Set up your business, admins and fleet to get started.
      </p>

      <Button size="lg" onClick={onStart} className="mx-auto">
        Get Started
        <ArrowRight className="size-4" />
      </Button>

      <p className="text-secondary mt-8">Takes about 5 minutes · 2 vehicles · 2 admins</p>
    </div>
  );
}
