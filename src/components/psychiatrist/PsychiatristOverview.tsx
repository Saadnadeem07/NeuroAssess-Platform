"use client";

import { useEffect, useState } from "react";
import { Users, CalendarClock, CalendarCheck2, Clock, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/dashboard/widgets";
import type { AuthUser } from "@/context/AuthContext";
import { api } from "@/lib/api-client";
import type { Appointment, RosterPatient } from "@/lib/types";

export function PsychiatristOverview({ user, onNavigate }: { user: AuthUser; onNavigate: (key: string) => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<RosterPatient[]>([]);

  useEffect(() => {
    api.get<{ data: Appointment[] }>("/appointments/psychiatrist").then((r) => setAppointments(r.data ?? [])).catch(() => {});
    api.get<{ data: RosterPatient[] }>("/appointments/psychiatrist/patients").then((r) => setPatients(r.data ?? [])).catch(() => {});
  }, []);

  const upcoming = appointments.filter((a) => a.status === "scheduled" && new Date(a.date) >= new Date());

  return (
    <div>
      <div className="mb-6 overflow-hidden rounded-2xl gradient-brand p-6 text-primary-foreground shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold">Hello, Dr. {user.name.split(" ")[0]} 👋</h2>
        <p className="mt-1 max-w-xl text-primary-foreground/90">Here&apos;s a snapshot of your practice today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Patients" value={patients.length} hint="In your roster" />
        <StatCard icon={CalendarClock} label="Upcoming" value={upcoming.length} hint="Scheduled consultations" />
        <StatCard icon={CalendarCheck2} label="Total appointments" value={appointments.length} hint="All time" />
      </div>

      <h3 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Next consultations</h3>
      {upcoming.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          No upcoming appointments. Make sure your{" "}
          <button onClick={() => onNavigate("availability")} className="font-medium text-primary hover:underline">
            availability
          </button>{" "}
          is set so patients can book you.
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.slice(0, 4).map((a) => (
            <button
              key={a._id}
              onClick={() => onNavigate("appointments")}
              className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md"
            >
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <CalendarClock className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-semibold">{a.patientName}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(a.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })}
                  <span className="mx-2">·</span>
                  <Clock className="mr-1 inline h-3.5 w-3.5" />
                  {a.timeSlot}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
