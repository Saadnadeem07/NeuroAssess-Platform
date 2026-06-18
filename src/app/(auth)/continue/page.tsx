"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FullScreenSpinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/AuthContext";
import { roleStore, type UserRole } from "@/services/auth-client";

function ContinueInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { setRole, refreshUser } = useAuth();

  useEffect(() => {
    const role = (params.get("role") as UserRole) || "patient";
    roleStore.set(role);
    setRole(role);
    refreshUser().finally(() => router.replace(`/${role}/dashboard`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <FullScreenSpinner label="Signing you in…" />;
}

export default function ContinuePage() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <ContinueInner />
    </Suspense>
  );
}
