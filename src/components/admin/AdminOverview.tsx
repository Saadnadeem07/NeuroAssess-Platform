"use client";

import { useEffect, useState } from "react";
import { Clock, Stethoscope, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/dashboard/widgets";
import type { AuthUser } from "@/context/AuthContext";
import { api } from "@/lib/api-client";

export function AdminOverview({ user, onNavigate }: { user: AuthUser; onNavigate: (key: string) => void }) {
  const [stats, setStats] = useState({ pending: 0, psychiatrists: 0, patients: 0 });

  useEffect(() => {
    Promise.all([
      api.get<{ data: unknown[] }>("/admin/psychiatrists/pending").catch(() => ({ data: [] })),
      api.get<{ data: unknown[] }>("/admin/psychiatrists").catch(() => ({ data: [] })),
      api.get<{ data: unknown[] }>("/admin/patients").catch(() => ({ data: [] })),
    ]).then(([pend, psy, pat]) => {
      setStats({
        pending: pend.data?.length ?? 0,
        psychiatrists: psy.data?.length ?? 0,
        patients: pat.data?.length ?? 0,
      });
    });
  }, []);

  return (
    <div>
      <div className="mb-6 overflow-hidden rounded-2xl gradient-brand p-6 text-primary-foreground shadow-sm sm:p-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Admin console</h2>
        </div>
        <p className="mt-1 max-w-xl text-primary-foreground/90">
          Welcome, {user.name.split(" ")[0]}. Keep the platform trustworthy and running smoothly.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Clock} label="Pending approvals" value={stats.pending} hint="Awaiting your review" />
        <StatCard icon={Stethoscope} label="Psychiatrists" value={stats.psychiatrists} hint="On the platform" />
        <StatCard icon={Users} label="Patients" value={stats.patients} hint="Registered" />
      </div>

      {stats.pending > 0 && (
        <button
          onClick={() => onNavigate("approvals")}
          className="mt-6 flex w-full items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-left transition-all hover:shadow-md"
        >
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-amber-100 text-amber-600">
            <Clock className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-amber-800">
              {stats.pending} psychiatrist{stats.pending !== 1 ? "s" : ""} awaiting approval
            </p>
            <p className="text-sm text-amber-700">Review their credentials to grant access.</p>
          </div>
          <ArrowRight className="h-4 w-4 text-amber-700" />
        </button>
      )}
    </div>
  );
}
