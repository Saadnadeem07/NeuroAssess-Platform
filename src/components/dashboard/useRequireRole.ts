"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/services/auth-client";

/**
 * Client-side role guard for dashboard pages. Redirects to the appropriate
 * login if the user isn't authenticated as the required role once auth has
 * finished loading. Returns { user, ready } so pages can show a loader.
 */
export function useRequireRole(role: UserRole) {
  const router = useRouter();
  const { user, loading, currentRole } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || currentRole !== role) {
      router.replace(role === "admin" ? "/admin/login" : "/login");
    }
  }, [loading, user, currentRole, role, router]);

  return { user, ready: !loading && !!user && currentRole === role };
}
