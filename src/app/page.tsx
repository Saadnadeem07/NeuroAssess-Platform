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
  BookOpen,
  PenLine,
  Lightbulb,
  Heart,
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

const JOURNEY = [
  {
    n: "01",
    title: "Initial assessment",
    desc: "Complete an AI-powered handwriting assessment to evaluate signs of dyslexia or dysgraphia.",
    points: ["AI analysis of writing patterns", "Symptom identification", "Initial recommendations"],
  },
  {
    n: "02",
    title: "Personalized learning plan",
    desc: "Receive a tailored, multi-module plan built from AI insights and expert-informed strategies.",
    points: ["Targeted reading & writing exercises", "Intervention strategies", "Progress tracking & adjustments"],
  },
  {
    n: "03",
    title: "Expert consultation",
    desc: "Consult a licensed psychiatrist to validate the AI findings and discuss next steps.",
    points: ["Expert review of AI results", "Customized recommendations", "Ongoing follow-up consultations"],
  },
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

const DYSLEXIA_SIGNS = [
  "Reversing letters or whole words (b/d, was/saw)",
  "Slow, effortful reading aloud",
  "Difficulty with spelling, rhyming and phonics",
  "Trouble remembering sequences and instructions",
];

const DYSGRAPHIA_SIGNS = [
  "Inconsistent letter size, shape and spacing",
  "Mixing capital and lowercase letters",
  "Awkward pencil grip; tires quickly when writing",
  "Writing that doesn't match the child's ideas or ability",
];

// Illustrative examples of common patterns — NOT real student data.
const WRITING_EXAMPLES = [
  { wrote: "I lik to red bwks abuot dinosrs", meant: "I like to read books about dinosaurs" },
  { wrote: "We went to the prak on Wensday", meant: "We went to the park on Wednesday" },
  { wrote: "My freind sed it was a god day", meant: "My friend said it was a good day" },
];

const REVERSALS = ["b ↔ d", "was ↔ saw", "on ↔ no", "p ↔ q"];

// Lined-notebook background for the handwriting samples.
const PAPER_STYLE = {
  backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, hsl(214 32% 88%) 32px)",
  backgroundColor: "hsl(48 100% 98%)",
} as const;

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
              Empowering neurodivergent minds
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

        {/* Understanding the challenge */}
        <section id="understanding" className="container-tight py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="muted" className="mb-4">Understanding the challenge</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              It&apos;s not about effort or intelligence
            </h2>
            <p className="mt-4 text-muted-foreground">
              Dyslexia and dysgraphia are common, lifelong learning differences in how the brain
              processes reading and writing. With early detection and the right support, every
              learner can thrive.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-semibold">Dyslexia</h3>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Affects how the brain decodes reading, spelling and words — entirely independent of
                intelligence. Many people with dyslexia are exceptionally creative, big-picture
                problem-solvers.
              </p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Common signs
              </p>
              <ul className="mt-3 space-y-2">
                {DYSLEXIA_SIGNS.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <PenLine className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-semibold">Dysgraphia</h3>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Affects the physical act of writing — letter formation, spacing and putting thoughts
                on paper. A child can know exactly what they want to say, yet struggle to write it
                legibly.
              </p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Common signs
              </p>
              <ul className="mt-3 space-y-2">
                {DYSGRAPHIA_SIGNS.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center sm:flex-row sm:text-left">
            <Lightbulb className="h-7 w-7 shrink-0 text-primary" />
            <p className="text-sm text-foreground">
              <strong>Around 1 in 10 people</strong> are affected by dyslexia — and it often goes
              undiagnosed for years. Early detection changes the whole trajectory of a child&apos;s
              learning.
            </p>
          </div>
        </section>

        {/* What it looks like — illustrative handwriting */}
        <section className="border-y border-border bg-muted/30">
          <div className="container-tight py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="muted" className="mb-4">What it looks like</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                The same bright idea — harder to get onto the page
              </h2>
              <p className="mt-4 text-muted-foreground">
                Below are illustrative examples of the handwriting and spelling patterns NeuroAssess
                is designed to recognise — the gap between what a learner means and what reaches the
                page.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {WRITING_EXAMPLES.map((ex) => (
                <div key={ex.meant} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="px-5 py-6" style={PAPER_STYLE}>
                    <p className="font-hand text-2xl leading-8 text-slate-700">{ex.wrote}</p>
                  </div>
                  <div className="border-t border-border p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Meant to write</p>
                    <p className="mt-1 text-sm font-medium text-foreground">&ldquo;{ex.meant}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-4">
              <p className="text-sm font-semibold text-muted-foreground">Letters and words that get mirrored or swapped</p>
              <div className="flex flex-wrap justify-center gap-3">
                {REVERSALS.map((r) => (
                  <span
                    key={r}
                    className="rounded-xl border border-border bg-card px-5 py-3 font-hand text-2xl text-slate-700 shadow-sm"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <p className="mx-auto mt-10 max-w-xl text-center text-xs text-muted-foreground">
              <Heart className="mr-1 inline h-3.5 w-3.5 text-primary" />
              Illustrative examples of common patterns, created for explanation — not real student
              data. Every learner is different, which is exactly why assessment and support are
              personalised.
            </p>
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

        {/* How it works — your path to personalized support */}
        <section id="how-it-works" className="border-y border-border bg-muted/30">
          <div className="container-tight py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="muted" className="mb-4">How it works</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Your path to personalized support
              </h2>
              <p className="mt-4 text-muted-foreground">
                From the first assessment to expert-validated care, NeuroAssess guides every student
                through a clear, supportive journey.
              </p>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {JOURNEY.map((s) => (
                <div key={s.n} className="relative flex flex-col rounded-2xl border border-border bg-card p-7 shadow-sm">
                  <span className="grid h-11 w-11 place-items-center rounded-xl gradient-brand text-base font-bold text-primary-foreground">
                    {s.n}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  <ul className="mt-5 space-y-2 border-t border-border pt-5">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm">
                        <span className="mt-1 text-primary">✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
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
