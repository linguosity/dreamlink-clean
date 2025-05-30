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
import Image from 'next/image';
import { Providers } from './providers';
import { VersionChecker } from '@/components/VersionChecker';

// Determine the base URL for metadata and redirects
const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

// ① Next.js Metadata API
export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Dreamlink – Dream Journal",
  description: "Track and analyze your dreams with AI-powered insights",
  openGraph: {
    title: "Dreamlink – Dream Journal",
    description: "Track and analyze your dreams with AI-powered insights",
    url: defaultUrl,
    siteName: "Dreamlink",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dreamlink – Dream Journal",
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

  // Determine if the current path is an auth‐related page
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAuthPage =
    pathname.includes("/sign-in") ||
    pathname.includes("/sign-up") ||
    pathname.includes("/forgot-password");

  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/background.jpg"
          alt=""
          fill
          className="object-cover object-center blur-[5px]"
          priority
        />
      </div>
        <Providers>
          <VersionChecker />
          <main className="min-h-screen flex flex-col animate-fade-in">
            {/* Env‐var warning or Navbar */}
            {!hasEnvVars ? (
              <div className="w-full flex justify-center border-b h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 text-sm">
                  <EnvVarWarning />
                </div>
              </div>
            ) : !isAuthPage && user ? (
              <Navbar />
            ) : null}

            {/* Main content */}
            <div
              className={
                `flex-1 ` +
                (!user && !isAuthPage ? "flex items-center justify-center" : "")
              }
            >
              {children}
            </div>

            {/* Global toast container */}
            <Toaster />

            {/* Footer only on auth pages */}
            {isAuthPage && (
              <footer className="w-full flex items-center justify-between border-t p-4 text-xs">
                <p className="text-white">
                  © {new Date().getFullYear()} Dreamlink. All rights reserved.
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