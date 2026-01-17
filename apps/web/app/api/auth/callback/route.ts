import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@repo/auth/server";

/**
 * OAuth Callback Route Handler
 *
 * This route handles the OAuth callback from providers like Google.
 * It exchanges the authorization code for a session and redirects the user.
 *
 * Official Supabase pattern for Next.js App Router:
 * https://supabase.com/docs/guides/auth/social-login/auth-google
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/dashboard";

  // Security: Validate that next parameter starts with / to prevent open redirects
  if (!next.startsWith("/")) {
    next = "/dashboard";
  }

  console.log("[Auth Callback] Processing OAuth callback...");
  console.log("[Auth Callback] Origin:", origin);
  console.log("[Auth Callback] Code present:", !!code);
  console.log("[Auth Callback] Next redirect:", next);

  if (code) {
    const supabase = await createRouteHandlerClient();

    console.log("[Auth Callback] Exchanging code for session...");
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.log("[Auth Callback] Successfully authenticated user");

      // Determine the correct redirect URL
      // Priority: NEXT_PUBLIC_APP_URL > x-forwarded-host > origin
      let redirectBase: string;

      if (process.env.NEXT_PUBLIC_APP_URL) {
        // Use configured app URL (for ngrok, production, etc.)
        redirectBase = process.env.NEXT_PUBLIC_APP_URL;
        console.log("[Auth Callback] Using NEXT_PUBLIC_APP_URL:", redirectBase);
      } else {
        const forwardedHost = request.headers.get("x-forwarded-host");
        if (forwardedHost) {
          redirectBase = `https://${forwardedHost}`;
          console.log("[Auth Callback] Using x-forwarded-host:", redirectBase);
        } else {
          redirectBase = origin;
          console.log("[Auth Callback] Using origin:", redirectBase);
        }
      }

      return NextResponse.redirect(`${redirectBase}${next}`);
    }

    console.error("[Auth Callback] Error exchanging code:", error);
  }

  // Return to login with error if anything went wrong
  console.error("[Auth Callback] Auth code error - redirecting to login");
  return NextResponse.redirect(`${origin}/login?error=auth_code_error`);
}
