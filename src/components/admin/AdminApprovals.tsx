"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Check, X, Loader2, ExternalLink, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PageIntro, LoadingBlock, EmptyState } from "@/components/dashboard/widgets";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface PendingPsychiatrist {
  _id: string;
  name: string;
  email: string;
  expertise: string;
  degrees: string;
  license_number: string;
  institute_name: string;
  years_of_experience: number;
  certificateUrl: string;
  bio: string;
}

export function AdminApprovals({ onCountChange }: { onCountChange?: (n: number) => void }) {
  const { toast } = useToast();
  const [pending, setPending] = useState<PendingPsychiatrist[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    const res = await api.get<{ data: PendingPsychiatrist[] }>("/admin/psychiatrists/pending");
    setPending(res.data ?? []);
    onCountChange?.(res.data?.length ?? 0);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const approve = async (id: string) => {
    setBusy(id);
    try {
      await api.patch(`/admin/psychiatrists/${id}/approve`);
      toast({ title: "Psychiatrist approved", variant: "success" });
      await load();
    } catch (err) {
      toast({ title: "Approval failed", description: (err as Error).message, variant: "error" });
    } finally {
      setBusy(null);
    }
  };

  const reject = async (id: string) => {
    if (!reason.trim()) {
      toast({ title: "A reason is required", variant: "error" });
      return;
    }
    setBusy(id);
    try {
      await api.patch(`/admin/psychiatrists/${id}/reject`, { reason });
      toast({ title: "Application rejected", variant: "success" });
      setRejecting(null);
      setReason("");
      await load();
    } catch (err) {
      toast({ title: "Rejection failed", description: (err as Error).message, variant: "error" });
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <LoadingBlock label="Loading pending applications…" />;

  return (
    <div>
      <PageIntro title="Psychiatrist approvals" description="Review and verify professional applications." />
      {pending.length === 0 ? (
        <EmptyState icon={BadgeCheck} title="All caught up" description="There are no pending applications right now." />
      ) : (
        <div className="space-y-4">
          {pending.map((p) => (
            <div key={p._id} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full gradient-brand text-sm font-semibold text-primary-foreground">
                    {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                  <div>
                    <p className="font-semibold">Dr. {p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.email}</p>
                    <Badge variant="warning" className="mt-2">
                      Pending review
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" disabled={busy === p._id} onClick={() => approve(p._id)}>
                    {busy === p._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRejecting(rejecting === p._id ? null : p._id);
                      setReason("");
                    }}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <Detail label="Expertise" value={p.expertise} />
                <Detail label="Degrees" value={p.degrees} />
                <Detail label="License #" value={p.license_number} />
                <Detail label="Institute" value={p.institute_name} />
                <Detail label="Experience" value={`${p.years_of_experience} years`} />
                <div>
                  <span className="text-muted-foreground">Certificate: </span>
                  <a
                    href={p.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              {p.bio && <p className="mt-3 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">{p.bio}</p>}

              {rejecting === p._id && (
                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <p className="mb-2 text-sm font-medium text-destructive">Reason for rejection</p>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain why this application is being rejected (emailed to the applicant)…"
                  />
                  <div className="mt-3 flex gap-2">
                    <Button variant="destructive" size="sm" disabled={busy === p._id} onClick={() => reject(p._id)}>
                      {busy === p._id && <Loader2 className="h-4 w-4 animate-spin" />}
                      Confirm rejection
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setRejecting(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
