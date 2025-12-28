import { getSupabaseClient } from "./client";
import type { AuthError, OAuthResponse, User, Session } from "@supabase/supabase-js";

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

export interface EmailAuthResult {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: AuthError | null;
}

/**
 * Get the base URL for OAuth callbacks.
 * Prioritizes NEXT_PUBLIC_APP_URL env variable, falls back to window.location.origin.
 */
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
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
      redirectTo: options?.redirectTo ?? `${getBaseUrl()}/auth/callback`,
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
      redirectTo: options?.redirectTo ?? `${getBaseUrl()}/auth/callback`,
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
      redirectTo: options?.redirectTo ?? `${getBaseUrl()}/auth/callback`,
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

/**
 * Sign up a new user with email and password.
 * By default, the user needs to verify their email before signing in.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  options?: {
    emailRedirectTo?: string;
    data?: Record<string, unknown>;
  }
): Promise<EmailAuthResult> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: options?.emailRedirectTo ?? `${getBaseUrl()}/auth/callback`,
      data: options?.data,
    },
  });

  return {
    data: {
      user: data.user,
      session: data.session,
    },
    error,
  };
}

/**
 * Sign in an existing user with email and password.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<EmailAuthResult> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    data: {
      user: data.user,
      session: data.session,
    },
    error,
  };
}

/**
 * Send a password reset email.
 */
export async function resetPasswordForEmail(
  email: string,
  options?: {
    redirectTo?: string;
  }
): Promise<{ error: AuthError | null }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: options?.redirectTo ?? `${getBaseUrl()}/auth/callback?type=recovery`,
  });

  return { error };
}

/**
 * Update the user's password.
 * User must be logged in.
 */
export async function updatePassword(
  newPassword: string
): Promise<{ error: AuthError | null }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { error };
}
