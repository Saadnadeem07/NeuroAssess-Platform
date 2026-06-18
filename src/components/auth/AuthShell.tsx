import Link from "next/link";
import { BrainCircuit, ShieldCheck, ScanLine, Stethoscope } from "lucide-react";

/** Split-screen auth layout: brand panel + form card. Fully responsive. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden gradient-brand p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -left-16 top-20 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        </div>
        <Link href="/" className="relative inline-flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
            <BrainCircuit className="h-6 w-6" />
          </span>
          <span className="text-xl font-bold">NeuroAssess</span>
        </Link>

        <div className="relative">
          <h2 className="max-w-md text-3xl font-bold leading-snug">
            Early detection and personalised support, in one secure platform.
          </h2>
          <ul className="mt-8 space-y-4 text-primary-foreground/90">
            <li className="flex items-center gap-3">
              <ScanLine className="h-5 w-5 shrink-0" /> AI handwriting analysis in under a minute
            </li>
            <li className="flex items-center gap-3">
              <Stethoscope className="h-5 w-5 shrink-0" /> Book and message licensed psychiatrists
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0" /> Secure, cookie-based authentication
            </li>
          </ul>
        </div>

        <p className="relative text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} NeuroAssess
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg gradient-brand text-primary-foreground">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold">
              Neuro<span className="text-gradient-brand">Assess</span>
            </span>
          </Link>
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
