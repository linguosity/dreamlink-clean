"use client";

import { Button } from "@/components/ui/button";
import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
  isLoading?: boolean;
};

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  isLoading,
  ...props
}: Props) {
  const { pending } = useFormStatus();
  const loading = isLoading ?? pending;

  return (
    <Button type="submit" aria-disabled={loading} {...props}>
      {loading ? pendingText : children}
    </Button>
  );
}