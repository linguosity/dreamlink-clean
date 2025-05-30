import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  // Log the received cookies for debugging
  const cookieStore = await cookies();
  console.log("[debug-session] Cookies:", cookieStore.getAll());

  // Create a Supabase server client using the cookies from the request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  // Attempt to get the current user session
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json(
      { success: false, error: error?.message || "Auth session missing!" },
      { status: 400 }
    );
  }
  
  return NextResponse.json({ success: true, session: data.user });
}