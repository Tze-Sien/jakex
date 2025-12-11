import { FacebookLoginButton } from "@/components/facebook-login-button";
import { AuthStatus } from "@/components/auth-status";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-xl">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Welcome Back
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sign in to continue to your account
                    </p>
                </div>

                {/* Auth Status (shows if logged in) */}
                <AuthStatus />

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                            Continue with
                        </span>
                    </div>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-4">
                    <FacebookLoginButton />
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground">
                    By continuing, you agree to our{" "}
                    <a href="/terms" className="underline hover:text-foreground">
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="underline hover:text-foreground">
                        Privacy Policy
                    </a>
                </p>
            </div>
        </div>
    );
}
