// app/(auth-pages)/sign-up/page.tsx
//
// Technical explanation:
// Defines the client-side UI and logic for user registration. Manages form
// state (email, password) and uses `useTransition` for submission pending
// states. Calls `signUpAction` (server action) for registration. Displays a
// toast notification on success and links to the sign-in page.
//
// Analogy:
// A registration form for a new service. Users fill in details (email,
// password) to create an account. The form is submitted (like sending an
// application), and on success, provides next steps (email verification).

'use client';

import { useTransition, useState } from "react";
import { signUpAction } from "@/app/actions";
import { toast } from "sonner";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const result = await signUpAction(formData);

      if ('error' in result) {
        toast.error(result.error);
      } else if ('success' in result) {
        toast.success("Check your email to verify your account.");
        setEmail('');
        setPassword('');
      }
    });
  }

  return (
    <Card className="w-full min-h-[500px]">
      <CardHeader>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Join Dreamlink to start recording and analyzing your dreams
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex-1 flex flex-col w-full space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <SubmitButton
            isLoading={pending}
            pendingText="Signing up..."
            className="w-full"
          >
            Sign up
          </SubmitButton>
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
  );
}