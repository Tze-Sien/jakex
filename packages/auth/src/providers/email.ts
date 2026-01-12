import { getSupabaseClient } from "../client";
import { getBaseUrl } from "@repo/shared/url";
import type { AuthError, User, Session } from "@supabase/supabase-js";

export interface EmailAuthResult {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: AuthError | null;
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
      emailRedirectTo: options?.emailRedirectTo ?? `${getBaseUrl('OAuth')}/auth/callback`,
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
    redirectTo: options?.redirectTo ?? `${getBaseUrl('OAuth')}/auth/callback?type=recovery`,
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
