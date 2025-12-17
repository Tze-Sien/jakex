export function HeroSection() {
    const features = ["Real-time Analysis", "Smart Recommendations", "Easy Setup"];
    const stats = [
        { value: "10x", label: "Faster Analysis" },
        { value: "95%", label: "Accuracy" },
        { value: "24/7", label: "Monitoring" },
    ];

    return (
        <div className="hidden lg:block space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">
                    AI-Powered Meta Ads Optimization
                </span>
            </div>

            {/* Heading */}
            <div className="space-y-4">
                <h1 className="text-6xl font-bold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-linear-to-r from-foreground via-primary to-foreground">
                        Stop Wasting
                    </span>
                    <br />
                    <span className="text-foreground">Ad Budget</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                    Get AI-powered recommendations to optimize your Meta ads and maximize
                    ROI in real-time.
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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-4">
                {stats.map((stat) => (
                    <div key={stat.label}>
                        <div className="text-3xl font-bold text-primary">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
