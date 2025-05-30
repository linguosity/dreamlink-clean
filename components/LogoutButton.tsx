// components/LogoutButton.tsx
//
// Technical explanation:
// Client component that renders a "Logout" button within a form. Submitting
// the form triggers the `signOutAction` server action to log the user out.
//
// Analogy:
// The "Exit" or "Sign Out" button. Clicking it signals your departure to the
// system, which then processes your logout.

"use client";

import { signOutAction } from "@/app/actions";

export default function LogoutButton() {
  return (
    <form action={signOutAction}>
      <button 
        type="submit" 
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </form>
  );
}