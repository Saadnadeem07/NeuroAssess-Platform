import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-lg gradient-brand text-primary-foreground shadow-sm">
        <BrainCircuit className="h-5 w-5" />
      </span>
      <span className="text-lg font-bold tracking-tight">
        Neuro<span className="text-gradient-brand">Assess</span>
      </span>
    </Link>
  );
}
