import Link from "next/link";
import {
  ScanLine,
  BookOpenCheck,
  CalendarCheck2,
  MessagesSquare,
  ShieldCheck,
  LineChart,
  GraduationCap,
  Users,
  Stethoscope,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SiteNav } from "@/components/landing/SiteNav";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: ScanLine,
    title: "AI handwriting analysis",
    desc: "Upload a handwriting sample and get an instant assessment for markers of dysgraphia — with flagged words, spacing and alignment insights.",
  },
  {
    icon: BookOpenCheck,
    title: "Personalised learning plans",
    desc: "Results become a structured, multi-module plan that adapts to each student and builds skills progressively.",
  },
  {
    icon: Stethoscope,
    title: "Licensed psychiatrists",
    desc: "Browse verified professionals, book consultations, and get human guidance alongside the AI.",
  },
  {
    icon: CalendarCheck2,
    title: "Appointment scheduling",
    desc: "Book consultations around each psychiatrist's real availability, with conflict-free slots.",
  },
  {
    icon: MessagesSquare,
    title: "Secure messaging",
    desc: "Message your psychiatrist directly once you have an appointment — private and in-platform.",
  },
  {
    icon: LineChart,
    title: "Progress tracking",
    desc: "Every assessment and completed module is saved as a report so progress is always visible.",
  },
];

const STEPS = [
  { n: "01", title: "Create your account", desc: "Register in seconds and verify your email with a one-time code." },
  { n: "02", title: "Take the handwriting test", desc: "Upload a sample; the AI analyses it for markers of dysgraphia." },
  { n: "03", title: "Follow your plan", desc: "Work through your personalised modules at your own pace." },
  { n: "04", title: "Get professional support", desc: "Book and message licensed psychiatrists whenever you need them." },
];

const AUDIENCE = [
  { icon: GraduationCap, title: "Students & parents", desc: "Early, accessible screening and a clear path forward — without the waiting room." },
  { icon: Stethoscope, title: "Psychiatrists", desc: "A verified profile, a managed patient roster, scheduling and messaging in one place." },
  { icon: Users, title: "Institutions", desc: "Administer access, verify professionals, and oversee the platform with confidence." },
];

const FAQ = [
  {
    q: "Is NeuroAssess a medical diagnosis?",
    a: "No. NeuroAssess is an educational screening and support tool. It surfaces markers and connects you with licensed professionals, but it does not replace a formal clinical diagnosis.",
  },
  {
    q: "How does the handwriting analysis work?",
    a: "You upload an image of a handwriting sample. Our model assesses letter formation, spacing, alignment and spelling patterns, and returns a classification with detailed feedback.",
  },
  {
    q: "Who can see my data?",
    a: "Your reports are private to your account. You can only message a psychiatrist once you have an appointment, and all auth is protected with secure, httpOnly sessions.",
  },
  {
    q: "How are psychiatrists verified?",
    a: "Every psychiatrist submits credentials (license, degrees, certificate) at sign-up and is manually reviewed and approved by an administrator before they can practise on the platform.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-[-10%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute right-[5%] top-[20%] h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
          </div>
          <div className="container-tight py-20 text-center sm:py-28">
            <Badge className="mx-auto mb-6 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              AI-assisted learning support
            </Badge>
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Understand handwriting.
              <br />
              <span className="text-gradient-brand">Unlock every learner.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              NeuroAssess detects markers of dyslexia and dysgraphia from handwriting and turns the
              result into a personalised learning plan — with licensed psychiatrists a click away.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  I already have an account
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required · Verify with a one-time email code
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-border bg-muted/30">
          <div className="container-tight grid grid-cols-2 gap-6 py-10 sm:grid-cols-4">
            {[
              { v: "4", l: "Connected roles" },
              { v: "2", l: "Learning modules" },
              { v: "100%", l: "Cookie-secure auth" },
              { v: "<1 min", l: "To first result" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="text-3xl font-extrabold text-gradient-brand">{s.v}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container-tight py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="muted" className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything in one platform</h2>
            <p className="mt-4 text-muted-foreground">
              From the first assessment to ongoing professional care, NeuroAssess connects the whole journey.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:gradient-brand group-hover:text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-y border-border bg-muted/30">
          <div className="container-tight py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="muted" className="mb-4">How it works</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From sample to support in four steps</h2>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <span className="text-3xl font-extrabold text-primary/20">{s.n}</span>
                  <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audience */}
        <section id="audience" className="container-tight py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="muted" className="mb-4">Who it&apos;s for</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for everyone in the journey</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {AUDIENCE.map((a) => (
              <div key={a.title} className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-primary-foreground">
                  <a.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-border bg-muted/30">
          <div className="container-tight py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="muted" className="mb-4">FAQ</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Questions, answered</h2>
            </div>
            <div className="mx-auto mt-12 max-w-3xl space-y-4">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-xl border border-border bg-card p-5 shadow-sm [&_summary]:cursor-pointer"
                >
                  <summary className="flex items-center justify-between text-base font-semibold">
                    {item.q}
                    <span className="ml-4 text-primary transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container-tight py-20 sm:py-24">
          <div className="relative overflow-hidden rounded-3xl gradient-brand px-8 py-16 text-center text-primary-foreground shadow-lg">
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/30 blur-2xl" />
              <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
            </div>
            <div className="relative">
              <ShieldCheck className="mx-auto mb-4 h-10 w-10" />
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Start understanding handwriting today
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
                Create a free account and run your first AI assessment in under a minute.
              </p>
              <Link href="/register" className="mt-8 inline-block">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
