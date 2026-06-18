"use client";

import { useEffect, useState } from "react";
import { Users, Mail } from "lucide-react";
import { PageIntro, LoadingBlock, EmptyState, StatusPill } from "@/components/dashboard/widgets";
import { api } from "@/lib/api-client";
import type { RosterPatient } from "@/lib/types";

export function PsychiatristPatients() {
  const [patients, setPatients] = useState<RosterPatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: RosterPatient[] }>("/appointments/psychiatrist/patients")
      .then((r) => setPatients(r.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock label="Loading your patients…" />;

  return (
    <div>
      <PageIntro title="Your patients" description="Patients you have appointments with." />
      {patients.length === 0 ? (
        <EmptyState icon={Users} title="No patients yet" description="Patients who book you will appear here." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="hidden grid-cols-[1fr_1fr_auto_auto] gap-4 border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
            <span>Patient</span>
            <span>Email</span>
            <span className="text-center">Sessions</span>
            <span className="text-center">Status</span>
          </div>
          {patients.map((p) => (
            <div
              key={p._id}
              className="grid grid-cols-1 gap-2 border-b border-border px-5 py-4 last:border-0 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center sm:gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-sm font-semibold text-primary-foreground">
                  {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <span className="font-medium">{p.name}</span>
              </div>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {p.email}
              </span>
              <span className="text-sm sm:text-center">
                <span className="font-semibold">{p.appointmentCount}</span>
                <span className="text-muted-foreground"> session{p.appointmentCount !== 1 ? "s" : ""}</span>
              </span>
              <span className="sm:text-center">
                <StatusPill status={p.status} />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
