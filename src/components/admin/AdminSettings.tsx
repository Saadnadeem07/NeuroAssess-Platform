"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PageIntro, LoadingBlock } from "@/components/dashboard/widgets";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface Settings {
  emailNotifications: boolean;
  systemAlerts: boolean;
  dataRetention: string;
  securityLevel: string;
}

export function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<{ data: Settings }>("/admin/settings").then((r) => setSettings(r.data));
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await api.put("/admin/settings", settings);
      toast({ title: "Settings saved", variant: "success" });
    } catch (err) {
      toast({ title: "Couldn't save", description: (err as Error).message, variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <LoadingBlock label="Loading settings…" />;

  const Toggle = ({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted-foreground/30"}`}
        role="switch"
        aria-checked={value}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );

  return (
    <div>
      <PageIntro title="System settings" description="Platform-wide configuration." />
      <div className="max-w-2xl space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Preferences</h3>
        </div>
        <Toggle
          label="Email notifications"
          hint="Send transactional emails to users."
          value={settings.emailNotifications}
          onChange={(v) => setSettings({ ...settings, emailNotifications: v })}
        />
        <Toggle
          label="System alerts"
          hint="Surface platform health alerts."
          value={settings.systemAlerts}
          onChange={(v) => setSettings({ ...settings, systemAlerts: v })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Data retention (days)</Label>
            <Select value={settings.dataRetention} onChange={(e) => setSettings({ ...settings, dataRetention: e.target.value })}>
              <option value="30">30</option>
              <option value="90">90</option>
              <option value="180">180</option>
              <option value="365">365</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Security level</Label>
            <Select value={settings.securityLevel} onChange={(e) => setSettings({ ...settings, securityLevel: e.target.value })}>
              <option value="standard">Standard</option>
              <option value="high">High</option>
              <option value="strict">Strict</option>
            </Select>
          </div>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save settings
        </Button>
      </div>
    </div>
  );
}
