"use client";

import { useState } from "react";
import { User, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageIntro } from "@/components/dashboard/widgets";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import type { UserRole } from "@/services/auth-client";

const COLLECTION: Record<UserRole, string> = {
  patient: "patients",
  psychiatrist: "psychiatrists",
  admin: "admins",
};

export function ProfilePanel({ role, user }: { role: UserRole; user: AuthUser }) {
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    try {
      await api.put(`/users/${COLLECTION[role]}/${user._id}`, { name });
      await refreshUser();
      toast({ title: "Profile updated", variant: "success" });
    } catch (err) {
      toast({ title: "Update failed", description: (err as Error).message, variant: "error" });
    } finally {
      setSavingName(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await api.post(`/auth/${role}/change-password`, { currentPassword, newPassword });
      toast({ title: "Password changed", description: "Use your new password next time.", variant: "success" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast({ title: "Couldn't change password", description: (err as Error).message, variant: "error" });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div>
      <PageIntro title="Profile & settings" description="Manage your account details and security." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveName} className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Account details</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="mt-4 space-y-2">
            <Label>Email</Label>
            <Input value={user.email} disabled />
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>
          <Button type="submit" className="mt-5" disabled={savingName || name === user.name}>
            {savingName && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </form>

        <form onSubmit={changePassword} className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Change password</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              <p className="text-xs text-muted-foreground">
                Min 8 chars, with uppercase, lowercase and a number. You&apos;ll be logged out elsewhere.
              </p>
            </div>
          </div>
          <Button type="submit" variant="outline" className="mt-5" disabled={savingPw}>
            {savingPw && <Loader2 className="h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
