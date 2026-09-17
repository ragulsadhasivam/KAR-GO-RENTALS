"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Info, UserPlus, Users } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { CustomerPicker } from "./CustomerPicker";
import { PAYMENT_METHODS, ID_PROOF_TYPES } from "@/lib/constants";
import { cn, vehicleName } from "@/lib/utils";

interface NewBookingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: any[];
}

export function NewBookingDrawer({ open, onOpenChange, vehicles }: NewBookingDrawerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [customer, setCustomer] = useState<{ id: string; fullName: string; mobile: string } | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    fullName: "",
    mobile: "",
    drivingLicenceNumber: "",
    licenceExpiry: "",
    idProofType: "",
    idProofNumber: "",
    address: "",
    emergencyContact: "",
  });

  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [pickupLocation, setPickupLocation] = useState("");
  const [currentKm, setCurrentKm] = useState<number | "">("");

  const [dailyRate, setDailyRate] = useState(0);
  const [extraHourRate, setExtraHourRate] = useState(0);
  const [extraKmRate, setExtraKmRate] = useState(0);
  const [discount, setDiscount] = useState(0);

  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  useEffect(() => {
    if (selectedVehicle?.pricing) {
      setDailyRate(selectedVehicle.pricing.dailyRate);
      setExtraHourRate(selectedVehicle.pricing.extraHourRate);
      setExtraKmRate(selectedVehicle.pricing.extraKmRate);
    }
    if (selectedVehicle && typeof selectedVehicle.currentKm === "number") {
      setCurrentKm(selectedVehicle.currentKm);
    }
  }, [vehicleId]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickupAt = useMemo(() => (pickupDate ? new Date(`${pickupDate}T${pickupTime}`) : null), [pickupDate, pickupTime]);

  function resetAndClose() {
    onOpenChange(false);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (mode === "existing" && !customer) e.customer = "Select a customer";
    if (mode === "new") {
      if (!newCustomer.fullName.trim()) e.fullName = "Required";
      if (!/^[6-9]\d{9}$/.test(newCustomer.mobile)) e.mobile = "Enter a valid 10-digit mobile number";
      if (!newCustomer.drivingLicenceNumber.trim()) e.drivingLicenceNumber = "Required";
      if (!newCustomer.licenceExpiry) e.licenceExpiry = "Required";
      if (!newCustomer.idProofType) e.idProofType = "Required";
      if (!newCustomer.idProofNumber.trim()) e.idProofNumber = "Required";
      if (!newCustomer.address.trim()) e.address = "Required";
    }
    if (!vehicleId) e.vehicleId = "Select a vehicle";
    else if (selectedVehicle && selectedVehicle.status !== "AVAILABLE") {
      e.vehicleId = "This vehicle is not currently available";
    }
    if (!pickupDate) e.pickupDate = "Required";
    if (!pickupLocation.trim()) e.pickupLocation = "Required";
    if (currentKm === "" || Number(currentKm) < 0) e.currentKm = "Enter a valid KM reading";
    if (amountPaid < 0) e.amountPaid = "Enter a valid amount";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        customerId: mode === "existing" ? customer?.id : undefined,
        newCustomer: mode === "new" ? newCustomer : undefined,
        vehicleId,
        pickupAt: pickupAt?.toISOString(),
        pickupLocation,
        currentKm: currentKm === "" ? undefined : Number(currentKm),
        dailyRate,
        extraHourRate,
        extraKmRate,
        discount,
        amountPaid,
        paymentMethod,
      };
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not create booking.");
        setSubmitting(false);
        return;
      }
      if (data.whatsapp?.status === "sent") {
        toast.success("Booking created successfully. WhatsApp confirmation sent.");
      } else {
        toast.success("Booking created successfully.", {
          description: "WhatsApp confirmation could not be sent. You can resend it from the booking page.",
        });
      }
      resetAndClose();
      router.push(`/bookings/${data.booking.id}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="New Booking"
      description="Create a rental booking for a customer."
      width="lg"
      footer={
        <>
          <Button variant="secondary" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            Create Booking
          </Button>
        </>
      }
    >
      <div className="space-y-8">
        <Section title="Customer">
          <div className="flex gap-2 mb-4">
            <ModeButton active={mode === "existing"} onClick={() => setMode("existing")} icon={Users}>
              Existing Customer
            </ModeButton>
            <ModeButton active={mode === "new"} onClick={() => setMode("new")} icon={UserPlus}>
              New Customer
            </ModeButton>
          </div>

          {mode === "existing" ? (
            <div>
              <CustomerPicker value={customer} onSelect={setCustomer} />
              {errors.customer && <p className="text-[12px] text-danger-400 mt-1.5">{errors.customer}</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                value={newCustomer.fullName}
                error={errors.fullName}
                onChange={(e) => setNewCustomer((c) => ({ ...c, fullName: e.target.value }))}
                wrapClassName="sm:col-span-2"
              />
              <Input
                label="Mobile Number"
                required
                value={newCustomer.mobile}
                error={errors.mobile}
                onChange={(e) => setNewCustomer((c) => ({ ...c, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
              />
              <Input
                label="Emergency Contact"
                value={newCustomer.emergencyContact}
                onChange={(e) => setNewCustomer((c) => ({ ...c, emergencyContact: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
              />
              <Input
                label="Driving Licence Number"
                required
                value={newCustomer.drivingLicenceNumber}
                error={errors.drivingLicenceNumber}
                onChange={(e) => setNewCustomer((c) => ({ ...c, drivingLicenceNumber: e.target.value.toUpperCase() }))}
              />
              <Input
                label="Licence Expiry"
                type="date"
                required
                value={newCustomer.licenceExpiry}
                error={errors.licenceExpiry}
                onChange={(e) => setNewCustomer((c) => ({ ...c, licenceExpiry: e.target.value }))}
              />
              <Select
                label="ID Proof Type"
                required
                placeholder="Select"
                value={newCustomer.idProofType}
                error={errors.idProofType}
                onChange={(e) => setNewCustomer((c) => ({ ...c, idProofType: e.target.value }))}
              >
                {ID_PROOF_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
              <Input
                label="ID Proof Number"
                required
                value={newCustomer.idProofNumber}
                error={errors.idProofNumber}
                onChange={(e) => setNewCustomer((c) => ({ ...c, idProofNumber: e.target.value.toUpperCase() }))}
              />
              <Input
                label="Address"
                required
                value={newCustomer.address}
                error={errors.address}
                onChange={(e) => setNewCustomer((c) => ({ ...c, address: e.target.value }))}
                wrapClassName="sm:col-span-2"
              />
            </div>
          )}
        </Section>

        <Section title="Vehicle">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
            {vehicles.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVehicleId(v.id)}
                disabled={v.status !== "AVAILABLE"}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  vehicleId === v.id ? "border-gold-500/50 bg-gold-500/5" : "border-border hover:border-border-strong",
                  v.status !== "AVAILABLE" && "opacity-40 cursor-not-allowed"
                )}
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-surface-3 overflow-hidden shrink-0">
                  {v.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.imageUrl} alt="" className="h-full w-full object-contain p-0.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink-1 truncate">{vehicleName(v)}</p>
                  <p className="text-[11.5px] text-ink-4 font-mono">{v.registrationNumber}</p>
                  {v.status !== "AVAILABLE" && <p className="text-[11px] text-warning-400 mt-0.5">{v.status}</p>}
                </div>
              </button>
            ))}
          </div>
          {errors.vehicleId && <p className="text-[12px] text-danger-400 mb-2">{errors.vehicleId}</p>}

          <Input
            label="Current KM"
            type="number"
            required
            min={0}
            placeholder="Enter current vehicle KM"
            value={currentKm}
            error={errors.currentKm}
            hint="Vehicle's odometer reading at the time of this booking"
            onChange={(e) => setCurrentKm(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
            wrapClassName="mt-4"
          />
        </Section>

        <Section title="Pickup">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Pickup Date" type="date" required value={pickupDate} error={errors.pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
            <Input label="Pickup Time" type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
            <Input
              label="Pickup Location"
              required
              value={pickupLocation}
              error={errors.pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              wrapClassName="col-span-2"
            />
          </div>
        </Section>

        <Section title="Pricing">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Input label="Daily Rate" type="number" value={dailyRate} onChange={(e) => setDailyRate(Number(e.target.value))} />
            <Input label="Extra Hour Rate" type="number" value={extraHourRate} onChange={(e) => setExtraHourRate(Number(e.target.value))} />
            <Input label="Extra KM Rate" type="number" value={extraKmRate} onChange={(e) => setExtraKmRate(Number(e.target.value))} />
            <Input label="Discount" type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
          </div>
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3 text-[12.5px] text-ink-3">
            <Info className="size-3.5 mt-0.5 shrink-0" />
            <p>
              The final rental amount depends on the actual rental duration and will be calculated automatically when
              the vehicle is returned.
            </p>
          </div>
        </Section>

        <Section title="Payment">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Amount Paid"
              type="number"
              value={amountPaid}
              error={errors.amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
            />
            <Select label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m.replace("_", " ")}
                </option>
              ))}
            </Select>
          </div>
        </Section>
      </div>
    </Drawer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-section-title mb-4">{title}</h3>
      {children}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-xl px-4 h-9 text-[13px] font-medium border transition-colors",
        active ? "border-gold-500/40 bg-gold-500/10 text-gold-300" : "border-border text-ink-3 hover:text-ink-1"
      )}
    >
      <Icon className="size-4" />
      {children}
    </button>
  );
}
