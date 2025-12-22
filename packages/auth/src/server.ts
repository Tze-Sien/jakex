import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for Server Components (App Router).
 * This client uses cookies for session management.
 *
 * Usage in Server Components:
 * ```tsx
 * import { createServerSupabaseClient } from "@repo/auth/server";
 *
 * export default async function Page() {
 *   const supabase = await createServerSupabaseClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *   // ...
 * }
 * ```
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client for Route Handlers (API routes).
 * This version is designed for use in route handlers where cookies can be set.
 *
 * Usage in Route Handlers:
 * ```tsx
 * import { createRouteHandlerClient } from "@repo/auth/server";
 *
 * export async function GET(request: Request) {
 *   const supabase = await createRouteHandlerClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *   // ...
 * }
 * ```
 */
export async function createRouteHandlerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

/**
 * Gets the current session from the server.
 * Cached to prevent multiple database calls during a single request.
 *
 * @returns The current session or null if not authenticated
 */
export const getServerSession = cache(async () => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
});

/**
 * Gets the current user from the server.
 * Cached to prevent multiple database calls during a single request.
 *
 * @returns The current user or null if not authenticated
 */
export const getServerUser = cache(async () => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Requires authentication for Server Components.
 * Throws an error if the user is not authenticated.
 *
 * Usage:
 * ```tsx
 * import { requireAuth } from "@repo/auth/server";
 *
 * export default async function ProtectedPage() {
 *   const user = await requireAuth();
 *   // user is guaranteed to be non-null here
 * }
 * ```
 *
 * @throws {Error} If user is not authenticated
 */
export async function requireAuth() {
  const user = await getServerUser();
  if (!user) {
    throw new Error("Unauthorized - Authentication required");
  }
  return user;
}

// Re-export types
export type { User, Session } from "@supabase/supabase-js";
