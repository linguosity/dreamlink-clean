// app/api/auth/signout/route.ts
//
// Technical explanation:
// API route for user sign-out. On GET request, calls
// `supabase.auth.signOut()` to clear the session and auth cookies. Redirects
// to a `redirect_to` query param destination or defaults to `/sign-in`.
//
// Analogy:
// The official "check-out" desk. Processes departure, invalidates entry
// permit (clears auth cookies), and directs to the main exit or a specified
// pick-up point.

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  // clears the sb-… cookies
  await supabase.auth.signOut();

  // read an optional ?redirect_to=… query param
  const { origin, searchParams } = new URL(request.url);
  const nextLocation = searchParams.get("redirect_to") || "/sign-in";

  return NextResponse.redirect(new URL(nextLocation, origin));
}