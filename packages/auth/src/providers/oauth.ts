import { getSupabaseClient } from "../client";
import { getBaseUrl } from "@repo/shared/url";
import type { AuthError, OAuthResponse } from "@supabase/supabase-js";

export type OAuthProvider = "google" | "github" | "twitter";

export interface SignInOptions {
  /** URL to redirect to after authentication */
  redirectTo?: string;
  /** Scopes to request from the provider */
  scopes?: string;
  /** Additional query parameters */
  queryParams?: Record<string, string>;
}

export interface SignInResult {
  data: OAuthResponse["data"];
  error: AuthError | null;
}

/**
 * Sign in with Google OAuth.
 * This will redirect the user to Google for authentication.
 */
export async function signInWithGoogle(
  options?: SignInOptions
): Promise<SignInResult> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: options?.redirectTo ?? `${getBaseUrl('OAuth')}/api/auth/callback`,
      scopes: options?.scopes,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
        ...options?.queryParams,
      },
    },
  });

  return { data, error };
}

/**
 * Generic OAuth sign in for any supported provider.
 */
export async function signInWithOAuth(
  provider: OAuthProvider,
  options?: SignInOptions
): Promise<SignInResult> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: options?.redirectTo ?? `${getBaseUrl('OAuth')}/api/auth/callback`,
      scopes: options?.scopes,
      queryParams: options?.queryParams,
    },
  });

  return { data, error };
}
