// app/auth/callback/route.ts
//
// Technical explanation:
// API route handler for `/auth/callback`. Handles OAuth callbacks and email
// verification redirects. Exchanges an authorization `code` (from URL params)
// for a user session via `supabase.auth.exchangeCodeForSession(code)`.
// Redirects user to a specified path or homepage after session creation.
//
// Analogy:
// A secure checkpoint (customs desk) after visiting an external embassy (OAuth
// provider) for a visa (auth code). The visa is presented, verified, and an
// entry permit (session) is granted, then user is directed to their
// destination or main city square.

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/`);
}
