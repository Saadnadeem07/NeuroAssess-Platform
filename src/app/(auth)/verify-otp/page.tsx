"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";
import { authClient, type UserRole } from "@/services/auth-client";
import { ApiClientError } from "@/lib/api-client";
import { FullScreenSpinner } from "@/components/ui/spinner";

function VerifyOtpInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const { refreshUser, setRole } = useAuth();

  const role = (params.get("role") as UserRole) || "patient";
  const id = params.get("id") || "";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text) {
      setDigits(text.split("").concat(Array(6).fill("")).slice(0, 6));
      inputs.current[Math.min(text.length, 5)]?.focus();
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== 6) {
      toast({ title: "Enter all 6 digits", variant: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await authClient.verifyOTP(role, id, otp);
      if (res.success) {
        setRole(role);
        await refreshUser();
        toast({ title: "Email verified!", variant: "success" });
        router.push(`/${role}/dashboard`);
      }
    } catch (err) {
      toast({
        title: "Verification failed",
        description: err instanceof ApiClientError ? err.message : "Try again",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await authClient.resendOTP(role, id);
      toast({ title: "Code resent", description: "Check your email (or server console in dev).", variant: "info" });
      setCooldown(30);
    } catch {
      toast({ title: "Could not resend code", variant: "error" });
    }
  };

  if (!id) {
    return (
      <AuthShell title="Verification link incomplete" subtitle="We couldn't find your account reference.">
        <Link href="/login">
          <Button className="w-full">Back to login</Button>
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Verify your email" subtitle="Enter the 6-digit code we sent you.">
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
        <MailCheck className="h-4 w-4" />
        A one-time code was sent to your email address.
      </div>
      <form onSubmit={submit} className="space-y-6">
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-14 w-full rounded-lg border border-input bg-background text-center text-xl font-semibold shadow-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          ))}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Verify
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Didn&apos;t get it?{" "}
        <button
          onClick={resend}
          disabled={cooldown > 0}
          className="font-medium text-primary hover:underline disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </p>
    </AuthShell>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <VerifyOtpInner />
    </Suspense>
  );
}
