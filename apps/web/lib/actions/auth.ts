"use server";

/**
 * Server action to get the Meta OAuth URL
 * This avoids importing the full meta-api package on the client
 * @param redirectTo - Optional URL to redirect to after OAuth completes
 */
export async function getMetaOAuthUrl(redirectTo?: string) {
  const { getMetaAuthUrl, generateRandomState } = await import("@repo/meta-api");

  const randomState = generateRandomState();

  // Encode redirect URL in state if provided
  const state = redirectTo
    ? JSON.stringify({ s: randomState, r: redirectTo })
    : randomState;

  const authUrl = getMetaAuthUrl(state);

  return { authUrl, state };
}
