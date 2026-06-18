import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "NeuroAssess — AI-assisted dyslexia & dysgraphia support",
    template: "%s · NeuroAssess",
  },
  description:
    "NeuroAssess detects markers of dyslexia and dysgraphia from handwriting and turns the result into a personalised learning plan, with access to licensed psychiatrists.",
  keywords: ["dyslexia", "dysgraphia", "handwriting analysis", "learning support", "NeuroAssess"],
  authors: [{ name: "NeuroAssess" }],
  openGraph: {
    title: "NeuroAssess",
    description: "AI-assisted dyslexia & dysgraphia detection and personalised support.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
