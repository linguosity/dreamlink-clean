// app/(auth-pages)/layout.tsx
//
// Technical explanation:
// Layout for authentication pages (sign-in, sign-up, forgot-password).
// Redirects to '/' if a user session exists. Otherwise, displays the
// authentication form (passed as children) in a centered layout, typically
// featuring the application logo or name. It also handles the display of
// error or success messages passed via URL search parameters.
//
// Analogy:
// This is like the reception lobby for a members-only club. If you're already
// a recognized member (active session), you're quickly ushered into the main
// club area ('/'). If you're not recognized, you remain in the lobby to go
// through the entry procedures (sign-in, sign-up). Any important notices
// (error or success messages) related to these procedures are displayed
// prominently in this lobby area.

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { FormMessage, Message } from "@/components/form-message";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import AuthNavigation from "@/components/AuthNavigation";

export default async function AuthLayout({
  children,
  searchParams,
}: {
  children: ReactNode;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    // If we have a JWT error, don't redirect - just show the login page
    if (error && (error.message.includes('JWT') || error.message.includes('expired') || error.message.includes('token'))) {
      console.log("JWT expired, showing login page");
    } else if (session) {
      // If already logged in, send them home—preserve any ?success=… query
      const params = searchParams ? new URLSearchParams(
        Object.entries(searchParams)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, value!.toString()])
      ).toString() : "";
      
      return redirect(params ? `/?${params}` : "/");
    }
  } catch (err) {
    // Re-throw Next.js redirects
    if (isRedirectError(err)) throw err;
    console.error("Auth check error:", err);
  }

  // Construct message object for FormMessage
  const message: Partial<Message> = {};
  if (searchParams?.error) {
    message.error = Array.isArray(searchParams.error) 
      ? searchParams.error[0] 
      : searchParams.error;
  } else if (searchParams?.success) {
    message.success = Array.isArray(searchParams.success)
      ? searchParams.success[0]
      : searchParams.success;
  }

  // Otherwise render the normal auth UI
  return (
    <div className="min-h-screen w-full relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-20 blur-[2px]"
          style={{ backgroundImage: "url('/images/background.jpg')" }}
        />
        <div className="absolute inset-0 bg-background/90" />
      </div>

      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="flex flex-col items-center max-w-2xl w-full mx-auto px-5 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg">
                <div className="h-4 w-4 bg-background rounded-full"></div>
              </div>
              <h1 className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Dreamlink
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-Powered Biblical Dream Interpretation
            </p>
          </div>
          
          {/* Navigation */}
          <div className="w-full max-w-md">
            <AuthNavigation variant="compact" />
          </div>
          
          {/* Messages */}
          {(message.error || message.success) && (
            <div className="w-full max-w-md">
              <FormMessage message={message as Message} />
            </div>
          )}
          
          {/* Content */}
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
