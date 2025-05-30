// components/AuthButton.tsx
//
// Technical explanation:
// Async server component that dynamically renders UI based on auth status and
// environment variable setup.
// - Shows a warning badge if essential Supabase environment variables are missing.
// - Renders an `AuthDropdown` component (displaying user email and a sign-out
//   option) if a user is currently authenticated.
// - Shows "Sign In" and "Sign Up" buttons if no user is authenticated, allowing
//   visitors to access authentication pages.
//
// Analogy:
// This component is like an intelligent welcome sign at the entrance of the
// "Dreamlink house".
// - If the house's systems are down (missing environment variables), it displays
//   a "Temporarily Closed - System Maintenance" notice.
// - For recognized residents (logged-in users), it shows a personalized menu
//   (AuthDropdown) with their name and an option to leave (sign out).
// - For new visitors (anonymous users), it presents clear "Enter" (Sign In) and
//   "Register" (Sign Up) buttons.

import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { createClient } from "@/utils/supabase/server";
import AuthDropdown from "./AuthDropdown"; // Import client component

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasEnvVars) {
    return (
      <div className="flex gap-4 items-center">
        <div>
          <Badge variant="default" className="font-normal pointer-events-none">
            Please update .env.local file with anon key and url
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="default"
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    );
  }

  return user ? (
    <AuthDropdown userEmail={user.email ?? ""} />
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}