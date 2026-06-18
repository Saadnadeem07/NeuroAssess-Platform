"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Field } from "@/components/auth/Field";
import { GoogleButton, AuthDivider } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Role = "patient" | "psychiatrist";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { registerPatient, registerPsychiatrist } = useAuth();
  const [role, setRole] = useState<Role>("patient");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "error" });
      return;
    }
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password };
      const res = role === "patient" ? await registerPatient(payload) : await registerPsychiatrist(payload);
      if (res?.success) {
        const id = (res.data as { id?: string } | undefined)?.id ?? "";
        toast({ title: "Account created", description: "Verify your email to continue.", variant: "success" });
        router.push(`/verify-otp?role=${role}&id=${encodeURIComponent(id)}`);
      }
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.details?.[0]?.message
            ? `${err.details[0].field}: ${err.details[0].message}`
            : err.message
          : "Something went wrong";
      toast({ title: "Registration failed", description: msg, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="It takes less than a minute to get started.">
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {(["patient", "psychiatrist"] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-all",
              role === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {r === "patient" ? "Patient / Student" : "Psychiatrist"}
          </button>
        ))}
      </div>

      {role === "patient" && (
        <>
          <GoogleButton label="Sign up with Google" />
          <AuthDivider />
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" id="name" value={form.name} onChange={(v) => set("name", v)} required />
        <Field label="Email" id="email" type="email" value={form.email} onChange={(v) => set("email", v)} required />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Password"
            id="password"
            type="password"
            value={form.password}
            onChange={(v) => set("password", v)}
            required
          />
          <Field
            label="Confirm"
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(v) => set("confirmPassword", v)}
            required
          />
        </div>
        <p className="-mt-1 text-xs text-muted-foreground">
          Min 8 characters, with an uppercase letter, lowercase letter and a number.
        </p>

        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          {role === "psychiatrist"
            ? "After verifying your email, you'll add your professional credentials for admin review."
            : "After verifying your email, you'll add a few profile details to get started."}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
