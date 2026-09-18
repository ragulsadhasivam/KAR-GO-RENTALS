"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  Percent,
  ShieldCheck,
  Car,
  Bell,
  UserCircle,
  Plus,
  Pencil,
  Ban,
  CheckCircle2,
  Eye,
  EyeOff,
  Archive,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { FileUpload } from "@/components/ui/FileUpload";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/StatusPill";
import { Avatar } from "@/components/layout/AdminMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { VehicleFormModal } from "@/components/vehicles/VehicleFormModal";
import { TN_CITIES } from "@/lib/constants";
import { vehicleName, cn } from "@/lib/utils";

const TABS = [
  { value: "business", label: "Business", icon: Building2 },
  { value: "rental", label: "Rental", icon: Percent },
  { value: "admins", label: "Admins", icon: ShieldCheck },
  { value: "cars", label: "Cars", icon: Car },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "account", label: "Account", icon: UserCircle },
];

export function SettingsPageClient({ business, admins, vehicles, currentAdminId }: any) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") ?? "business");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title">Settings</h1>
        <p className="text-body mt-1.5">Manage your business, admins, fleet and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:w-56 shrink-0">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3.5 h-10 text-[13.5px] font-medium whitespace-nowrap transition-colors shrink-0",
                tab === t.value ? "bg-surface-2 text-ink-1 ring-1 ring-border" : "text-ink-3 hover:bg-surface-2 hover:text-ink-1"
              )}
            >
              <t.icon className={cn("size-4", tab === t.value && "text-gold-400")} />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {tab === "business" && <BusinessSection business={business} />}
          {tab === "rental" && <RentalSection vehicles={vehicles} business={business} />}
          {tab === "admins" && <AdminsSection admins={admins} currentAdminId={currentAdminId} />}
          {tab === "cars" && <CarsSection vehicles={vehicles} />}
          {tab === "notifications" && <NotificationsSection business={business} />}
          {tab === "account" && <AccountSection currentAdminId={currentAdminId} admins={admins} />}
        </div>
      </div>
    </div>
  );
}

function BusinessSection({ business }: { business: any }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: business.name,
    logo: business.logoUrl ? { url: business.logoUrl, fileName: "logo", fileType: "image" } : null,
    phone: business.phone,
    whatsapp: business.whatsapp,
    email: business.email,
    address: business.address,
    city: business.city,
    state: business.state,
  });
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, logoUrl: form.logo?.url }),
      });
      if (!res.ok) {
        toast.error("Could not save changes.");
      } else {
        toast.success("Business information updated.");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Business Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} wrapClassName="sm:col-span-2" />
        <div className="sm:col-span-2">
          <FileUpload label="Business Logo" folder="business" value={form.logo} onChange={(v) => setForm((f) => ({ ...f, logo: v }))} compact />
        </div>
        <Input label="Business Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <Input label="WhatsApp Number" value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} />
        <Input label="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} wrapClassName="sm:col-span-2" />
        <Input label="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} wrapClassName="sm:col-span-2" />
        <Select label="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}>
          {TN_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Input label="State" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
      </div>
      <div className="mt-5 flex justify-end">
        <Button onClick={handleSave} loading={loading}>
          Save Changes
        </Button>
      </div>
    </Card>
  );
}

function RentalSection({ vehicles, business }: { vehicles: any[]; business: any }) {
  const router = useRouter();
  const [prices, setPrices] = useState<Record<string, any>>(
    Object.fromEntries(vehicles.map((v) => [v.id, v.pricing ?? { dailyRate: "", extraHourRate: "", extraKmRate: "" }]))
  );
  const [terms, setTerms] = useState(business.rentalTerms ?? "");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingTerms, setSavingTerms] = useState(false);

  async function savePricing(vehicleId: string) {
    setSavingId(vehicleId);
    try {
      const p = prices[vehicleId];
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricing: p }),
      });
      if (!res.ok) toast.error("Could not save pricing.");
      else {
        toast.success("Pricing updated.");
        router.refresh();
      }
    } finally {
      setSavingId(null);
    }
  }

  async function saveTerms() {
    setSavingTerms(true);
    try {
      const res = await fetch("/api/settings/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentalTerms: terms }),
      });
      if (!res.ok) toast.error("Could not save rental terms.");
      else toast.success("Rental terms updated.");
    } finally {
      setSavingTerms(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card padding="md">
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {vehicles.map((v) => (
            <div key={v.id} className="rounded-xl border border-border-subtle bg-surface-2/50 p-4">
              <p className="text-card-title mb-3">{vehicleName(v)}</p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <Input
                  label="Daily Rate"
                  type="number"
                  value={prices[v.id]?.dailyRate ?? ""}
                  onChange={(e) => setPrices((p) => ({ ...p, [v.id]: { ...p[v.id], dailyRate: e.target.value } }))}
                />
                <Input
                  label="Extra Hour Rate"
                  type="number"
                  value={prices[v.id]?.extraHourRate ?? ""}
                  onChange={(e) => setPrices((p) => ({ ...p, [v.id]: { ...p[v.id], extraHourRate: e.target.value } }))}
                />
                <Input
                  label="Extra KM Rate"
                  type="number"
                  value={prices[v.id]?.extraKmRate ?? ""}
                  onChange={(e) => setPrices((p) => ({ ...p, [v.id]: { ...p[v.id], extraKmRate: e.target.value } }))}
                />
                <Button variant="secondary" onClick={() => savePricing(v.id)} loading={savingId === v.id}>
                  Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Rental Terms</CardTitle>
        </CardHeader>
        <Textarea
          placeholder="Terms shown to customers on booking receipts (fuel policy, late return policy, etc.)"
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          className="min-h-[140px]"
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={saveTerms} loading={savingTerms}>
            Save Terms
          </Button>
        </div>
      </Card>
    </div>
  );
}

function AdminsSection({ admins, currentAdminId }: { admins: any[]; currentAdminId?: string }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [disableTarget, setDisableTarget] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function toggleDisabled(admin: any) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDisabled: !admin.isDisabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not update admin.");
      } else {
        toast.success(admin.isDisabled ? "Admin enabled." : "Admin disabled.");
        router.refresh();
      }
    } finally {
      setLoading(false);
      setDisableTarget(null);
    }
  }

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Administrators</CardTitle>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-3.5" /> Add Admin
        </Button>
      </CardHeader>
      <div className="space-y-3">
        {admins.map((admin: any) => (
          <div key={admin.id} className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-2/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar name={admin.name} photoUrl={admin.photoUrl} />
              <div>
                <p className="text-[13.5px] font-medium text-ink-1">
                  {admin.name} {admin.id === currentAdminId && <span className="text-ink-4">(You)</span>}
                </p>
                <p className="text-secondary">{admin.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={admin.isDisabled ? "danger" : "success"}>{admin.isDisabled ? "Disabled" : "Full Access"}</Badge>
              <button onClick={() => setEditing(admin)} aria-label={`Edit ${admin.name}`} className="rounded-md p-2 text-ink-3 hover:bg-surface-3 hover:text-ink-1">
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => setDisableTarget(admin)}
                className="rounded-md p-2 text-ink-3 hover:bg-surface-3 hover:text-ink-1"
                title={admin.isDisabled ? "Enable" : "Disable"}
                aria-label={admin.isDisabled ? `Enable ${admin.name}` : `Disable ${admin.name}`}
              >
                {admin.isDisabled ? <CheckCircle2 className="size-4" /> : <Ban className="size-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <AdminFormModal key="new-admin" open={addOpen} onOpenChange={setAddOpen} />
      {editing && <AdminFormModal key={editing.id} open={!!editing} onOpenChange={() => setEditing(null)} admin={editing} />}
      <ConfirmDialog
        open={!!disableTarget}
        onOpenChange={() => setDisableTarget(null)}
        title={disableTarget?.isDisabled ? "Enable admin" : "Disable admin"}
        description={
          disableTarget?.isDisabled
            ? `${disableTarget?.name} will regain access to the application.`
            : `${disableTarget?.name} will lose access to the application immediately.`
        }
        confirmLabel={disableTarget?.isDisabled ? "Enable" : "Disable"}
        variant={disableTarget?.isDisabled ? "primary" : "danger"}
        loading={loading}
        onConfirm={() => toggleDisabled(disableTarget)}
      />
    </Card>
  );
}

function AdminFormModal({ open, onOpenChange, admin }: { open: boolean; onOpenChange: (o: boolean) => void; admin?: any }) {
  const router = useRouter();
  const isEdit = !!admin;
  const [name, setName] = useState(admin?.name ?? "");
  const [mobile, setMobile] = useState(admin?.mobile ?? "");
  const [email, setEmail] = useState(admin?.email ?? "");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<any>(admin?.photoUrl ? { url: admin.photoUrl } : null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !/^[6-9]\d{9}$/.test(mobile) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please fill all required fields correctly.");
      return;
    }
    if (!isEdit && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/admins/${admin.id}` : "/api/admins", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile, email, password: password || undefined, photoUrl: photo?.url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save admin.");
        setLoading(false);
        return;
      }
      toast.success(isEdit ? "Admin updated." : "Admin added.");
      onOpenChange(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Admin" : "Add Admin"}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {isEdit ? "Save Changes" : "Add Admin"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FileUpload folder="admins" value={photo} onChange={setPhoto} compact hint="Profile photo (optional)" />
        <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Mobile"
          required
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
        />
        <Input label="Email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          label={isEdit ? "New Password" : "Password"}
          required={!isEdit}
          type="password"
          hint={isEdit ? "Leave blank to keep current password" : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-[13px] text-danger-400">{error}</p>}
      </div>
    </Modal>
  );
}

function CarsSection({ vehicles }: { vehicles: any[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [archiveTarget, setArchiveTarget] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function archive() {
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${archiveTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      if (!res.ok) toast.error("Could not archive vehicle.");
      else {
        toast.success("Vehicle archived.");
        router.refresh();
      }
    } finally {
      setLoading(false);
      setArchiveTarget(null);
    }
  }

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Fleet</CardTitle>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-3.5" /> Add Vehicle
        </Button>
      </CardHeader>
      <div className="space-y-3">
        {vehicles.map((v) => (
          <div key={v.id} className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-2/50 px-4 py-3">
            <div>
              <p className="text-[13.5px] font-medium text-ink-1">{vehicleName(v)}</p>
              <p className="text-secondary font-mono">{v.registrationNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(v)} aria-label={`Edit ${vehicleName(v)}`} className="rounded-md p-2 text-ink-3 hover:bg-surface-3 hover:text-ink-1">
                <Pencil className="size-4" />
              </button>
              <button onClick={() => setArchiveTarget(v)} aria-label={`Archive ${vehicleName(v)}`} className="rounded-md p-2 text-ink-3 hover:bg-danger-500/15 hover:text-danger-400">
                <Archive className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <VehicleFormModal open={addOpen} onOpenChange={setAddOpen} />
      {editing && <VehicleFormModal open={!!editing} onOpenChange={() => setEditing(null)} vehicle={editing} />}
      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={() => setArchiveTarget(null)}
        title="Archive vehicle"
        description={`${archiveTarget ? vehicleName(archiveTarget) : ""} will be removed from active fleet views. Historical data is preserved.`}
        confirmLabel="Archive"
        loading={loading}
        onConfirm={archive}
      />
    </Card>
  );
}

function NotificationsSection({ business }: { business: any }) {
  const router = useRouter();
  const [prefs, setPrefs] = useState({
    notifyBookings: business.notifyBookings,
    notifyPayments: business.notifyPayments,
    notifyDocuments: business.notifyDocuments,
    notifyService: business.notifyService,
    documentReminderDays: business.documentReminderDays,
  });
  const [loading, setLoading] = useState(false);

  async function save(next = prefs) {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) toast.error("Could not save preferences.");
      else {
        toast.success("Preferences saved.");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  function toggle(key: keyof typeof prefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    save(next);
  }

  return (
    <div className="space-y-6">
      <Card padding="md">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <div className="space-y-1">
          <ToggleRow label="Booking reminders" description="Upcoming pickups and returns" checked={prefs.notifyBookings} onChange={() => toggle("notifyBookings")} />
          <ToggleRow label="Payment reminders" description="Pending balances on bookings" checked={prefs.notifyPayments} onChange={() => toggle("notifyPayments")} />
          <ToggleRow label="Document expiry" description="Insurance, FC and other document expiry" checked={prefs.notifyDocuments} onChange={() => toggle("notifyDocuments")} />
          <ToggleRow label="Service reminders" description="Vehicles due for maintenance" checked={prefs.notifyService} onChange={() => toggle("notifyService")} />
        </div>
      </Card>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Document Preferences</CardTitle>
        </CardHeader>
        <div className="max-w-xs">
          <Input
            label="Warn before expiry (days)"
            type="number"
            value={prefs.documentReminderDays}
            onChange={(e) => setPrefs((p) => ({ ...p, documentReminderDays: Number(e.target.value) }))}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => save()} loading={loading}>
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
      <div>
        <p className="text-[13.5px] text-ink-1 font-medium">{label}</p>
        <p className="text-secondary">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function AccountSection({ currentAdminId, admins }: { currentAdminId?: string; admins: any[] }) {
  const router = useRouter();
  const current = admins.find((a) => a.id === currentAdminId) ?? admins[0];
  const [name, setName] = useState(current?.name ?? "");
  const [mobile, setMobile] = useState(current?.mobile ?? "");
  const [photo, setPhoto] = useState<any>(current?.photoUrl ? { url: current.photoUrl } : null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile, photoUrl: photo?.url, currentPassword, newPassword: newPassword || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save changes.");
        return;
      }
      toast.success("Profile updated.");
      setCurrentPassword("");
      setNewPassword("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card padding="md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <FileUpload label="Profile Photo" folder="admins" value={photo} onChange={setPhoto} rounded />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          </div>
          <Input label="Email" value={current?.email} disabled hint="Contact the other admin to change your email" />
        </div>
      </Card>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Current Password"
            type={showPw ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input label="New Password" type={showPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <button onClick={() => setShowPw((s) => !s)} className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-3 hover:text-ink-1">
          {showPw ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {showPw ? "Hide" : "Show"} passwords
        </button>
      </Card>

      {error && <p className="text-[13px] text-danger-400">{error}</p>}

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={loading}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
