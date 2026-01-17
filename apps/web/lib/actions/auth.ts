"use server";

/**
 * Server action to get the Meta OAuth URL
 * This avoids importing the full meta-api package on the client
 */
export async function getMetaOAuthUrl() {
  const { getMetaAuthUrl, generateRandomState } = await import("@repo/meta-api");

  const state = generateRandomState();
  const authUrl = getMetaAuthUrl(state);

  return { authUrl, state };
}
