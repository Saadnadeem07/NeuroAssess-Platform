"use client";

import { useRef, useState } from "react";
import { Upload, ScanLine, FileImage, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageIntro } from "@/components/dashboard/widgets";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

type Analysis = {
  classification: { class: string; confidence: number };
  feedback?: { summary?: string | null };
  dysgraphic_words?: string[];
  spelling_errors?: string[];
  alignment_issues?: string[];
  spacing_issues?: string[];
};

export function InitialTestPanel() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);

  const pick = (f: File | null) => {
    setResult(null);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const run = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await api.upload<{ results: Analysis; message: string }>("/tests/initial", form);
      setResult(res.results);
      toast({ title: "Analysis complete", description: res.message, variant: "success" });
    } catch {
      toast({ title: "Analysis failed", description: "Please try another image.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const flagged = result?.classification.class === "Potential Dysgraphia";

  return (
    <div>
      <PageIntro
        title="Handwriting assessment"
        description="Upload a clear photo of a handwriting sample. Our AI screens it for markers of dysgraphia."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pick(e.dataTransfer.files?.[0] ?? null);
            }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center transition-colors hover:border-primary/50"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Handwriting preview" className="max-h-56 rounded-lg object-contain" />
            ) : (
              <>
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <Upload className="h-6 w-6" />
                </span>
                <p className="mt-4 text-sm font-medium">Click to upload or drag & drop</p>
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or GIF · up to 10MB</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif"
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0] ?? null)}
            />
          </div>
          {file && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <FileImage className="h-4 w-4" />
              <span className="truncate">{file.name}</span>
            </div>
          )}
          <Button className="mt-5 w-full" size="lg" disabled={!file || loading} onClick={run}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
            {loading ? "Analysing…" : "Run analysis"}
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold">Result</h3>
          {!result ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Your assessment result will appear here after analysis.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <div
                className={`flex items-center gap-3 rounded-lg border p-4 ${
                  flagged ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"
                }`}
              >
                {flagged ? (
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                )}
                <div>
                  <p className="font-semibold">{result.classification.class}</p>
                  <p className="text-xs text-muted-foreground">
                    Confidence {Math.round(result.classification.confidence * 100)}%
                  </p>
                </div>
              </div>

              {result.feedback?.summary && (
                <p className="text-sm text-muted-foreground">{result.feedback.summary}</p>
              )}

              {flagged && (
                <div className="space-y-3">
                  <DetailList title="Flagged words" items={result.dysgraphic_words} />
                  <DetailList title="Spelling patterns" items={result.spelling_errors} />
                  <DetailList title="Alignment" items={result.alignment_issues} />
                  <DetailList title="Spacing" items={result.spacing_issues} />
                  <p className="rounded-lg bg-primary/5 p-3 text-xs text-primary">
                    A report has been saved. Head to <strong>Learning Plan</strong> to begin Module 1.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailList({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <Badge key={i} variant="muted">
            {it}
          </Badge>
        ))}
      </div>
    </div>
  );
}
