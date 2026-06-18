"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        toast({ title: "Welcome, admin", variant: "success" });
        router.push("/admin/dashboard");
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "AUTH_EMAIL_NOT_VERIFIED") {
        const id = (err.details as unknown as { id?: string })?.id ?? "";
        router.push(`/verify-otp?role=admin&id=${encodeURIComponent(id)}`);
        return;
      }
      toast({
        title: "Login failed",
        description: err instanceof ApiClientError ? err.message : "Something went wrong",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Administrator access" subtitle="Sign in to manage the platform.">
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
        <ShieldCheck className="h-4 w-4" />
        Restricted area — authorised administrators only.
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
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
        Not an admin?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Patient / Psychiatrist login
        </Link>
      </p>
    </AuthShell>
  );
}
