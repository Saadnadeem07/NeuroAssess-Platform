"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpenCheck, Upload, Loader2, Lock, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageIntro, LoadingBlock } from "@/components/dashboard/widgets";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import type { LearningPlanEntity } from "@/lib/types";

export function LearningPlanPanel() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<LearningPlanEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get<{ data: LearningPlanEntity[] }>("/learning-plans");
      setPlans(res.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const m1 = plans.find((p) => p.module_number === 1);
  const m2 = plans.find((p) => p.module_number === 2);

  const reset = async () => {
    try {
      await api.post("/learning-plans/reset");
      toast({ title: "Plan completed & archived", description: "A backup was saved to your reports.", variant: "success" });
      setPlans([]);
    } catch (err) {
      toast({ title: "Couldn't reset", description: (err as Error).message, variant: "error" });
    }
  };

  if (loading) return <LoadingBlock label="Loading your learning plan…" />;

  return (
    <div>
      <PageIntro
        title="Your learning plan"
        description="A two-module programme generated from your handwriting. Complete Module 1 to unlock Module 2."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCard
          moduleNumber={1}
          plan={m1}
          locked={false}
          onDone={load}
        />
        <ModuleCard
          moduleNumber={2}
          plan={m2}
          locked={!m1}
          previousPlan={m1?.learning_plan_paragraph}
          onDone={load}
        />
      </div>

      {m1 && m2 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-800">Both modules complete!</p>
              <p className="text-sm text-emerald-700">Archive this plan to start a fresh one.</p>
            </div>
          </div>
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Archive & reset
          </Button>
        </div>
      )}
    </div>
  );
}

function ModuleCard({
  moduleNumber,
  plan,
  locked,
  previousPlan,
  onDone,
}: {
  moduleNumber: 1 | 2;
  plan?: LearningPlanEntity;
  locked: boolean;
  previousPlan?: string;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("moduleNumber", String(moduleNumber));
      if (moduleNumber === 2 && previousPlan) form.append("previousLearningPlan", previousPlan);
      await api.upload(`/learning-plans/module`, form);
      toast({ title: `Module ${moduleNumber} updated`, variant: "success" });
      onDone();
    } catch (err) {
      toast({ title: "Upload failed", description: (err as Error).message, variant: "error" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`rounded-xl border bg-card p-6 shadow-sm ${locked ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
            {locked ? <Lock className="h-5 w-5" /> : <BookOpenCheck className="h-5 w-5" />}
          </span>
          <div>
            <h3 className="font-semibold">Module {moduleNumber}</h3>
            <p className="text-xs text-muted-foreground">
              {plan ? "Completed" : locked ? "Locked" : "Not started"}
            </p>
          </div>
        </div>
        {plan && <Badge variant="success">Done</Badge>}
      </div>

      {plan ? (
        <p className="mt-4 rounded-lg bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
          {plan.learning_plan_paragraph}
        </p>
      ) : locked ? (
        <p className="mt-4 text-sm text-muted-foreground">Complete Module 1 to unlock this module.</p>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Upload a new handwriting sample to generate this module&apos;s plan.
        </p>
      )}

      {!locked && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <Button
            variant={plan ? "outline" : "default"}
            className="mt-5 w-full"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {plan ? "Regenerate from new sample" : `Generate Module ${moduleNumber}`}
          </Button>
        </>
      )}
    </div>
  );
}
