"use client";

import { useEffect, useState } from "react";
import { FileText, ScanLine, BookOpenCheck, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageIntro, LoadingBlock, EmptyState } from "@/components/dashboard/widgets";
import { api } from "@/lib/api-client";
import type { ReportEntity } from "@/lib/types";

const TYPE_META: Record<string, { label: string; icon: typeof FileText; variant: "default" | "success" | "warning" }> = {
  testing: { label: "Assessment", icon: ScanLine, variant: "warning" },
  "learning-plan": { label: "Learning plan", icon: BookOpenCheck, variant: "default" },
  "learning-plan-completed": { label: "Completed plan", icon: Award, variant: "success" },
};

export function ReportsPanel() {
  const [reports, setReports] = useState<ReportEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: ReportEntity[] }>("/tests/reports")
      .then((r) => setReports(r.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock label="Loading reports…" />;

  return (
    <div>
      <PageIntro title="Reports" description="Every assessment and completed plan, saved for your records." />
      {reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports yet"
          description="Run a handwriting assessment to generate your first report."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reports.map((r) => {
            const meta = TYPE_META[r.report_type] ?? TYPE_META.testing;
            const Icon = meta.icon;
            return (
              <div key={r._id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </div>
                <p className="mt-3 truncate text-sm font-semibold" title={r.report_name}>
                  {r.report_name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
