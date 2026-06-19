"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { User, KeyRound, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageIntro } from "@/components/dashboard/widgets";
import { api, ApiClientError } from "@/lib/api-client";
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

      <AvatarCard user={user} role={role} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
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

function AvatarCard({ user, role }: { user: AuthUser; role: UserRole }) {
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const avatarUrl = typeof user.avatarUrl === "string" ? user.avatarUrl : "";
  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      await api.upload("/users/avatar", form);
      await refreshUser();
      toast({ title: "Photo updated", variant: "success" });
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Upload failed";
      toast({ title: "Couldn't update photo", description: msg, variant: "error" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-5 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="relative">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={user.name}
            width={72}
            height={72}
            className="rounded-full object-cover"
            style={{ height: 72, width: 72 }}
            unoptimized
          />
        ) : (
          <span className="grid h-[72px] w-[72px] place-items-center rounded-full gradient-brand text-xl font-semibold text-primary-foreground">
            {initials}
          </span>
        )}
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm transition hover:opacity-90"
          aria-label="Change photo"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div>
        <p className="text-lg font-semibold">{user.name}</p>
        <p className="text-sm text-muted-foreground capitalize">{role}</p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-1 text-sm font-medium text-primary hover:underline disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Change profile photo"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
    </div>
  );
}
