"use client";

import { useState } from "react";
import { resetPasswordForEmail } from "@repo/auth";
import { AnimatedBackground } from "../AnimatedBackground";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await resetPasswordForEmail(email);

      if (result.error) {
        setError(result.error.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block min-h-screen relative overflow-hidden bg-background">
        <AnimatedBackground />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md">
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
                      Reset your password
                    </h3>
                    <p className="text-muted-foreground">
                      Enter your email address and we&apos;ll send you a link to reset your password
                    </p>
                  </div>

                  {success ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Check your email! We&apos;ve sent you a password reset link.
                        </p>
                      </div>
                      <a
                        href="/login"
                        className="block text-center text-sm text-primary hover:underline"
                      >
                        Back to login
                      </a>
                    </div>
                  ) : (
                    <>
                      {/* Error Message */}
                      {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <p className="text-sm text-destructive">{error}</p>
                        </div>
                      )}

                      {/* Form */}
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="email"
                            className="text-sm font-medium text-foreground"
                          >
                            Email address
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            placeholder="you@example.com"
                            disabled={isLoading}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                        >
                          {isLoading ? "Sending..." : "Send reset link"}
                        </button>
                      </form>

                      {/* Footer */}
                      <div className="text-center pt-2">
                        <p className="text-sm text-muted-foreground">
                          Remember your password?{" "}
                          <a
                            href="/login"
                            className="text-primary hover:underline font-medium"
                          >
                            Sign in
                          </a>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile App View */}
      <div className="lg:hidden min-h-screen bg-background flex flex-col">
        {/* Top App Bar */}
        <div className="safe-area-top bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="px-6 py-4 flex items-center">
            <a
              href="/login"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </a>
            <h1 className="ml-3 text-xl font-bold">Reset Password</h1>
          </div>
        </div>

        {/* Scrollable Content Area - Centered */}
        <div className="flex-1 overflow-y-auto flex items-center">
          <div className="w-full px-6 py-8 space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-foreground">
                Reset your password
              </h2>
              <p className="text-muted-foreground text-base">
                Enter your email address and we&apos;ll send you a link to reset your password
              </p>
            </div>

            {/* Form - Mobile Optimized */}
            <div className="space-y-6">
              <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-lg">
                {success ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Check your email! We&apos;ve sent you a password reset link.
                      </p>
                    </div>
                    <a
                      href="/login"
                      className="block text-center text-sm text-primary font-semibold active:opacity-70 transition-opacity"
                    >
                      Back to login
                    </a>
                  </div>
                ) : (
                  <>
                    {/* Error Message */}
                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="email-mobile"
                          className="text-sm font-medium text-foreground"
                        >
                          Email address
                        </label>
                        <input
                          id="email-mobile"
                          name="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base"
                          placeholder="you@example.com"
                          disabled={isLoading}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 rounded-xl bg-primary active:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 text-base"
                      >
                        {isLoading ? "Sending..." : "Send reset link"}
                      </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center pt-6">
                      <p className="text-sm text-muted-foreground">
                        Remember your password?{" "}
                        <a
                          href="/login"
                          className="text-primary font-semibold active:opacity-70 transition-opacity"
                        >
                          Sign in
                        </a>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
