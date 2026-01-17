import { OAuthButtons } from "./OAuthButtons";
import { EmailLoginForm } from "./EmailLoginForm";

type AuthMethod = "oauth" | "email";

interface LoginCardProps {
    authMethod: AuthMethod;
    isLoading: boolean;
    loadingProvider: "facebook" | "google" | "email" | null;
    onOAuthLogin: (provider: "facebook" | "google") => void;
    onEmailLogin: (e: React.FormEvent) => void;
    onSwitchAuthMethod: (method: AuthMethod) => void;
}

export function LoginCard({
    authMethod,
    isLoading,
    loadingProvider,
    onOAuthLogin,
    onEmailLogin,
    onSwitchAuthMethod,
}: LoginCardProps) {
    return (
        <div className="relative group">
            {/* Glow Effect - Hidden on mobile for cleaner app look */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-primary to-chart-2 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition duration-500 hidden lg:block" />

            {/* Main Card */}
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 lg:shadow-2xl shadow-lg">
                <div className="space-y-6">
                    {/* Header - Hidden on mobile (shown in page instead) */}
                    <div className="space-y-2 hidden lg:block">
                        <h3 className="text-2xl font-bold text-foreground">
                            Welcome back
                        </h3>
                        <p className="text-muted-foreground">
                            Sign in to access your dashboard
                        </p>
                    </div>

                    {/* OAuth or Email Form */}
                    {authMethod === "oauth" ? (
                        <OAuthButtons
                            onLogin={onOAuthLogin}
                            onSwitchToEmail={() => onSwitchAuthMethod("email")}
                            isLoading={isLoading}
                            loadingProvider={loadingProvider}
                        />
                    ) : (
                        <EmailLoginForm
                            onSubmit={onEmailLogin}
                            onSwitchToOAuth={() => onSwitchAuthMethod("oauth")}
                            isLoading={isLoading}
                            loadingProvider={loadingProvider}
                        />
                    )}

                    {/* Footer - Moved to bottom bar on mobile */}
                    <div className="text-center pt-2 hidden lg:block">
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

                    {/* Mobile Footer */}
                    <div className="text-center pt-4 lg:hidden">
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
    );
}
