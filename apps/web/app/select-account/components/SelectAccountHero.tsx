export function SelectAccountHero() {
  const features = [
    "Multi-Account Analysis",
    "Real-time Sync",
    "Secure & Private",
  ];

  return (
    <div className="hidden lg:block space-y-8">
      {/* Badge */}
      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm font-medium text-primary">
          Step 2 of 3 - Select Accounts
        </span>
      </div>

      {/* Heading */}
      <div className="space-y-4">
        <h1 className="text-6xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-foreground via-primary to-foreground">
            Choose Your
          </span>
          <br />
          <span className="text-foreground">Ad Accounts</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg">
          Select one or more ad accounts to analyze. You can always add or
          remove accounts later from your dashboard.
        </p>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap gap-3">
        {features.map((feature) => (
          <div
            key={feature}
            className="px-4 py-2 rounded-lg bg-card/50 backdrop-blur border border-border/50 text-sm font-medium"
          >
            {feature}
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <div className="text-2xl font-bold text-primary mb-1">
            Unlimited
          </div>
          <div className="text-sm text-muted-foreground">
            Account connections
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <div className="text-2xl font-bold text-primary mb-1">
            Instant
          </div>
          <div className="text-sm text-muted-foreground">
            Data synchronization
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="pt-4 space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          💡 Pro Tip
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Start with your most active accounts. You can easily add more accounts
          anytime from your dashboard settings.
        </p>
      </div>
    </div>
  );
}
