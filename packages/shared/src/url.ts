/**
 * Shared URL utilities for the entire monorepo
 * Used by auth, meta-api, and other packages that need base URL resolution
 */

/**
 * Get the environment URL from environment variables or window context.
 * Works in both browser and server environments.
 */
function getEnvUrl(): string | null {
  // Try environment variable first (works for both client and server)
  if (typeof window !== 'undefined') {
    // @ts-ignore - injected by Next.js webpack
    const envUrl = window.__NEXT_PUBLIC_APP_URL__ || process.env.NEXT_PUBLIC_APP_URL;
    if (envUrl && envUrl.trim() !== '') {
      return envUrl;
    }
  } else if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  return null;
}

/**
 * Get the base URL for the application.
 * Dynamically determines the URL based on environment and context.
 *
 * Priority:
 * 1. Environment variable (NEXT_PUBLIC_APP_URL) - for production/staging
 * 2. Current window origin (client-side) - automatically adapts to any domain
 *
 * @param context - Optional context string for logging (e.g., 'OAuth', 'API', 'Webhooks')
 * @throws {Error} If called from SSR without NEXT_PUBLIC_APP_URL set
 *
 * @example
 * ```ts
 * // In OAuth callback
 * const redirectUrl = `${getBaseUrl('OAuth')}/auth/callback`;
 *
 * // In API calls
 * const apiUrl = `${getBaseUrl('API')}/api/webhook`;
 * ```
 */
export function getBaseUrl(context: string = 'App'): string {
  // Try environment variable first
  const envUrl = getEnvUrl();
  if (envUrl && envUrl.trim() !== '') {
    console.log(`[${context}] Using NEXT_PUBLIC_APP_URL:`, envUrl);
    return envUrl;
  }

  // Use current window origin (client-side)
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log(`[${context}] Using window.location.origin:`, origin);
    return origin;
  }

  // SSR without environment variable - throw error
  throw new Error(
    `${context} base URL cannot be determined. ` +
    'Please set NEXT_PUBLIC_APP_URL environment variable or call this function from a client component.'
  );
}
