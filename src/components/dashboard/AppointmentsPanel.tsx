"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Clock, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, LoadingBlock, EmptyState, StatusPill } from "@/components/dashboard/widgets";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import type { Appointment } from "@/lib/types";

export function AppointmentsPanel({ role }: { role: "patient" | "psychiatrist" }) {
  const { toast } = useToast();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = async () => {
    const res = await api.get<{ data: Appointment[] }>(`/appointments/${role}`);
    setItems(res.data ?? []);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cancel = async (id: string) => {
    setCancelling(id);
    try {
      await api.put(`/appointments/cancel/${id}`);
      toast({ title: "Appointment cancelled", variant: "success" });
      await load();
    } catch (err) {
      toast({ title: "Couldn't cancel", description: (err as Error).message, variant: "error" });
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <LoadingBlock label="Loading appointments…" />;

  const upcoming = items.filter((a) => a.status === "scheduled" && new Date(a.date) >= new Date());
  const past = items.filter((a) => !(a.status === "scheduled" && new Date(a.date) >= new Date()));

  return (
    <div>
      <PageIntro
        title="Appointments"
        description={role === "patient" ? "Your consultations with psychiatrists." : "Your scheduled patient consultations."}
      />
      {items.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No appointments"
          description={role === "patient" ? "Book one from the Find a psychiatrist tab." : "Appointments booked by patients will appear here."}
        />
      ) : (
        <div className="space-y-6">
          <Section title="Upcoming" appts={upcoming} role={role} onCancel={cancel} cancelling={cancelling} />
          <Section title="Past & cancelled" appts={past} role={role} onCancel={cancel} cancelling={cancelling} muted />
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  appts,
  role,
  onCancel,
  cancelling,
  muted,
}: {
  title: string;
  appts: Appointment[];
  role: "patient" | "psychiatrist";
  onCancel: (id: string) => void;
  cancelling: string | null;
  muted?: boolean;
}) {
  if (appts.length === 0) return null;
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="space-y-3">
        {appts.map((a) => (
          <div
            key={a._id}
            className={`flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
              muted ? "opacity-80" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <CalendarClock className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">
                  {role === "patient" ? `Dr. ${a.psychiatristName}` : a.patientName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(a.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                  <span className="mx-2">·</span>
                  <Clock className="mr-1 inline h-3.5 w-3.5" />
                  {a.timeSlot}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill status={a.status} />
              {a.status === "scheduled" && new Date(a.date) >= new Date() && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={cancelling === a._id}
                  onClick={() => onCancel(a._id)}
                >
                  {cancelling === a._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
