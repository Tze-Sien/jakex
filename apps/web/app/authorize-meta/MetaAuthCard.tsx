import { Button } from "@/components/ui/button";
import { BarChart3, Target, TrendingUp } from "lucide-react";

interface MetaAuthCardProps {
  isLoading: boolean;
  onConnect: () => void;
}

export function MetaAuthCard({ isLoading, onConnect }: MetaAuthCardProps) {
  const permissions = [
    {
      icon: BarChart3,
      title: "Read Ad Performance",
      description: "Access your ad metrics and performance data",
    },
    {
      icon: Target,
      title: "View Ad Accounts",
      description: "See all your connected ad accounts",
    },
    {
      icon: TrendingUp,
      title: "Analyze Campaigns",
      description: "Get insights on your campaigns and ad sets",
    },
  ];

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
              Connect Meta Ads
            </h3>
            <p className="text-muted-foreground">
              Grant access to analyze your ad performance
            </p>
          </div>

          {/* Meta Logo */}
          <div className="flex justify-center py-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
              <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl">
                <svg
                  className="w-12 h-12 lg:w-14 lg:h-14 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Permissions List */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-foreground">
              We&apos;ll request permission to:
            </div>
            <div className="space-y-3">
              {permissions.map((permission) => {
                const Icon = permission.icon;
                return (
                  <div
                    key={permission.title}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/30"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {permission.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {permission.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connect Button */}
          <Button
            onClick={onConnect}
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Connect Meta Ads Manager</span>
              </div>
            )}
          </Button>

          {/* Security Note */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <svg
              className="w-5 h-5 text-primary shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <div className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">
                Your data is secure.
              </span>{" "}
              We only request read-only access and never modify your ads without
              your permission.
            </div>
          </div>

          {/* Skip Link - Mobile */}
          <div className="text-center pt-2 lg:hidden">
            <button className="text-sm text-muted-foreground active:opacity-70 transition-opacity">
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
