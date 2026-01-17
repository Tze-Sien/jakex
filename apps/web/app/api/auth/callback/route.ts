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
  const type = searchParams.get("type");
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");

  console.log("[Auth Callback] Processing OAuth callback...");
  console.log("[Auth Callback] Origin:", origin);
  console.log("[Auth Callback] Code present:", !!code);
  console.log("[Auth Callback] Type:", type);
  console.log("[Auth Callback] Error:", error, errorCode, errorDescription);

  // Handle error responses from Supabase (e.g., expired OTP)
  if (error) {
    const errorParam = encodeURIComponent(errorDescription || error);
    if (type === "recovery") {
      // For password recovery errors, redirect to forgot-password with error message
      return NextResponse.redirect(`${origin}/forgot-password?error=${errorParam}`);
    }
    return NextResponse.redirect(`${origin}/login?error=${errorParam}`);
  }

  // For password recovery, redirect to reset password page
  let next = searchParams.get("next") ?? (type === "recovery" ? "/reset-password" : "/dashboard");

  // Security: Validate that next parameter starts with / to prevent open redirects
  if (!next.startsWith("/")) {
    next = type === "recovery" ? "/reset-password" : "/dashboard";
  }

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
