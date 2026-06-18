"use client";

import { useState } from "react";
import { Clock, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PageIntro } from "@/components/dashboard/widgets";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Availability = { startTime: string; endTime: string; workingDays: string[] };

export function AvailabilityPanel({ user }: { user: AuthUser }) {
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const initial = (user.availability as Availability) ?? {
    startTime: "09:00",
    endTime: "17:00",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  };
  const [startTime, setStartTime] = useState(initial.startTime);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [days, setDays] = useState<string[]>(initial.workingDays ?? []);
  const [saving, setSaving] = useState(false);

  const toggle = (d: string) => setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/users/psychiatrists/${user._id}/availability`, { startTime, endTime, workingDays: days });
      await refreshUser();
      toast({ title: "Availability saved", description: "Patients can now book within these hours.", variant: "success" });
    } catch (err) {
      toast({ title: "Couldn't save", description: (err as Error).message, variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageIntro title="Availability" description="Set the days and hours patients can book consultations." />
      <div className="max-w-2xl rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Working hours</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start">Start time</Label>
            <Input id="start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">End time</Label>
            <Input id="end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        <div className="mt-6">
          <Label>Working days</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggle(d)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  days.includes(d)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <Button className="mt-6" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save availability
        </Button>
      </div>
    </div>
  );
}
