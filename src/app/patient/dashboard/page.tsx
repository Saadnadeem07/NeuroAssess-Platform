"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ScanLine,
  BookOpenCheck,
  FileText,
  Stethoscope,
  CalendarClock,
  MessagesSquare,
  UserCog,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { useRequireRole } from "@/components/dashboard/useRequireRole";
import { ProfileCompletionPrompt } from "@/components/dashboard/ProfileCompletionPrompt";
import { FullScreenSpinner } from "@/components/ui/spinner";
import { PatientOverview } from "@/components/patient/PatientOverview";
import { InitialTestPanel } from "@/components/patient/InitialTestPanel";
import { LearningPlanPanel } from "@/components/patient/LearningPlanPanel";
import { ReportsPanel } from "@/components/patient/ReportsPanel";
import { DirectoryPanel } from "@/components/patient/DirectoryPanel";
import { AppointmentsPanel } from "@/components/dashboard/AppointmentsPanel";
import { MessagesPanel } from "@/components/dashboard/MessagesPanel";
import { ProfilePanel } from "@/components/dashboard/ProfilePanel";

const NAV: NavItem[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "test", label: "Assessment", icon: ScanLine },
  { key: "plan", label: "Learning Plan", icon: BookOpenCheck },
  { key: "reports", label: "Reports", icon: FileText },
  { key: "directory", label: "Find a psychiatrist", icon: Stethoscope },
  { key: "appointments", label: "Appointments", icon: CalendarClock },
  { key: "messages", label: "Messages", icon: MessagesSquare },
  { key: "profile", label: "Profile", icon: UserCog },
];

export default function PatientDashboard() {
  const { user, ready } = useRequireRole("patient");
  const [active, setActive] = useState("overview");

  if (!ready || !user) return <FullScreenSpinner label="Loading your dashboard…" />;

  return (
    <DashboardShell navItems={NAV} active={active} onChange={setActive} roleLabel="Patient" userName={user.name}>
      {!user.profileComplete && <ProfileCompletionPrompt role="patient" user={user} />}
      {active === "overview" && <PatientOverview user={user} onNavigate={setActive} />}
      {active === "test" && <InitialTestPanel />}
      {active === "plan" && <LearningPlanPanel />}
      {active === "reports" && <ReportsPanel />}
      {active === "directory" && <DirectoryPanel />}
      {active === "appointments" && <AppointmentsPanel role="patient" />}
      {active === "messages" && <MessagesPanel currentUserId={user._id} />}
      {active === "profile" && <ProfilePanel role="patient" user={user} />}
    </DashboardShell>
  );
}
