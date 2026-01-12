"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface EmailLoginFormProps {
    onSubmit: (e: React.FormEvent, email: string, password: string) => void;
    onSwitchToOAuth: () => void;
    isLoading: boolean;
    loadingProvider: "facebook" | "google" | "email" | null;
}

export function EmailLoginForm({
    onSubmit,
    onSwitchToOAuth,
    isLoading,
    loadingProvider,
}: EmailLoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(e, email, password);
    };

    return (
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
                    placeholder="Your email address"
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
                className="w-full h-12 lg:h-10 font-medium text-base lg:text-sm transition-all active:scale-[0.98] mt-6"
                disabled={isLoading}
            >
                {loadingProvider === "email" ? (
                    <>
                        <Spinner />
                        <span className="ml-2">Signing in...</span>
                    </>
                ) : (
                    "Sign in"
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
