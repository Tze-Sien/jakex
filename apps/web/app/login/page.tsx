"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AnimatedBackground,
  HeroSection,
  LoginCard,
} from "./components";

type AuthMethod = "oauth" | "email";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<
    "facebook" | "google" | "email" | null
  >(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod>("oauth");
  const router = useRouter();

  const handleOAuthLogin = async (provider: "facebook" | "google") => {
    setIsLoading(true);
    setLoadingProvider(provider);
    // Simulate login process
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingProvider("email");
    // Simulate login process
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
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
              <LoginCard
                authMethod={authMethod}
                isLoading={isLoading}
                loadingProvider={loadingProvider}
                onOAuthLogin={handleOAuthLogin}
                onEmailLogin={handleEmailLogin}
                onSwitchAuthMethod={setAuthMethod}
              />

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
              <LoginCard
                authMethod={authMethod}
                isLoading={isLoading}
                loadingProvider={loadingProvider}
                onOAuthLogin={handleOAuthLogin}
                onEmailLogin={handleEmailLogin}
                onSwitchAuthMethod={setAuthMethod}
              />
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
