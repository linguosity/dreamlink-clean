// app/layout.tsx
//
// Technical explanation:
// Main layout component for the Next.js application. It sets up the HTML
// structure, includes global styles, fonts, and providers. It also handles
// basic user authentication logic and renders the Navbar and Footer.
//
// Analogy:
// It's like the blueprint of a house, defining the overall structure, where
// the rooms (pages) will go, and common elements like the foundation (HTML
// structure), a security system (auth), and shared utilities (providers,
// global styles).

import { Metadata } from "next";
import { Suspense } from "react";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import "./globals.css";
import { Providers } from './providers';
import { LazyWaterBackground } from '@/components/LazyWaterBackground';
import { VersionChecker } from '@/components/VersionChecker';
import CookieConsent from '@/components/CookieConsent';

// Determine the base URL for metadata and redirects
const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

// ① Next.js Metadata API
export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "DreamRiver – Dream Journal",
  description: "Track and analyze your dreams with AI-powered insights",
  openGraph: {
    title: "DreamRiver – Dream Journal",
    description: "Track and analyze your dreams with AI-powered insights",
    url: defaultUrl,
    siteName: "DreamRiver",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DreamRiver – Dream Journal",
    description: "Track and analyze your dreams with AI-powered insights",
  },
};

// Load the Geist font with Latin subset
const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;

  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError) {
        if (userError.message.includes("User from sub claim")) {
          // kick into our sign-out handler, with a message
          const msg = encodeURIComponent("Session expired. Please sign in again.");
          redirect(`/api/auth/signout?redirect_to=/sign-in?error=${msg}`);
        }
        else if (userError.message !== "Auth session missing!") {
          console.error("Error fetching user:", userError.message);
        }
      } else {
        user = data.user;
      }
    }
  } catch (err: unknown) {
    // re-throw Next.js redirects so they become real HTTP 3xxs
    if (isRedirectError(err)) throw err;
    console.error("Unexpected auth error in layout:", err);
  }

  // Determine if the current path is an auth‐related page or landing page
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAuthPage =
    pathname.includes("/sign-in") ||
    pathname.includes("/sign-up") ||
    pathname.includes("/forgot-password");
  const isLandingPage = pathname.includes("/landing");

  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="text-foreground">
      <LazyWaterBackground />
        <Providers>
          <VersionChecker />
          {/* Skip-to-content link for keyboard/screen-reader users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Skip to content
          </a>
          <main className="min-h-screen flex flex-col animate-fade-in">
            {/* Env‐var warning or Navbar */}
            {!hasEnvVars ? (
              <div className="w-full flex justify-center border-b h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 text-sm">
                  <EnvVarWarning />
                </div>
              </div>
            ) : !isAuthPage && !isLandingPage && user ? (
              <Navbar />
            ) : null}

            {/* Main content */}
            <div
              id="main-content"
              className={
                `flex-1 ` +
                (!user && !isAuthPage && !isLandingPage ? "flex items-center justify-center" : "")
              }
            >
              <Suspense fallback={null}>
                {children}
              </Suspense>
            </div>

            {/* Global toast container */}
            <Toaster />

            {/* Cookie consent banner */}
            <CookieConsent />

            {/* Footer only on auth pages (landing page has its own footer) */}
            {isAuthPage && (
              <footer className="w-full flex items-center justify-between border-t p-4 text-xs">
                <p className="text-white">
                  © {new Date().getFullYear()} DreamRiver. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <ThemeSwitcher />
                </div>
              </footer>
            )}
          </main>
        </Providers>
      </body>
    </html>
  );
}