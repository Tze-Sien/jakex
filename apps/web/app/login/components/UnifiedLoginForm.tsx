"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface UnifiedLoginFormProps {
  onEmailLogin: (e: React.FormEvent, email: string, password: string) => void;
  onOAuthLogin: (provider: "facebook" | "google") => void;
  isLoading: boolean;
  loadingProvider: "facebook" | "google" | "email" | null;
}

export function UnifiedLoginForm({
  onEmailLogin,
  onOAuthLogin,
  isLoading,
  loadingProvider,
}: UnifiedLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEmailLogin(e, email, password);
  };

  return (
    <div className="space-y-6">
      {/* Email Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 lg:h-10 text-base lg:text-sm"
            autoComplete="email"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <a
              href="/forgot-password"
              className="text-xs text-primary hover:underline active:opacity-70 font-medium"
            >
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={isLoading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 lg:h-10 text-base lg:text-sm"
            autoComplete="current-password"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 lg:h-10 font-medium text-base lg:text-sm transition-all active:scale-[0.98]"
          disabled={isLoading}
        >
          {loadingProvider === "email" ? (
            <>
              <Spinner />
              <span className="ml-2">Signing in...</span>
            </>
          ) : (
            "Sign in with Email"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="space-y-3">
        {/* Google Button */}
        <Button
          onClick={() => onOAuthLogin("google")}
          disabled={isLoading}
          variant="outline"
          className="w-full h-12 lg:h-11 font-medium text-base lg:text-sm transition-all active:scale-[0.98]"
        >
          {loadingProvider === "google" ? (
            <Spinner />
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        {/* Facebook Button */}
        <Button
          onClick={() => onOAuthLogin("facebook")}
          disabled={isLoading}
          className="w-full h-12 lg:h-11 bg-[#1877F2] hover:bg-[#1664D8] active:bg-[#1664D8] text-white font-medium text-base lg:text-sm transition-all active:scale-[0.98]"
        >
          {loadingProvider === "facebook" ? (
            <Spinner />
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
