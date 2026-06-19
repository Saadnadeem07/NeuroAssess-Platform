"use client";

import { useState } from "react";
import { LayoutDashboard, ShieldCheck, Stethoscope, Users, UserCog } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { useRequireRole } from "@/components/dashboard/useRequireRole";
import { FullScreenSpinner } from "@/components/ui/spinner";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminApprovals } from "@/components/admin/AdminApprovals";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminManagement } from "@/components/admin/AdminManagement";

export default function AdminDashboard() {
  const { user, ready } = useRequireRole("admin");
  const [active, setActive] = useState("overview");
  const [pendingCount, setPendingCount] = useState<number>();

  if (!ready || !user) return <FullScreenSpinner label="Loading admin console…" />;

  const NAV: NavItem[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "approvals", label: "Approvals", icon: ShieldCheck, badge: pendingCount },
    { key: "psychiatrists", label: "Psychiatrists", icon: Stethoscope },
    { key: "patients", label: "Patients", icon: Users },
    { key: "admins", label: "Administrators", icon: UserCog },
  ];

  return (
    <DashboardShell navItems={NAV} active={active} onChange={setActive} roleLabel="Administrator" userName={user.name}>
      {active === "overview" && <AdminOverview user={user} onNavigate={setActive} />}
      {active === "approvals" && <AdminApprovals onCountChange={setPendingCount} />}
      {active === "psychiatrists" && <AdminUsers kind="psychiatrists" />}
      {active === "patients" && <AdminUsers kind="patients" />}
      {active === "admins" && <AdminManagement user={user} />}
    </DashboardShell>
  );
}
