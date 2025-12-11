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
  signOut,
  getSession,
  getUser,
  onAuthStateChange,
  type OAuthProvider,
  type SignInOptions,
  type SignInResult,
} from "./providers";
