"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSupabaseClient } from "./client";
import type { User, Session } from "@supabase/supabase-js";

/**
 * Hook to get the current authenticated user in Client Components.
 *
 * Features:
 * - Automatically updates when auth state changes
 * - Returns loading state for initial fetch
 * - Returns error if auth check fails
 *
 * Usage:
 * ```tsx
 * 'use client';
 * import { useAuth } from "@repo/auth/hooks";
 *
 * export function MyComponent() {
 *   const { user, session, loading } = useAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Not authenticated</div>;
 *
 *   return <div>Hello {user.email}</div>;
 * }
 * ```
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading, error };
}

/**
 * Hook that redirects to login if user is not authenticated.
 * Use this in Client Components that require authentication.
 *
 * Usage:
 * ```tsx
 * 'use client';
 * import { useRequireAuth } from "@repo/auth/hooks";
 *
 * export function ProtectedComponent() {
 *   const { user, loading } = useRequireAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   // User is guaranteed to be authenticated here
 *   return <div>Hello {user.email}</div>;
 * }
 * ```
 */
export function useRequireAuth() {
  const { user, session, loading, error } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login with return URL
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname || "/")}`;
      router.push(redirectUrl);
    }
  }, [user, loading, router, pathname]);

  return { user, session, loading, error };
}

/**
 * Hook that redirects authenticated users away from auth pages.
 * Use this on login/signup pages to prevent authenticated users from accessing them.
 *
 * Usage:
 * ```tsx
 * 'use client';
 * import { useRedirectIfAuthenticated } from "@repo/auth/hooks";
 *
 * export function LoginPage() {
 *   const { loading } = useRedirectIfAuthenticated();
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return <div>Login form...</div>;
 * }
 * ```
 */
export function useRedirectIfAuthenticated(redirectTo: string = "/dashboard") {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { loading };
}
