/**
 * Meta OAuth Token Operations
 * Handles token exchange, validation, and long-lived token generation
 */

import { getMetaOAuthConfig, META_GRAPH_API_URL, META_OAUTH_VERSION } from './config';

export interface MetaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface MetaUserInfo {
  id: string;
  name?: string;
  email?: string;
}

/**
 * Exchange authorization code for access token
 * This must be called from the server-side only (uses app secret)
 */
export async function exchangeCodeForToken(code: string): Promise<MetaTokenResponse> {
  const config = getMetaOAuthConfig();

  const params = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    redirect_uri: config.redirectUri,
    code: code,
  });

  const response = await fetch(
    `${META_GRAPH_API_URL}/${META_OAUTH_VERSION}/oauth/access_token?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  const data = await response.json();
  return data as MetaTokenResponse;
}

/**
 * Exchange short-lived token for long-lived token (60 days)
 */
export async function getLongLivedToken(shortLivedToken: string): Promise<MetaTokenResponse> {
  const config = getMetaOAuthConfig();

  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const response = await fetch(
    `${META_GRAPH_API_URL}/${META_OAUTH_VERSION}/oauth/access_token?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get long-lived token: ${error}`);
  }

  const data = await response.json();
  return data as MetaTokenResponse;
}

/**
 * Validate Meta access token
 */
export async function validateMetaToken(accessToken: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      input_token: accessToken,
      access_token: accessToken, // Can use the same token for validation
    });

    const response = await fetch(
      `${META_GRAPH_API_URL}/${META_OAUTH_VERSION}/debug_token?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data?.data?.is_valid === true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * Get Meta user information using access token
 */
export async function getMetaUserInfo(accessToken: string): Promise<MetaUserInfo> {
  const params = new URLSearchParams({
    fields: 'id,name,email',
    access_token: accessToken,
  });

  const response = await fetch(
    `${META_GRAPH_API_URL}/${META_OAUTH_VERSION}/me?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get user info: ${error}`);
  }

  const data = await response.json();
  return data as MetaUserInfo;
}
