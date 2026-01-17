import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

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
export async function getServerSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Gets the current user from the server.
 * Cached to prevent multiple database calls during a single request.
 *
 * @returns The current user or null if not authenticated
 */
export async function getServerUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

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

/**
 * Authentication guard for server actions (Data Access Layer).
 * Returns user or error object instead of throwing - suitable for server actions.
 *
 * Usage:
 * ```tsx
 * "use server";
 * import { withAuth } from "@repo/auth/server";
 *
 * export async function myServerAction() {
 *   const auth = await withAuth();
 *   if (!auth.success) {
 *     return { success: false, error: auth.error };
 *   }
 *   const { user } = auth;
 *   // user is guaranteed to be non-null here
 * }
 * ```
 */
export async function withAuth(): Promise<
  | { success: true; user: User }
  | { success: false; error: string }
> {
  const user = await getServerUser();
  if (!user) {
    return { success: false, error: "Unauthorized - Authentication required" };
  }
  return { success: true, user };
}

/**
 * Creates a Supabase Admin client with service role privileges.
 * IMPORTANT: Only use this for admin operations like deleting users.
 * Never expose this client or its operations to the frontend.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable.
 *
 * Usage:
 * ```tsx
 * import { createAdminSupabaseClient } from "@repo/auth/server";
 *
 * // Delete a user from Supabase Auth
 * const adminClient = createAdminSupabaseClient();
 * await adminClient.auth.admin.deleteUser(userId);
 * ```
 */
export function createAdminSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
        "This is required for admin operations like deleting users."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Re-export types
export type { User, Session } from "@supabase/supabase-js";
