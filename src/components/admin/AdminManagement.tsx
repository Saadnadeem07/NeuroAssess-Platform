"use client";

import { useEffect, useState } from "react";
import { UserPlus, Trash2, KeyRound, Loader2, ShieldCheck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageIntro, LoadingBlock } from "@/components/dashboard/widgets";
import { api, ApiClientError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import type { AuthUser } from "@/context/AuthContext";

interface AdminRow {
  _id: string;
  name: string;
  email: string;
  adminLevel: string;
  permissions: string[];
  createdAt?: string;
}

export function AdminManagement({ user }: { user: AuthUser }) {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuper = (user.permissions as string[] | undefined)?.includes("super_admin") ?? false;

  const load = async () => {
    const res = await api.get<{ data: AdminRow[] }>("/admin/admins");
    setAdmins(res.data ?? []);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock label="Loading administrators…" />;

  return (
    <div className="space-y-8">
      <PageIntro title="Administrators" description="Manage admin access and your account security." />

      <AdminList admins={admins} currentId={user._id} canManage={isSuper} onChanged={load} />

      {isSuper ? (
        <AddAdminForm onAdded={load} />
      ) : (
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          Only <strong>super admins</strong> can add or remove administrators.
        </div>
      )}

      <ChangeMyPassword />
    </div>
  );
}

function AdminList({
  admins,
  currentId,
  canManage,
  onChanged,
}: {
  admins: AdminRow[];
  currentId: string;
  canManage: boolean;
  onChanged: () => void;
}) {
  const { toast } = useToast();
  const [removing, setRemoving] = useState<string | null>(null);

  const remove = async (id: string) => {
    setRemoving(id);
    try {
      await api.del(`/admin/admins/${id}`);
      toast({ title: "Administrator removed", variant: "success" });
      onChanged();
    } catch (err) {
      toast({
        title: "Couldn't remove",
        description: err instanceof ApiClientError ? err.message : "Try again",
        variant: "error",
      });
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {admins.map((a) => {
        const isSelf = a._id === currentId;
        const isSuper = a.permissions?.includes("super_admin");
        return (
          <div key={a._id} className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-0">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-sm font-semibold text-primary-foreground">
                {a.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </span>
              <div>
                <p className="font-medium">
                  {a.name} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                </p>
                <p className="text-sm text-muted-foreground">{a.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isSuper ? "default" : "muted"} className="gap-1">
                {isSuper ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                {isSuper ? "Super admin" : "Admin"}
              </Badge>
              {canManage && !isSelf && (
                <Button variant="outline" size="sm" disabled={removing === a._id} onClick={() => remove(a._id)}>
                  {removing === a._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Remove
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AddAdminForm({ onAdded }: { onAdded: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [superAdmin, setSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admin/admins", { ...form, superAdmin });
      toast({ title: "Administrator added", description: `${form.email} can now log in.`, variant: "success" });
      setForm({ name: "", email: "", password: "" });
      setSuperAdmin(false);
      onAdded();
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.details?.[0]?.message
            ? `${err.details[0].field}: ${err.details[0].message}`
            : err.message
          : "Something went wrong";
      toast({ title: "Couldn't add admin", description: msg, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Add a new administrator</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="a_name">Name</Label>
          <Input id="a_name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="a_email">Email</Label>
          <Input id="a_email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="a_pass">Temp password</Label>
          <Input id="a_pass" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={superAdmin} onChange={(e) => setSuperAdmin(e.target.checked)} className="h-4 w-4 rounded border-input" />
        Grant <strong>super admin</strong> (can manage other admins)
      </label>
      <p className="mt-2 text-xs text-muted-foreground">
        The new admin is created already verified and can log in immediately. Min 8 chars, upper/lower/number.
      </p>
      <Button type="submit" className="mt-5" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        Add administrator
      </Button>
    </form>
  );
}

function ChangeMyPassword() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/admin/change-password", { currentPassword, newPassword });
      toast({ title: "Password changed", description: "Use your new password next time.", variant: "success" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast({
        title: "Couldn't change password",
        description: err instanceof ApiClientError ? err.message : "Try again",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-xl rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Change my password</h3>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cur">Current password</Label>
          <Input id="cur" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="np">New password</Label>
          <Input id="np" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </div>
      </div>
      <Button type="submit" variant="outline" className="mt-5" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Update password
      </Button>
    </form>
  );
}
