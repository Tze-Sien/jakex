"use client";

import { signInWithFacebook } from "@repo/auth";
import { useState } from "react";

interface FacebookLoginButtonProps {
    redirectTo?: string;
    className?: string;
}

export function FacebookLoginButton({
    redirectTo,
    className,
}: FacebookLoginButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { error: authError } = await signInWithFacebook({
                redirectTo: redirectTo ?? `${window.location.origin}/auth/callback`,
            });

            if (authError) {
                setError(authError.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={handleLogin}
                disabled={isLoading}
                className={`
          flex h-12 w-full items-center justify-center gap-3
          rounded-lg bg-[#1877F2] px-6
          text-base font-medium text-white
          transition-all duration-200
          hover:bg-[#166FE5] hover:shadow-lg
          focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-60
          ${className ?? ""}
        `}
                type="button"
                aria-label="Continue with Facebook"
            >
                {isLoading ? (
                    <svg
                        className="h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                ) : (
                    <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                )}
                <span>{isLoading ? "Connecting..." : "Continue with Facebook"}</span>
            </button>

            {error && (
                <p className="text-sm text-red-500 text-center" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
