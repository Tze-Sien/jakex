/**
 * Application route constants
 * Use these constants throughout the app for type-safe routing
 */
export const ROUTES = {
  // Public routes
  HOME: "/",
  
  // Auth routes
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  
  // Protected routes
  DASHBOARD: "/dashboard",
  ANALYTICS: "/analytics",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  AUTHORIZE_META: "/authorize-meta",
  SELECT_ACCOUNT: "/select-account",
  
  // API routes
  API: {
    AUTH_CALLBACK: "/api/auth/callback",
    META_CALLBACK: "/api/auth/meta-callback",
  },
} as const;

/**
 * External link constants
 */
export const EXTERNAL_LINKS = {
  terms: "https://www.jakex.ai/terms",
  privacyPolicy: "https://www.jakex.ai/privacy-policy",
} as const;
