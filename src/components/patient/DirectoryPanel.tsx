"use client";

import { useEffect, useMemo, useState } from "react";
import { Stethoscope, GraduationCap, CalendarPlus, Clock, X, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageIntro, LoadingBlock, EmptyState } from "@/components/dashboard/widgets";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import type { PsychiatristPublic } from "@/lib/types";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function toSlots(start: string, end: string): string[] {
  const [sh] = start.split(":").map(Number);
  const [eh] = end.split(":").map(Number);
  const out: string[] = [];
  for (let h = sh; h < eh; h++) {
    const fmt = (n: number) => {
      const period = n >= 12 ? "PM" : "AM";
      const hour = n % 12 === 0 ? 12 : n % 12;
      return `${hour}:00 ${period}`;
    };
    out.push(`${fmt(h)} - ${fmt(h + 1)}`);
  }
  return out;
}

export function DirectoryPanel() {
  const [list, setList] = useState<PsychiatristPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PsychiatristPublic | null>(null);

  useEffect(() => {
    api
      .get<{ data: PsychiatristPublic[] }>("/users/psychiatrists/approved")
      .then((r) => setList(r.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      list.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.expertise?.toLowerCase().includes(query.toLowerCase())
      ),
    [list, query]
  );

  if (loading) return <LoadingBlock label="Loading psychiatrists…" />;
  if (selected) return <BookingView psychiatrist={selected} onBack={() => setSelected(null)} />;

  return (
    <div>
      <PageIntro title="Find a psychiatrist" description="Browse verified professionals and book a consultation." />
      <div className="mb-5 max-w-sm">
        <Input placeholder="Search by name or expertise…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No psychiatrists found" description="Try a different search term." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((p) => (
            <div key={p._id} className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full gradient-brand text-lg font-semibold text-primary-foreground">
                  {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <div>
                  <p className="font-semibold">Dr. {p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.expertise}</p>
                </div>
              </div>
              <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{p.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" /> {p.years_of_experience} yrs
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {p.availability.startTime}–{p.availability.endTime}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.availability.workingDays.map((d) => (
                  <Badge key={d} variant="muted">
                    {d.slice(0, 3)}
                  </Badge>
                ))}
              </div>
              <Button className="mt-5" onClick={() => setSelected(p)}>
                <CalendarPlus className="h-4 w-4" />
                Book consultation
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingView({ psychiatrist, onBack }: { psychiatrist: PsychiatristPublic; onBack: () => void }) {
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [booked, setBooked] = useState<string[]>([]);
  const [slot, setSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const slots = toSlots(psychiatrist.availability.startTime, psychiatrist.availability.endTime);

  const dayValid = (d: string) => {
    if (!d) return true;
    const day = DAY_NAMES[new Date(d).getUTCDay()];
    return psychiatrist.availability.workingDays.includes(day);
  };

  useEffect(() => {
    setSlot(null);
    if (!date) return setBooked([]);
    api
      .get<{ data: string[] }>(`/appointments/booked-slots/${psychiatrist._id}?date=${date}`)
      .then((r) => setBooked(r.data ?? []))
      .catch(() => setBooked([]));
  }, [date, psychiatrist._id]);

  const book = async () => {
    if (!date || !slot) return;
    setSubmitting(true);
    try {
      await api.post("/appointments", { psychiatristId: psychiatrist._id, date, timeSlot: slot });
      toast({ title: "Appointment booked!", description: "A confirmation email is on its way.", variant: "success" });
      onBack();
    } catch (err) {
      toast({ title: "Booking failed", description: (err as Error).message, variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to directory
      </button>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full gradient-brand text-lg font-semibold text-primary-foreground">
            {psychiatrist.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </span>
          <div>
            <p className="font-semibold">Dr. {psychiatrist.name}</p>
            <p className="text-sm text-muted-foreground">{psychiatrist.expertise}</p>
          </div>
        </div>

        <div className="mt-6 max-w-xs">
          <label className="text-sm font-medium">Choose a date</label>
          <Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="mt-2" />
          {date && !dayValid(date) && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive">
              <X className="h-4 w-4" /> Not available on this day.
            </p>
          )}
        </div>

        {date && dayValid(date) && (
          <div className="mt-6">
            <label className="text-sm font-medium">Choose a time slot</label>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((s) => {
                const taken = booked.includes(s);
                return (
                  <button
                    key={s}
                    disabled={taken}
                    onClick={() => setSlot(s)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      taken
                        ? "cursor-not-allowed border-border bg-muted text-muted-foreground line-through"
                        : slot === s
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Button className="mt-6" size="lg" disabled={!slot || submitting} onClick={book}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
          Confirm booking
        </Button>
      </div>
    </div>
  );
}
