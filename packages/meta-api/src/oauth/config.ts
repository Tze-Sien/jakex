/**
 * Meta OAuth Configuration
 * Handles OAuth configuration from environment variables
 */

import { getBaseUrl } from '@repo/shared/url';

export const META_OAUTH_VERSION = 'v22.0'; // Updated to latest version (2025)
export const META_OAUTH_BASE_URL = 'https://www.facebook.com'; // Official Facebook OAuth URL
export const META_GRAPH_API_URL = 'https://graph.facebook.com'; // Official Graph API URL

export interface MetaOAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  scopes?: string[];
}

/**
 * Get the Meta OAuth configuration from environment variables
 */
export function getMetaOAuthConfig(): MetaOAuthConfig {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const baseUrl = getBaseUrl('Meta OAuth');

  console.log('[Meta OAuth] Using base URL:', baseUrl);

  if (!appId) {
    throw new Error('NEXT_PUBLIC_META_APP_ID is not set in environment variables');
  }

  if (!appSecret && typeof window === 'undefined') {
    // Only throw on server-side (appSecret is server-only)
    throw new Error('META_APP_SECRET is not set in environment variables');
  }

  return {
    appId,
    appSecret: appSecret || '',
    redirectUri: `${baseUrl}/api/auth/meta-callback`,
    scopes: [
      'ads_read',
      'ads_management',
      'business_management'
    ]
  };
}

/**
 * Generate a random state parameter for OAuth security
 */
export function generateRandomState(): string {
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Server-side fallback
    const crypto = require('crypto');
    crypto.randomFillSync(array);
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
