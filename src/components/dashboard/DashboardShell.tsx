"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

export function DashboardShell({
  navItems,
  active,
  onChange,
  roleLabel,
  userName,
  children,
}: {
  navItems: NavItem[];
  active: string;
  onChange: (key: string) => void;
  roleLabel: string;
  userName?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const initials = (userName || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const NavList = () => (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            onClick={() => {
              onChange(item.key);
              setOpen(false);
            }}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active === item.key
                ? "gradient-brand text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge ? (
              <span
                className={cn(
                  "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-xs font-semibold",
                  active === item.key ? "bg-white/25 text-white" : "bg-primary/10 text-primary"
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {roleLabel}
          </p>
          <NavList />
        </div>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-sm font-semibold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userName || "User"}</p>
              <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
          <Button variant="ghost" className="mt-1 w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-card shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <Logo />
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <NavList />
            </div>
            <div className="border-t border-border p-3">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-lg lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold sm:text-lg">
              {navItems.find((n) => n.key === active)?.label ?? roleLabel}
            </h1>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-sm font-semibold text-primary-foreground lg:hidden">
            {initials}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
