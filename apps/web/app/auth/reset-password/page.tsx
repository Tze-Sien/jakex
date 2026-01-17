"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * This page handles the Supabase password reset redirect.
 * It extracts the code from the URL and redirects to the API callback
 * which will exchange the code for a session and redirect to /reset-password.
 */
export default function AuthResetPasswordRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      // Redirect to the callback route with the code and type=recovery
      router.replace(`/api/auth/callback?code=${code}&type=recovery`);
    } else {
      // No code present, redirect to forgot-password
      router.replace("/forgot-password?error=missing_code");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="text-muted-foreground">Processing password reset...</p>
      </div>
    </div>
  );
}
