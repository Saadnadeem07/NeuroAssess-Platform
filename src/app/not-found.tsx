import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/landing/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 px-4 text-center">
      <Logo />
      <p className="mt-10 text-7xl font-extrabold text-gradient-brand">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="mt-8">
        <Button size="lg">Back to home</Button>
      </Link>
    </div>
  );
}
