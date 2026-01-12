/**
 * Meta OAuth Flow
 * Handles OAuth flow initiation and state verification
 */

import { getMetaOAuthConfig, generateRandomState, META_OAUTH_BASE_URL, META_OAUTH_VERSION } from './config';

/**
 * Generate the Meta OAuth authorization URL
 * This is where users will be redirected to grant permissions
 */
export function getMetaAuthUrl(state?: string): string {
  const config = getMetaOAuthConfig();

  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    scope: config.scopes?.join(',') || '',
    response_type: 'code',
    state: state || generateRandomState(),
  });

  return `${META_OAUTH_BASE_URL}/${META_OAUTH_VERSION}/dialog/oauth?${params.toString()}`;
}

/**
 * Client-side: Initiate Meta OAuth flow
 * Redirects user to Facebook authorization page
 */
export function initiateMetaOAuth(): void {
  if (typeof window === 'undefined') {
    throw new Error('initiateMetaOAuth can only be called on the client side');
  }

  const state = generateRandomState();

  // Store state in sessionStorage for verification after redirect
  sessionStorage.setItem('meta_oauth_state', state);

  const authUrl = getMetaAuthUrl(state);
  window.location.href = authUrl;
}

/**
 * Verify OAuth state parameter matches what we stored
 */
export function verifyOAuthState(receivedState: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const storedState = sessionStorage.getItem('meta_oauth_state');
  sessionStorage.removeItem('meta_oauth_state'); // Clean up

  return storedState === receivedState;
}
