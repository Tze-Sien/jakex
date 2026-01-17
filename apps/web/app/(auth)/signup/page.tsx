"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUpWithEmail, signInWithGoogle } from "@repo/auth";
import { Button } from "@/components/ui/button";
import { UnifiedSignUpForm } from "./SignUpForm";
import { AnimatedBackground } from "../AnimatedBackground";
import { HeroSection } from "../HeroSection";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "email" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleOAuthLogin = async (provider: "google") => {
    setIsLoading(true);
    setLoadingProvider(provider);
    setError(null);

    try {
      const result = await signInWithGoogle();

      if (result.error) {
        setError(result.error.message);
        setIsLoading(false);
        setLoadingProvider(null);
        return;
      }

      // OAuth will handle redirect automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleEmailSignUp = async (
    e: React.FormEvent,
    data: { email: string; password: string; fullName: string }
  ) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingProvider("email");
    setError(null);

    try {
      const result = await signUpWithEmail(data.email, data.password, {
        data: {
          full_name: data.fullName,
        },
      });

      if (result.error) {
        setError(result.error.message);
        setIsLoading(false);
        setLoadingProvider(null);
        return;
      }

      // Check if email confirmation is required
      if (!result.data.session) {
        setSuccess(true);
        setIsLoading(false);
        setLoadingProvider(null);
      } else {
        // User is automatically signed in
        router.push("/authorize-meta");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold">Check your email</h2>
            <p className="text-muted-foreground">
              We&apos;ve sent you an email with a confirmation link. Please
              click the link to verify your account.
            </p>
          </div>
          <Button
            onClick={() => router.push("/login")}
            variant="outline"
            className="w-full"
          >
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block min-h-screen relative overflow-hidden bg-background">
        <AnimatedBackground />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <HeroSection />

            <div className="w-full max-w-md mx-auto">
              {/* Main Card */}
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-linear-to-r from-primary to-chart-2 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition duration-500" />

                {/* Card Content */}
                <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-foreground">
                        Create your account
                      </h3>
                      <p className="text-muted-foreground">
                        Get started with JakeX today
                      </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    {/* Unified Sign Up Form */}
                    <UnifiedSignUpForm
                      onEmailSignUp={handleEmailSignUp}
                      onOAuthLogin={handleOAuthLogin}
                      isLoading={isLoading}
                      loadingProvider={loadingProvider}
                    />

                    {/* Footer */}
                    <div className="text-center pt-2">
                      <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <a
                          href="/login"
                          className="text-primary hover:underline font-medium"
                        >
                          Sign in
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Links */}
              <div className="mt-6 text-center space-y-3">
                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <a href="/terms" className="text-primary hover:underline">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile App View */}
      <div className="lg:hidden min-h-screen bg-background flex flex-col">
        <div className="safe-area-top bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="px-6 py-4 flex items-center justify-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-primary to-chart-2">
              <svg
                className="w-6 h-6 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="ml-3 text-xl font-bold">JakeX</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex items-center">
          <div className="w-full px-6 py-8 space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-foreground">
                Create account
              </h2>
              <p className="text-muted-foreground text-base">
                Get started with JakeX today
              </p>
            </div>

            {/* Sign Up Form - Mobile Optimized */}
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Card */}
              <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-lg">
                <UnifiedSignUpForm
                  onEmailSignUp={handleEmailSignUp}
                  onOAuthLogin={handleOAuthLogin}
                  isLoading={isLoading}
                  loadingProvider={loadingProvider}
                />

                {/* Footer */}
                <div className="text-center pt-6">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <a
                      href="/login"
                      className="text-primary font-semibold active:opacity-70 transition-opacity"
                    >
                      Sign in
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="safe-area-bottom bg-background/95 backdrop-blur-md border-t border-border/50">
          <div className="px-6 py-4 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-primary font-medium">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-primary font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
