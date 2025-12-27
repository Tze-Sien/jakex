/**
 * Error simulation utilities for the mock META API
 * Simulates realistic API errors including rate limiting, server errors, and auth failures
 */

import { NextResponse } from 'next/server';

/**
 * META API Error Response structure
 */
export interface MetaAPIErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    error_user_title?: string;
    error_user_msg?: string;
    fbtrace_id: string;
  };
}

/**
 * Generate a random fbtrace_id for error responses
 */
function generateFbTraceId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let traceId = 'A';
  for (let i = 0; i < 11; i++) {
    traceId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return traceId;
}

/**
 * Create a rate limit error (HTTP 429)
 */
export function createRateLimitError(): NextResponse<MetaAPIErrorResponse> {
  return NextResponse.json(
    {
      error: {
        message: 'Application request limit reached',
        type: 'OAuthException',
        code: 4,
        error_subcode: 80004,
        error_user_title: 'Too Many Requests',
        error_user_msg: 'You have made too many API calls. Please wait before trying again.',
        fbtrace_id: generateFbTraceId()
      }
    },
    {
      status: 429,
      headers: {
        'Retry-After': '3600' // Suggest retry after 1 hour
      }
    }
  );
}

/**
 * Create a server error (HTTP 500)
 */
export function createServerError(): NextResponse<MetaAPIErrorResponse> {
  return NextResponse.json(
    {
      error: {
        message: 'An unknown error has occurred',
        type: 'OAuthException',
        code: 1,
        error_user_title: 'Server Error',
        error_user_msg: 'Something went wrong on our end. Please try again later.',
        fbtrace_id: generateFbTraceId()
      }
    },
    {
      status: 500
    }
  );
}

/**
 * Create an invalid token error (HTTP 401)
 */
export function createInvalidTokenError(): NextResponse<MetaAPIErrorResponse> {
  return NextResponse.json(
    {
      error: {
        message: 'Invalid OAuth 2.0 Access Token',
        type: 'OAuthException',
        code: 190,
        error_subcode: 463,
        error_user_title: 'Session Expired',
        error_user_msg: 'Your session has expired. Please log in again.',
        fbtrace_id: generateFbTraceId()
      }
    },
    {
      status: 401
    }
  );
}

/**
 * Create a permissions error (HTTP 403)
 */
export function createPermissionsError(): NextResponse<MetaAPIErrorResponse> {
  return NextResponse.json(
    {
      error: {
        message: 'Insufficient permissions to access this resource',
        type: 'OAuthException',
        code: 200,
        error_user_title: 'Insufficient Permissions',
        error_user_msg: 'You do not have permission to access this resource.',
        fbtrace_id: generateFbTraceId()
      }
    },
    {
      status: 403
    }
  );
}

/**
 * Error simulation configuration from environment variables
 */
export interface ErrorConfig {
  rateLimitRate: number;   // Percentage (0-100)
  serverErrorRate: number;  // Percentage (0-100)
  authErrorRate: number;    // Percentage (0-100)
}

/**
 * Get error simulation configuration from environment variables
 * Defaults: 10% rate limit, 5% server error, 2% auth error
 */
export function getErrorConfig(): ErrorConfig {
  return {
    rateLimitRate: Number(process.env.MOCK_RATE_LIMIT_RATE || '10'),
    serverErrorRate: Number(process.env.MOCK_SERVER_ERROR_RATE || '5'),
    authErrorRate: Number(process.env.MOCK_AUTH_ERROR_RATE || '2')
  };
}

/**
 * Simulate errors based on configured probabilities
 * Returns null if no error should be simulated
 */
export function simulateError(): NextResponse<MetaAPIErrorResponse> | null {
  const config = getErrorConfig();
  const random = Math.random() * 100;

  // Check for auth error first (rarest)
  if (random < config.authErrorRate) {
    console.log('[Mock Meta API] Simulating auth error');
    return createInvalidTokenError();
  }

  // Check for server error
  if (random < config.authErrorRate + config.serverErrorRate) {
    console.log('[Mock Meta API] Simulating server error');
    return createServerError();
  }

  // Check for rate limit error (most common)
  if (random < config.authErrorRate + config.serverErrorRate + config.rateLimitRate) {
    console.log('[Mock Meta API] Simulating rate limit error');
    return createRateLimitError();
  }

  // No error
  return null;
}

/**
 * Create a 404 Not Found error for unknown endpoints
 */
export function createNotFoundError(path: string): NextResponse<MetaAPIErrorResponse> {
  return NextResponse.json(
    {
      error: {
        message: `Unknown endpoint: ${path}`,
        type: 'OAuthException',
        code: 100,
        error_user_title: 'Endpoint Not Found',
        error_user_msg: 'The endpoint you requested was not found.',
        fbtrace_id: generateFbTraceId()
      }
    },
    {
      status: 404
    }
  );
}
