// utils/supabase/client.ts
//
// Technical explanation:
// Utility for creating and managing the Supabase client instance for
// client-side interactions. It uses a singleton pattern to ensure that only one
// instance of the Supabase client is created and reused throughout the
// application on the browser. This is crucial for efficient resource management
// and consistent state.
//
// Analogy:
// This is like the main telephone line for the "Dreamlink house" (the browser)
// that connects directly to the Supabase database service. The singleton pattern
// ensures there's only one main line installed, preventing multiple messy
// connections and ensuring all communication goes through a single, reliable
// point.

import { createBrowserClient } from "@supabase/ssr";

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  // Reuse existing client if available (singleton pattern)
  if (clientInstance) return clientInstance;
  
  // Create new client if it doesn't exist
  clientInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  
  return clientInstance;
};
