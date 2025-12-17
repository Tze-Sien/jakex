import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface EmailLoginFormProps {
    onSubmit: (e: React.FormEvent) => void;
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
    return (
        <form onSubmit={onSubmit} className="space-y-5">
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
                    type="password"
                    required
                    disabled={isLoading}
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
