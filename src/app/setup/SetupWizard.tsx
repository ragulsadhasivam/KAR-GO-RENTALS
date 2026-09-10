"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SetupState,
  makeEmptyVehicle,
  makeEmptyDocs,
  makeEmptyPricing,
} from "./types";
import { StepWelcome } from "./steps/StepWelcome";
import { StepBusiness } from "./steps/StepBusiness";
import { StepAdmins } from "./steps/StepAdmins";
import { StepVehicles } from "./steps/StepVehicles";
import { StepDocuments } from "./steps/StepDocuments";
import { StepPricing } from "./steps/StepPricing";

const STEP_LABELS = ["Welcome", "Business", "Admins", "Fleet", "Documents", "Pricing"];

function initialState(): SetupState {
  const baleno = makeEmptyVehicle("baleno", "Maruti Suzuki NEXA", "Baleno");
  const ertiga = makeEmptyVehicle("ertiga", "Maruti Suzuki", "Ertiga");
  return {
    business: {
      name: "",
      logo: null,
      phone: "",
      whatsapp: "",
      email: "",
      address: "",
      city: "",
      state: "Tamil Nadu",
    },
    admins: [
      { name: "", mobile: "", email: "", password: "", photo: null },
      { name: "", mobile: "", email: "", password: "", photo: null },
    ],
    vehicles: [baleno, ertiga],
    documents: { baleno: makeEmptyDocs(), ertiga: makeEmptyDocs() },
    pricing: { baleno: makeEmptyPricing(), ertiga: makeEmptyPricing() },
  };
}

export function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<SetupState>(initialState());
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof SetupState>(key: K, value: SetupState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function handleFinish() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Setup failed. Please check your details.");
        setSubmitting(false);
        return;
      }
      toast.success("KAR GO RENTALS is ready.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-base relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[700px] rounded-full bg-gold-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 size-[500px] rounded-full bg-blue-500/10 blur-[140px]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {step > 0 && (
          <header className="shrink-0 px-6 sm:px-10 pt-8 pb-6">
            <div className="mx-auto max-w-3xl">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-meta text-gold-400">Step {step} of {STEP_LABELS.length - 1}</span>
                <span className="text-meta">{STEP_LABELS[step]}</span>
              </div>
              <div className="flex gap-1.5">
                {STEP_LABELS.slice(1).map((label, i) => (
                  <div
                    key={label}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors duration-300",
                      i + 1 <= step ? "bg-gradient-to-r from-gold-400 to-gold-600" : "bg-surface-3"
                    )}
                  />
                ))}
              </div>
            </div>
          </header>
        )}

        <main className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-3xl animate-fade-in" key={step}>
            {step === 0 && <StepWelcome onStart={() => setStep(1)} />}
            {step === 1 && (
              <StepBusiness
                data={state.business}
                onChange={(v) => update("business", v)}
                onBack={() => setStep(0)}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <StepAdmins
                data={state.admins}
                onChange={(v) => update("admins", v)}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <StepVehicles
                data={state.vehicles}
                onChange={(v) => {
                  update("vehicles", v);
                  const docs = { ...state.documents };
                  const pricing = { ...state.pricing };
                  for (const veh of v) {
                    if (!docs[veh.key]) docs[veh.key] = makeEmptyDocs();
                    if (!pricing[veh.key]) pricing[veh.key] = makeEmptyPricing();
                  }
                  update("documents", docs);
                  update("pricing", pricing);
                }}
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
              />
            )}
            {step === 4 && (
              <StepDocuments
                vehicles={state.vehicles}
                data={state.documents}
                onChange={(v) => update("documents", v)}
                onBack={() => setStep(3)}
                onNext={() => setStep(5)}
              />
            )}
            {step === 5 && (
              <StepPricing
                vehicles={state.vehicles}
                data={state.pricing}
                onChange={(v) => update("pricing", v)}
                onBack={() => setStep(4)}
                onFinish={handleFinish}
                submitting={submitting}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export function StepShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="glass-strong rounded-2xl p-6 sm:p-10 shadow-elevated">
      <div className="mb-8">
        <h1 className="text-page-title">{title}</h1>
        {subtitle && <p className="text-body mt-2">{subtitle}</p>}
      </div>
      <div className="space-y-6">{children}</div>
      <div className="mt-10 flex items-center justify-between border-t border-border-subtle pt-6">
        {footer}
      </div>
    </div>
  );
}

export function StepDoneIcon() {
  return (
    <div className="flex size-5 items-center justify-center rounded-full bg-success-500/15 text-success-400">
      <Check className="size-3" />
    </div>
  );
}
