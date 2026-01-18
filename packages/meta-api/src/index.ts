/**
 * @repo/meta-api - Meta Ads API client and utilities
 *
 * This package provides:
 * - Meta Ads API client
 * - OAuth authentication flow for Meta
 */

// Export types
export * from './types';

// Export Meta API client
export { MetaAdsClient } from './client';


// Export rate limiter and retry utilities
export { MetaApiRateLimiter, getRateLimiter, clearRateLimiter, clearAllRateLimiters } from './rate-limiter';
export { withRetry, Retry, RetryError, type RetryConfig } from './retry';

// Export OAuth authentication
export {
  // Config
  getMetaOAuthConfig,
  META_OAUTH_VERSION,
  META_OAUTH_BASE_URL,
  META_GRAPH_API_URL,
  type MetaOAuthConfig,
  generateRandomState,
} from './oauth/config';

export {
  // Flow
  getMetaAuthUrl,
  initiateMetaOAuth,
  verifyOAuthState,
} from './oauth/flow';

export {
  // Tokens
  exchangeCodeForToken,
  getLongLivedToken,
  validateMetaToken,
  getMetaUserInfo,
  type MetaTokenResponse,
  type MetaUserInfo,
} from './oauth/tokens';
