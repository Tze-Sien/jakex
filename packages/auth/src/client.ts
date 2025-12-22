import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Supabase client instance (initialized lazily)
let supabaseClient: SupabaseClient | null = null;

/**
 * Get the Supabase client instance for browser/client components.
 * Uses @supabase/ssr's createBrowserClient which automatically handles cookies.
 * Creates a new client if one doesn't exist.
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set"
    );
  }

  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

/**
 * Create a new Supabase browser client with custom options.
 * Use this when you need a fresh client instance with different config.
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string
): SupabaseClient {
  return createBrowserClient(supabaseUrl, supabaseKey);
}

// Re-export types from Supabase
export type { SupabaseClient, Session, User } from "@supabase/supabase-js";
