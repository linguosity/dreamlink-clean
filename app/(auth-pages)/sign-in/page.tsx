// app/(auth-pages)/sign-in/page.tsx
//
// Technical explanation:
// Creates the UI for the sign-in page. Includes a form for email and
// password, a 'Forgot Password?' link, and a submit button triggering
// `signInAction`. Displays messages from search params and links to the
// sign-up page. Uses Card components for structure.
//
// Analogy:
// The main login screen of a secure application, like an online bank. Users
// provide credentials to access. Links are available for password recovery or
// new user registration.

import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Sign in to Dreamlink</CardTitle>
        <CardDescription>
          Enter your email and password to access your dream journal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex-1 flex flex-col w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input name="email" id="email" placeholder="you@example.com" required />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                className="text-xs text-muted-foreground hover:text-foreground"
                href="/forgot-password"
                prefetch={true}
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              id="password" 
              placeholder="Your password"
              required
            />
          </div>
          
          <SubmitButton pendingText="Signing In..." formAction={signInAction} className="w-full">
            Sign in
          </SubmitButton>
          
          <FormMessage message={searchParams} />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t pt-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link className="text-primary font-medium hover:underline" href="/sign-up" prefetch={true}>
              Sign up
            </Link>
          </p>
          
          <div className="p-3 bg-muted/30 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground mb-2">
              🌟 Discover our flexible pricing options
            </p>
            <Link 
              href="/pricing"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View Pricing Plans
              <span className="text-xs">→</span>
            </Link>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
