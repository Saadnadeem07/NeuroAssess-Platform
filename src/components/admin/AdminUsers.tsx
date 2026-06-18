"use client";

import { useEffect, useState } from "react";
import { Users, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageIntro, LoadingBlock, EmptyState } from "@/components/dashboard/widgets";
import { api } from "@/lib/api-client";

interface Row {
  _id: string;
  name: string;
  email: string;
  isApproved?: boolean;
  expertise?: string;
  createdAt?: string;
}

export function AdminUsers({ kind }: { kind: "patients" | "psychiatrists" }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get<{ data: Row[] }>(`/admin/${kind}`)
      .then((r) => setRows(r.data ?? []))
      .finally(() => setLoading(false));
  }, [kind]);

  const filtered = rows.filter(
    (r) => r.name.toLowerCase().includes(query.toLowerCase()) || r.email.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return <LoadingBlock label={`Loading ${kind}…`} />;

  const isPsych = kind === "psychiatrists";

  return (
    <div>
      <PageIntro
        title={isPsych ? "All psychiatrists" : "All patients"}
        description={isPsych ? "Every professional on the platform." : "Every registered patient."}
      />
      <div className="mb-5 max-w-sm">
        <Input placeholder="Search by name or email…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={isPsych ? Stethoscope : Users} title="No results" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {filtered.map((r) => (
            <div key={r._id} className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-0">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-sm font-semibold text-primary-foreground">
                  {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <div>
                  <p className="font-medium">{isPsych ? `Dr. ${r.name}` : r.name}</p>
                  <p className="text-sm text-muted-foreground">{r.email}</p>
                </div>
              </div>
              {isPsych ? (
                r.isApproved ? (
                  <Badge variant="success">Approved</Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )
              ) : (
                <span className="hidden text-sm text-muted-foreground sm:block">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
