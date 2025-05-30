// components/ui/sonner.tsx
"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        // make each toast a white card with rounded corners & shadow,
        // matching your site’s cards
        classNames: {
          toast:
            "group bg-white text-black border border-gray-200 rounded-2xl shadow-md p-4 flex items-start gap-3",
          // title styling
          title: "font-medium text-base",
          // description styling
          description: "text-sm text-gray-600",
          // action button (e.g. Undo) in your primary brand color
          actionButton:
            "ml-auto bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-semibold hover:bg-primary/90",
          // cancel (close “×”) uses muted grey
          cancelButton:
            "text-gray-400 hover:text-gray-600",
        },
        // never auto-dismiss—stay until user closes it
        duration: Infinity,
        // show a close (×) button by default
        closeButton: true,
      }}
      {...props}
    />
  );
}