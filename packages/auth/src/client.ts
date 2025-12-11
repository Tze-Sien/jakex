import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Supabase client instance (initialized lazily)
let supabaseClient: SupabaseClient | null = null;

/**
 * Get the Supabase client instance.
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

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

/**
 * Create a new Supabase client with custom options.
 * Use this for server-side operations or when you need different config.
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string,
  options?: Parameters<typeof createClient>[2]
): SupabaseClient {
  return createClient(supabaseUrl, supabaseKey, options);
}

// Re-export types from Supabase
export type { SupabaseClient, Session, User } from "@supabase/supabase-js";
