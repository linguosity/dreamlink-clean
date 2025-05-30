// app/(auth-pages)/smtp-message.tsx
//
// Technical explanation:
// A React component displaying an informational message about email rate
// limiting with Supabase's default SMTP. It links to Supabase documentation
// for enabling custom SMTP. Used on pages that trigger authentication emails.
//
// Analogy:
// A notice near a service counter (sign-up/password reset) informing about
// potential delays with standard mail (default SMTP) and pointing to info on
// a faster courier service (custom SMTP).

import { ArrowUpRight, InfoIcon } from "lucide-react";
import Link from "next/link";

export function SmtpMessage() {
  return (
    <div className="bg-muted/50 px-5 py-3 border rounded-md flex gap-4">
      <InfoIcon size={16} className="mt-0.5" />
      <div className="flex flex-col gap-1">
        <small className="text-sm text-secondary-foreground">
          <strong> Note:</strong> Emails are rate limited. Enable Custom SMTP to
          increase the rate limit.
        </small>
        <div>
          <Link
            href="https://supabase.com/docs/guides/auth/auth-smtp"
            target="_blank"
            className="text-primary/50 hover:text-primary flex items-center text-sm gap-1"
          >
            Learn more <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
