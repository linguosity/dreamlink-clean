// app/(auth-pages)/sign-up/page.tsx
//
// React 19 modernization: uses useActionState for form state management,
// replacing the previous useTransition + manual state pattern.

'use client';

import { useActionState, useEffect } from "react";
import { signUpAction } from "@/app/actions";
import { toast } from "sonner";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { Moon, Sparkles, CheckCircle } from "lucide-react";
import GoogleOAuthButton from "@/components/GoogleOAuthButton";

// Action state shape returned by signUpAction
type SignUpState = {
  error?: string;
  success?: string;
} | null;

export default function Signup() {
  const [state, formAction, pending] = useActionState<SignUpState, FormData>(
    async (_prevState, formData) => {
      return await signUpAction(formData);
    },
    null
  );

  // Show toast notifications when state changes
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.success) {
      toast.success("Check your email to verify your account.");
    }
  }, [state]);

  // Show inline error below the form
  const errorMessage = state?.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Start Your Free Trial
          </Badge>
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Join DreamRiver
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Begin your spiritual dream interpretation journey
          </p>
        </div>

        <Card className="w-full shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm mb-6">
          <CardHeader className="text-center pb-4">
            <Moon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <CardTitle className="text-xl">Start Your Free Trial</CardTitle>
            <CardDescription>
              7 days free &bull; No credit card required &bull; Cancel anytime
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleOAuthButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-800 px-2 text-muted-foreground">
                  or sign up with email
                </span>
              </div>
            </div>

            <form className="flex-1 flex flex-col w-full space-y-4" action={formAction}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Your password"
                  minLength={6}
                  required
                />
              </div>

              <SubmitButton
                isLoading={pending}
                pendingText="Signing up..."
                className="w-full"
              >
                Sign up
              </SubmitButton>

              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20 p-3 text-sm text-red-600 dark:text-red-400">
                  {errorMessage}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters with an uppercase letter, lowercase letter, and number or special character.
              </p>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t pt-4">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link className="text-primary font-medium hover:underline" href="/sign-in">
                  Sign in
                </Link>
              </p>
            </div>
            <SmtpMessage />
          </CardFooter>
        </Card>

        {/* Benefits reminder */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-none">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-center">What you'll get:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>AI-powered dream interpretations</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Biblical references and insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Private dream journal</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Pattern tracking and insights</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/landing" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
