"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, ShieldCheck, UserCheck } from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import { Field } from "@/components/auth/Field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { ApiClientError } from "@/lib/api-client";

type Role = "patient" | "psychiatrist";

export function ProfileCompletionGate({ role, user }: { role: Role; user: AuthUser }) {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshUser, logout } = useAuth();
  const [form, setForm] = useState<Record<string, string>>({ name: user.name });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload =
        role === "patient"
          ? {
              phone: form.phone,
              dateOfBirth: form.dateOfBirth,
              gender: form.gender,
              emergencyContact: { name: form.ec_name, relationship: form.ec_rel, phone: form.ec_phone },
            }
          : {
              phone_number: form.phone_number,
              gender: form.gender || undefined,
              date_of_birth: form.date_of_birth,
              country_of_nationality: form.country_of_nationality,
              country_of_graduation: form.country_of_graduation,
              date_of_graduation: form.date_of_graduation,
              institute_name: form.institute_name,
              license_number: form.license_number,
              degrees: form.degrees,
              years_of_experience: Number(form.years_of_experience),
              expertise: form.expertise,
              bio: form.bio,
              certificateUrl: form.certificateUrl,
            };
      await api.post(`/auth/${role}/complete-profile`, payload);
      toast({
        title: "Profile completed",
        description: role === "psychiatrist" ? "Submitted for admin review." : "You're all set!",
        variant: "success",
      });
      await refreshUser();
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.details?.[0]?.message
            ? `${err.details[0].field}: ${err.details[0].message}`
            : err.message
          : "Something went wrong";
      toast({ title: "Couldn't save", description: msg, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="container-tight flex h-16 items-center justify-between">
          <Logo />
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground">
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </header>

      <main className="container-tight flex justify-center py-10">
        <div className="w-full max-w-2xl">
          <div className="mb-6 rounded-2xl gradient-brand p-6 text-primary-foreground shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15">
                <UserCheck className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-xl font-bold">Complete your profile</h1>
                <p className="text-sm text-primary-foreground/90">
                  {role === "psychiatrist"
                    ? "Add your professional credentials to be reviewed for approval."
                    : "Just a few details and you're ready to go."}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            {role === "patient" ? (
              <PatientFields form={form} set={set} />
            ) : (
              <PsychiatristFields form={form} set={set} />
            )}

            <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              Your information is private and used only to personalise your care.
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {role === "psychiatrist" ? "Submit for review" : "Finish setup"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

function PatientFields({ form, set }: { form: Record<string, string>; set: (k: string, v: string) => void }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone number" id="phone" value={form.phone} onChange={(v) => set("phone", v)} required />
        <Field label="Date of birth" id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select id="gender" value={form.gender || ""} onChange={(e) => set("gender", e.target.value)} required>
          <option value="">Select…</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer not to say">Prefer not to say</option>
        </Select>
      </div>
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="mb-3 text-sm font-semibold">Emergency contact</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" id="ec_name" value={form.ec_name} onChange={(v) => set("ec_name", v)} required />
          <Field label="Relationship" id="ec_rel" value={form.ec_rel} onChange={(v) => set("ec_rel", v)} required />
          <Field label="Phone" id="ec_phone" value={form.ec_phone} onChange={(v) => set("ec_phone", v)} required />
        </div>
      </div>
    </>
  );
}

function PsychiatristFields({ form, set }: { form: Record<string, string>; set: (k: string, v: string) => void }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone number" id="phone_number" value={form.phone_number} onChange={(v) => set("phone_number", v)} required />
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select id="gender" value={form.gender || ""} onChange={(e) => set("gender", e.target.value)}>
            <option value="">Select…</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date of birth" id="date_of_birth" type="date" value={form.date_of_birth} onChange={(v) => set("date_of_birth", v)} required />
        <Field label="Years of experience" id="years_of_experience" type="number" value={form.years_of_experience} onChange={(v) => set("years_of_experience", v)} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nationality" id="country_of_nationality" value={form.country_of_nationality} onChange={(v) => set("country_of_nationality", v)} required />
        <Field label="Country of graduation" id="country_of_graduation" value={form.country_of_graduation} onChange={(v) => set("country_of_graduation", v)} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Graduation date" id="date_of_graduation" type="date" value={form.date_of_graduation} onChange={(v) => set("date_of_graduation", v)} required />
        <Field label="License number" id="license_number" value={form.license_number} onChange={(v) => set("license_number", v)} required />
      </div>
      <Field label="Institute name" id="institute_name" value={form.institute_name} onChange={(v) => set("institute_name", v)} required />
      <Field label="Degrees" id="degrees" value={form.degrees} onChange={(v) => set("degrees", v)} required />
      <Field label="Area of expertise" id="expertise" value={form.expertise} onChange={(v) => set("expertise", v)} required />
      <Field label="Certificate URL" id="certificateUrl" type="url" placeholder="https://…" value={form.certificateUrl} onChange={(v) => set("certificateUrl", v)} required />
      <div className="space-y-2">
        <Label htmlFor="bio">Short professional bio</Label>
        <Textarea id="bio" value={form.bio || ""} onChange={(e) => set("bio", e.target.value)} required />
      </div>
    </>
  );
}
