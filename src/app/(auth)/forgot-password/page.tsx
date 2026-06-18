"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { authClient, type UserRole } from "@/services/auth-client";
import { FullScreenSpinner } from "@/components/ui/spinner";

function ForgotInner() {
  const params = useSearchParams();
  const { toast } = useToast();
  const [role, setRole] = useState<UserRole>((params.get("role") as UserRole) || "patient");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authClient.forgotPassword(role, email);
      setSent(true);
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle="If an account exists, a reset link is on its way.">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <MailCheck className="h-4 w-4" />
          We&apos;ve sent a password reset link if that email is registered.
        </div>
        <Link href="/login" className="mt-6 block">
          <Button variant="outline" className="w-full">
            Back to login
          </Button>
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Forgot your password?" subtitle="We'll email you a secure reset link.">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role">Account type</Label>
          <Select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="patient">Patient / Student</option>
            <option value="psychiatrist">Psychiatrist</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <ForgotInner />
    </Suspense>
  );
}
