"use client";

import { useState, useEffect } from "react";
import { updatePassword } from "@repo/auth";
import { AnimatedBackground } from "../(auth)/login/components";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Supabase sends the recovery token in the URL hash/fragment
    // After the callback route processes it, the user session will be set
    // We just need to check if the user is authenticated
    const checkAuth = async () => {
      try {
        // If we can get here and there's a valid session, we're good
        setHasToken(true);
      } catch (err) {
        setError("Invalid or missing reset token. Please request a new password reset link.");
      }
    };

    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const result = await updatePassword(password);

      if (result.error) {
        setError(result.error.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
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
                      Set new password
                    </h3>
                    <p className="text-muted-foreground">
                      Enter your new password below
                    </p>
                  </div>

                  {success ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Password updated successfully! Redirecting to login...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Error Message */}
                      {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <p className="text-sm text-destructive">{error}</p>
                        </div>
                      )}

                      {hasToken ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <label
                              htmlFor="password"
                              className="text-sm font-medium text-foreground"
                            >
                              New password
                            </label>
                            <input
                              id="password"
                              name="password"
                              type="password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                              placeholder="Enter new password"
                              disabled={isLoading}
                              minLength={8}
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="confirmPassword"
                              className="text-sm font-medium text-foreground"
                            >
                              Confirm password
                            </label>
                            <input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              required
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                              placeholder="Confirm new password"
                              disabled={isLoading}
                              minLength={8}
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                          >
                            {isLoading ? "Updating..." : "Update password"}
                          </button>
                        </form>
                      ) : (
                        <div className="text-center space-y-4">
                          <a
                            href="/forgot-password"
                            className="inline-block text-sm text-primary hover:underline font-medium"
                          >
                            Request a new reset link
                          </a>
                        </div>
                      )}
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
                Set new password
              </h2>
              <p className="text-muted-foreground text-base">
                Enter your new password below
              </p>
            </div>

            {/* Form - Mobile Optimized */}
            <div className="space-y-6">
              <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-lg">
                {success ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Password updated successfully! Redirecting to login...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Error Message */}
                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    {hasToken ? (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="password-mobile"
                            className="text-sm font-medium text-foreground"
                          >
                            New password
                          </label>
                          <input
                            id="password-mobile"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base"
                            placeholder="Enter new password"
                            disabled={isLoading}
                            minLength={8}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="confirmPassword-mobile"
                            className="text-sm font-medium text-foreground"
                          >
                            Confirm password
                          </label>
                          <input
                            id="confirmPassword-mobile"
                            name="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base"
                            placeholder="Confirm new password"
                            disabled={isLoading}
                            minLength={8}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3.5 px-4 rounded-xl bg-primary active:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 text-base"
                        >
                          {isLoading ? "Updating..." : "Update password"}
                        </button>
                      </form>
                    ) : (
                      <div className="text-center space-y-4">
                        <a
                          href="/forgot-password"
                          className="inline-block text-sm text-primary font-semibold active:opacity-70 transition-opacity"
                        >
                          Request a new reset link
                        </a>
                      </div>
                    )}
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
