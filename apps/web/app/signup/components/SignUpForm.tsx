"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface SignUpFormProps {
  onSubmit: (e: React.FormEvent, data: { email: string; password: string; fullName: string }) => Promise<void>;
  onSwitchToOAuth: () => void;
  isLoading: boolean;
}

export function SignUpForm({
  onSubmit,
  onSwitchToOAuth,
  isLoading,
}: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    await onSubmit(e, { email, password, fullName });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Full Name Field */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium">
          Full Name
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          required
          disabled={isLoading}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-12 lg:h-10 text-base lg:text-sm"
          autoComplete="name"
        />
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
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
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="At least 6 characters"
          required
          disabled={isLoading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 lg:h-10 text-base lg:text-sm"
          autoComplete="new-password"
          minLength={6}
        />
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          required
          disabled={isLoading}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-12 lg:h-10 text-base lg:text-sm"
          autoComplete="new-password"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 lg:h-10 font-medium text-base lg:text-sm transition-all active:scale-[0.98] mt-6"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Spinner />
            <span className="ml-2">Creating account...</span>
          </>
        ) : (
          "Create account"
        )}
      </Button>

      {/* Back to OAuth Button */}
      <Button
        type="button"
        onClick={onSwitchToOAuth}
        variant="ghost"
        className="w-full h-12 lg:h-10 font-medium text-base lg:text-sm transition-all active:scale-[0.98]"
        disabled={isLoading}
      >
        Back to social login
      </Button>
    </form>
  );
}
