import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin));
      }

      // If this is a password recovery flow, redirect to reset password page
      if (type === "recovery") {
        return NextResponse.redirect(new URL("/reset-password", requestUrl.origin));
      }

      // Successfully authenticated, redirect to the next page
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch (error) {
      console.error("Unexpected error during auth callback:", error);
      return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin));
    }
  }

  // No code present, redirect to login
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
