"use client";

import { useState } from "react";
import { LayoutDashboard, Users, CalendarClock, Clock, MessagesSquare, UserCog } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { useRequireRole } from "@/components/dashboard/useRequireRole";
import { FullScreenSpinner } from "@/components/ui/spinner";
import { PendingApprovalScreen } from "@/components/psychiatrist/PendingApprovalScreen";
import { ProfileCompletionGate } from "@/components/auth/ProfileCompletionGate";
import { PsychiatristOverview } from "@/components/psychiatrist/PsychiatristOverview";
import { PsychiatristPatients } from "@/components/psychiatrist/PsychiatristPatients";
import { AvailabilityPanel } from "@/components/psychiatrist/AvailabilityPanel";
import { AppointmentsPanel } from "@/components/dashboard/AppointmentsPanel";
import { MessagesPanel } from "@/components/dashboard/MessagesPanel";
import { ProfilePanel } from "@/components/dashboard/ProfilePanel";

const NAV: NavItem[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "patients", label: "Patients", icon: Users },
  { key: "appointments", label: "Appointments", icon: CalendarClock },
  { key: "availability", label: "Availability", icon: Clock },
  { key: "messages", label: "Messages", icon: MessagesSquare },
  { key: "profile", label: "Profile", icon: UserCog },
];

export default function PsychiatristDashboard() {
  const { user, ready } = useRequireRole("psychiatrist");
  const [active, setActive] = useState("overview");

  if (!ready || !user) return <FullScreenSpinner label="Loading your dashboard…" />;

  // 1) Complete credentials, 2) then await admin approval, 3) then dashboard.
  if (!user.profileComplete) return <ProfileCompletionGate role="psychiatrist" user={user} />;
  if (user.isApproved === false) return <PendingApprovalScreen name={user.name} />;

  return (
    <DashboardShell navItems={NAV} active={active} onChange={setActive} roleLabel="Psychiatrist" userName={user.name}>
      {active === "overview" && <PsychiatristOverview user={user} onNavigate={setActive} />}
      {active === "patients" && <PsychiatristPatients />}
      {active === "appointments" && <AppointmentsPanel role="psychiatrist" />}
      {active === "availability" && <AvailabilityPanel user={user} />}
      {active === "messages" && <MessagesPanel currentUserId={user._id} />}
      {active === "profile" && <ProfilePanel role="psychiatrist" user={user} />}
    </DashboardShell>
  );
}
