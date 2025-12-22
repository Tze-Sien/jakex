"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Metric {
    label: string;
    value: string;
    trend?: "up" | "down" | "stable";
    trendValue?: string;
}

interface MetricsGridProps {
    metrics: Metric[];
    columns?: 2 | 3 | 4;
}

export function MetricsGrid({ metrics, columns = 4 }: MetricsGridProps) {
    const getTrendIcon = (trend?: "up" | "down" | "stable") => {
        switch (trend) {
            case "up":
                return <TrendingUp className="w-3 h-3 text-green-500" />;
            case "down":
                return <TrendingDown className="w-3 h-3 text-red-500" />;
            case "stable":
                return <Minus className="w-3 h-3 text-yellow-500" />;
            default:
                return null;
        }
    };

    const getTrendColor = (trend?: "up" | "down" | "stable") => {
        switch (trend) {
            case "up":
                return "text-green-500";
            case "down":
                return "text-red-500";
            default:
                return "text-muted-foreground";
        }
    };

    const gridCols = {
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-3`}>
            {metrics.map((metric, idx) => (
                <div
                    key={idx}
                    className="p-3 rounded-xl bg-card/50 border border-border/30 hover:border-border/50 transition-colors"
                >
                    <div className="text-xs uppercase text-muted-foreground tracking-wider mb-1">
                        {metric.label}
                    </div>
                    <div className="text-xl font-bold text-foreground">
                        {metric.value}
                    </div>
                    {metric.trend && metric.trendValue && (
                        <div className={`flex items-center gap-1 mt-1 ${getTrendColor(metric.trend)}`}>
                            {getTrendIcon(metric.trend)}
                            <span className="text-xs font-medium">{metric.trendValue}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
