import { NextResponse } from "next/server";
import { createOrUpdateMetaConnection, getUserSelectedAdAccount } from "@/lib/actions/meta";
import { getServerUser } from "@repo/auth/server";
import { exchangeCodeForToken, getLongLivedToken, getMetaUserInfo } from "@repo/meta-api";
import { ROUTES } from "@/lib/constants";

// Get the base URL for redirects - use env var or fall back to request origin
function getBaseUrl(requestOrigin: string): string {
  return process.env.NEXT_PUBLIC_APP_URL || requestOrigin;
}

/**
 * Meta OAuth Callback Handler
 * This endpoint handles the OAuth callback from Facebook/Meta
 * and exchanges the authorization code for an access token
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const baseUrl = getBaseUrl(requestUrl.origin);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Handle OAuth errors from Meta
  if (error) {
    console.error("Meta OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(
        `${ROUTES.AUTHORIZE_META}?error=${encodeURIComponent(errorDescription || error)}`,
        baseUrl
      )
    );
  }

  // Validate that we received a code
  if (!code) {
    console.error("No authorization code received from Meta");
    return NextResponse.redirect(
      new URL(`${ROUTES.AUTHORIZE_META}?error=no_code`, baseUrl)
    );
  }

  try {
    // Get the current authenticated user (from Supabase session)
    const user = await getServerUser();

    if (!user) {
      console.error("User not authenticated");
      return NextResponse.redirect(
        new URL(`${ROUTES.LOGIN}?error=not_authenticated&next=${ROUTES.AUTHORIZE_META}`, baseUrl)
      );
    }

    // Exchange code for access token (server-side only)
    const tokenResponse = await exchangeCodeForToken(code);

    if (!tokenResponse.access_token) {
      throw new Error("No access token received from Meta");
    }

    // Get long-lived token (60 days instead of short-lived)
    const longLivedTokenResponse = await getLongLivedToken(
      tokenResponse.access_token
    );

    const accessToken = longLivedTokenResponse.access_token || tokenResponse.access_token;

    // Get Meta user information (only ID will be available without email/public_profile scopes)
    const metaUserInfo = await getMetaUserInfo(accessToken);

    // Store Meta connection in database
    await createOrUpdateMetaConnection({
      userId: user.id,
      metaUserId: metaUserInfo.id,
      metaUserName: metaUserInfo.name || undefined, // Optional: may be undefined
      metaEmail: metaUserInfo.email || undefined,   // Optional: may be undefined
      accessToken: accessToken,
      grantedScopes: [
        "ads_read",
        "ads_management",
        "business_management",
      ],
    });

    // Check if user already has selected accounts
    const selectedAccountResult = await getUserSelectedAdAccount(user.id);

    // If user already has selected accounts, redirect to dashboard
    // Otherwise, redirect to account selection page
    const redirectPath = selectedAccountResult.success && selectedAccountResult.selectedAccountId
      ? ROUTES.DASHBOARD
      : ROUTES.SELECT_ACCOUNT;

    return NextResponse.redirect(new URL(redirectPath, baseUrl));
  } catch (error) {
    console.error("Error processing Meta OAuth callback:", error);
    return NextResponse.redirect(
      new URL(
        `${ROUTES.AUTHORIZE_META}?error=${encodeURIComponent(
          error instanceof Error ? error.message : "Unknown error"
        )}`,
        baseUrl
      )
    );
  }
}

