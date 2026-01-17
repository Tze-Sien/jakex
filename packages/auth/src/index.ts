// Re-export client utilities
export {
  getSupabaseClient,
  createSupabaseClient,
  type SupabaseClient,
  type Session,
  type User,
} from "./client";

// Re-export OAuth authentication
export {
  signInWithGoogle,
  signInWithOAuth,
  type OAuthProvider,
  type SignInOptions,
  type SignInResult,
} from "./providers/oauth";

// Re-export Email/Password authentication
export {
  signUpWithEmail,
  signInWithEmail,
  resetPasswordForEmail,
  updatePassword,
  type EmailAuthResult,
} from "./providers/email";

// Re-export Session management
export {
  signOut,
  getSession,
  getUser,
  onAuthStateChange,
} from "./providers/session";

// Server utilities are available via @repo/auth/server
// Do not import from the main package to avoid bundling server-only code in client bundles

// NOTE: Meta OAuth utilities have been moved to @repo/meta-api
// Import them from there: import { initiateMetaOAuth, getMetaAuthUrl, etc. } from "@repo/meta-api"
