// Re-export client utilities
export {
  getSupabaseClient,
  createSupabaseClient,
  type SupabaseClient,
  type Session,
  type User,
} from "./client";

// Re-export OAuth providers and auth functions
export {
  signInWithFacebook,
  signInWithGoogle,
  signInWithOAuth,
  signUpWithEmail,
  signInWithEmail,
  resetPasswordForEmail,
  updatePassword,
  signOut,
  getSession,
  getUser,
  onAuthStateChange,
  type OAuthProvider,
  type SignInOptions,
  type SignInResult,
  type EmailAuthResult,
} from "./providers";

// Re-export hooks for Client Components
export { useAuth, useRequireAuth, useRedirectIfAuthenticated } from "./hooks";

// Re-export Auth Provider
export { AuthProvider, useAuthContext } from "./AuthProvider";

// Re-export server utilities for Server Components
export {
  createServerSupabaseClient,
  createRouteHandlerClient,
  getServerSession,
  getServerUser,
  requireAuth,
} from "./server";
