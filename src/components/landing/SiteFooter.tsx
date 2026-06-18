import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container-tight py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              AI-assisted early detection and personalised support for students with dyslexia and
              dysgraphia — built alongside licensed professionals.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground">How it works</a></li>
              <li><Link href="/register" className="hover:text-foreground">Get started</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground">Patient / Psychiatrist login</Link></li>
              <li><Link href="/admin/login" className="hover:text-foreground">Admin login</Link></li>
              <li><Link href="/register" className="hover:text-foreground">Create account</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} NeuroAssess. All rights reserved.</p>
          <p>
            For educational support only — not a substitute for professional medical diagnosis.
          </p>
        </div>
      </div>
    </footer>
  );
}
