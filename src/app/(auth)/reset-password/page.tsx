"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { authClient, type UserRole } from "@/services/auth-client";
import { ApiClientError } from "@/lib/api-client";
import { FullScreenSpinner } from "@/components/ui/spinner";

function ResetInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const token = params.get("token") || "";
  const role = (params.get("role") as UserRole) || "patient";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "error" });
      return;
    }
    setLoading(true);
    try {
      await authClient.resetPassword(role, token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      toast({
        title: "Reset failed",
        description: err instanceof ApiClientError ? err.message : "Link may have expired",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="Invalid reset link" subtitle="This link is missing its token or has expired.">
        <Link href="/forgot-password">
          <Button className="w-full">Request a new link</Button>
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password updated" subtitle="Redirecting you to login…">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Your password has been reset successfully.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you haven't used before.">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        <p className="text-xs text-muted-foreground">
          Min 8 characters, with an uppercase letter, lowercase letter and a number.
        </p>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Reset password
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <ResetInner />
    </Suspense>
  );
}
