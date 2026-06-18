"use client";

import { useRouter } from "next/navigation";
import { Clock, LogOut, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/landing/Logo";
import { useAuth } from "@/context/AuthContext";

export function PendingApprovalScreen({ name }: { name: string }) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
        <Logo className="mx-auto" />
        <div className="mx-auto mt-8 grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-amber-600">
          <Clock className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Application under review</h1>
        <p className="mt-2 text-muted-foreground">
          Thanks, Dr. {name.split(" ")[0]}. Your credentials have been submitted and are being
          reviewed by our team. You&apos;ll get full access as soon as an administrator approves your account.
        </p>

        <div className="mt-8 space-y-3 text-left">
          {[
            { icon: ShieldCheck, text: "Your license and certificate are being verified." },
            { icon: Mail, text: "You'll receive an email the moment you're approved." },
            { icon: Clock, text: "This usually takes 1–2 business days." },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <s.icon className="h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm">{s.text}</p>
            </div>
          ))}
        </div>

        <Button variant="outline" className="mt-8 w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}
