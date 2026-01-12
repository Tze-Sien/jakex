"use client";

import { useState } from "react";
import { signInWithEmail, signInWithGoogle } from "@repo/auth";
import {
  AnimatedBackground,
  HeroSection,
} from "./components";
import { UnifiedLoginForm } from "./components/UnifiedLoginForm";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "email" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

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
      // If we reach here, the OAuth popup/redirect should have already happened
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent, email?: string, password?: string) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingProvider("email");
    setError(null);

    // Get form data if not passed as parameters
    if (!email || !password) {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      email = formData.get("email") as string;
      password = formData.get("password") as string;
    }

    try {
      const result = await signInWithEmail(email, password);

      if (result.error) {
        setError(result.error.message);
        setIsLoading(false);
        setLoadingProvider(null);
        return;
      }

      // Successfully signed in - force a full page reload to ensure cookies are set
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

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
                        Welcome back
                      </h3>
                      <p className="text-muted-foreground">
                        Sign in to access your dashboard
                      </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    {/* Unified Login Form */}
                    <UnifiedLoginForm
                      onEmailLogin={handleEmailLogin}
                      onOAuthLogin={handleOAuthLogin}
                      isLoading={isLoading}
                      loadingProvider={loadingProvider}
                    />

                    {/* Footer */}
                    <div className="text-center pt-2">
                      <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <a
                          href="/signup"
                          className="text-primary hover:underline font-medium"
                        >
                          Sign up
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
        {/* Top App Bar */}
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

        {/* Scrollable Content Area - Centered */}
        <div className="flex-1 overflow-y-auto flex items-center">
          <div className="w-full px-6 py-8 space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-foreground">
                Welcome back
              </h2>
              <p className="text-muted-foreground text-base">
                Sign in to continue to your account
              </p>
            </div>

            {/* Login Form - Mobile Optimized */}
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Card */}
              <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-lg">
                <UnifiedLoginForm
                  onEmailLogin={handleEmailLogin}
                  onOAuthLogin={handleOAuthLogin}
                  isLoading={isLoading}
                  loadingProvider={loadingProvider}
                />

                {/* Footer */}
                <div className="text-center pt-6">
                  <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <a
                      href="/signup"
                      className="text-primary font-semibold active:opacity-70 transition-opacity"
                    >
                      Sign up
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Safe Area with Footer */}
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
