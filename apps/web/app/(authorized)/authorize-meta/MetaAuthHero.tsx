export function MetaAuthHero() {
  const benefits = [
    "Instant Performance Insights",
    "AI-Powered Recommendations",
    "Multi-Account Support",
  ];

  const stats = [
    { value: "5min", label: "Setup Time" },
    { value: "100%", label: "Secure" },
    { value: "0", label: "Ads Modified" },
  ];

  return (
    <div className="hidden lg:block space-y-8">
      {/* Badge */}
      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-sm">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
          Secure OAuth Connection
        </span>
      </div>

      {/* Heading */}
      <div className="space-y-4">
        <h1 className="text-6xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-foreground via-blue-600 to-foreground">
            Connect Your
          </span>
          <br />
          <span className="text-foreground">Meta Ads</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg">
          Securely link your Meta Ads Manager account to start receiving
          AI-powered optimization recommendations.
        </p>
      </div>

      {/* Benefit Pills */}
      <div className="flex flex-wrap gap-3">
        {benefits.map((benefit) => (
          <div
            key={benefit}
            className="px-4 py-2 rounded-lg bg-card/50 backdrop-blur border border-border/50 text-sm font-medium"
          >
            {benefit}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 pt-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Trust Indicator */}
      <div className="pt-8 space-y-3">
        <div className="text-sm font-medium text-muted-foreground">
          Trusted by advertisers
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-chart-2 border-2 border-background flex items-center justify-center text-sm font-bold text-white"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Join 1,000+ active users
          </div>
        </div>
      </div>
    </div>
  );
}
