import { getSupabaseClient } from "./client";
import type { AuthError, OAuthResponse } from "@supabase/supabase-js";

export type OAuthProvider = "facebook" | "google" | "github" | "twitter";

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
 * Sign in with Facebook OAuth.
 * This will redirect the user to Facebook for authentication.
 */
export async function signInWithFacebook(
  options?: SignInOptions
): Promise<SignInResult> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      redirectTo: options?.redirectTo ?? `${window.location.origin}/auth/callback`,
      scopes: options?.scopes ?? "email,public_profile",
      queryParams: options?.queryParams,
    },
  });

  return { data, error };
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
      redirectTo: options?.redirectTo ?? `${window.location.origin}/auth/callback`,
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
      redirectTo: options?.redirectTo ?? `${window.location.origin}/auth/callback`,
      scopes: options?.scopes,
      queryParams: options?.queryParams,
    },
  });

  return { data, error };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the current session.
 */
export async function getSession() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

/**
 * Get the current user.
 */
export async function getUser() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

/**
 * Listen to auth state changes.
 */
export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  const supabase = getSupabaseClient();
  return supabase.auth.onAuthStateChange(callback);
}
