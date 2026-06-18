"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton, AuthDivider } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api-client";
import { FullScreenSpinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type Role = "patient" | "psychiatrist";

const GOOGLE_ERRORS: Record<string, string> = {
  google_unconfigured: "Google sign-in isn't configured on this deployment yet.",
  google_state: "Google sign-in session expired. Please try again.",
  google_failed: "We couldn't sign you in with Google. Please try again.",
};

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const { loginPatient, loginPsychiatrist } = useAuth();
  const [role, setRole] = useState<Role>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    const error = params.get("error");
    if (error && GOOGLE_ERRORS[error] && !shown.current) {
      shown.current = true;
      toast({ title: "Sign-in issue", description: GOOGLE_ERRORS[error], variant: "error" });
    }
  }, [params, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = role === "patient" ? await loginPatient(email, password) : await loginPsychiatrist(email, password);
      if (res.success) {
        toast({ title: "Welcome back!", variant: "success" });
        router.push(`/${role}/dashboard`);
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "AUTH_EMAIL_NOT_VERIFIED") {
          const id = (err.details as unknown as { id?: string })?.id ?? "";
          toast({ title: "Verify your email", description: "We sent you a fresh code.", variant: "info" });
          router.push(`/verify-otp?role=${role}&id=${encodeURIComponent(id)}`);
          return;
        }
        if (err.code === "AUTH_NOT_APPROVED") {
          toast({
            title: "Pending approval",
            description: "Your psychiatrist account is awaiting admin approval.",
            variant: "info",
          });
          return;
        }
        toast({ title: "Login failed", description: err.message, variant: "error" });
      } else {
        toast({ title: "Something went wrong", variant: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your journey.">
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {(["patient", "psychiatrist"] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium capitalize transition-all",
              role === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {role === "patient" && (
        <>
          <GoogleButton label="Log in with Google" />
          <AuthDivider />
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href={`/forgot-password?role=${role}`} className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Are you an administrator?{" "}
        <Link href="/admin/login" className="font-medium text-primary hover:underline">
          Admin login
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <LoginInner />
    </Suspense>
  );
}
