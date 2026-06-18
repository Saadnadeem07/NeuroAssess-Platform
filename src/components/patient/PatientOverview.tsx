"use client";

import { useEffect, useState } from "react";
import { ScanLine, BookOpenCheck, FileText, CalendarClock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/widgets";
import { api } from "@/lib/api-client";
import type { AuthUser } from "@/context/AuthContext";

export function PatientOverview({ user, onNavigate }: { user: AuthUser; onNavigate: (key: string) => void }) {
  const [stats, setStats] = useState({ reports: 0, modules: 0, appointments: 0 });

  useEffect(() => {
    Promise.all([
      api.get<{ data: unknown[] }>("/tests/reports").catch(() => ({ data: [] })),
      api.get<{ data: unknown[] }>("/learning-plans").catch(() => ({ data: [] })),
      api.get<{ data: unknown[] }>("/appointments/patient").catch(() => ({ data: [] })),
    ]).then(([r, l, a]) => {
      setStats({ reports: r.data?.length ?? 0, modules: l.data?.length ?? 0, appointments: a.data?.length ?? 0 });
    });
  }, []);

  return (
    <div>
      <div className="mb-6 overflow-hidden rounded-2xl gradient-brand p-6 text-primary-foreground shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold">Welcome back, {user.name.split(" ")[0]} 👋</h2>
        <p className="mt-1 max-w-xl text-primary-foreground/90">
          Track your progress, run a new assessment, or connect with a psychiatrist — all in one place.
        </p>
        <Button variant="secondary" className="mt-5 bg-white text-primary hover:bg-white/90" onClick={() => onNavigate("test")}>
          <ScanLine className="h-4 w-4" />
          New assessment
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} label="Reports" value={stats.reports} hint="Saved assessments & plans" />
        <StatCard icon={BookOpenCheck} label="Plan modules" value={`${stats.modules} / 2`} hint="Learning progress" />
        <StatCard icon={CalendarClock} label="Appointments" value={stats.appointments} hint="Total booked" />
      </div>

      <h3 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quick actions</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { key: "test", icon: ScanLine, title: "Take a handwriting test", desc: "Upload a sample for instant AI screening." },
          { key: "plan", icon: BookOpenCheck, title: "Continue your learning plan", desc: "Work through your personalised modules." },
          { key: "directory", icon: CalendarClock, title: "Book a psychiatrist", desc: "Find verified professionals and schedule." },
          { key: "reports", icon: FileText, title: "View your reports", desc: "Review past assessments and progress." },
        ].map((q) => (
          <button
            key={q.key}
            onClick={() => onNavigate(q.key)}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <q.icon className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold">{q.title}</p>
              <p className="text-sm text-muted-foreground">{q.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </button>
        ))}
      </div>
    </div>
  );
}
