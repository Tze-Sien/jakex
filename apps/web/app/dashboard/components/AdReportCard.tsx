"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Eye, MousePointer, DollarSign, Users, RotateCcw } from "lucide-react";

export interface AdMetrics {
    roas: number;
    ctr: number;
    cpc: number;
    cpm: number;
    spend: number;
    conversions: number;
    impressions: number;
    clicks: number;
}

export interface AdReportCardProps {
    id: string;
    adName: string;
    campaignName: string;
    adImage?: string;
    metrics: AdMetrics;
    healthScore: number; // 0-100
    status: "performer" | "attention" | "critical";
    trend: "up" | "down" | "stable";
    aiSummary: string;
    recommendations: string[];
}

export function AdReportCard({
    adName,
    campaignName,
    adImage,
    metrics,
    healthScore,
    status,
    trend,
    aiSummary,
    recommendations,
}: AdReportCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    const getStatusConfig = () => {
        switch (status) {
            case "performer":
                return {
                    label: "Top Performer",
                    color: "text-green-500",
                    bgColor: "bg-green-500/10",
                    borderColor: "border-green-500/30",
                    gradient: "from-green-500/20 to-emerald-500/10",
                    emoji: "🔥",
                };
            case "attention":
                return {
                    label: "Needs Attention",
                    color: "text-yellow-500",
                    bgColor: "bg-yellow-500/10",
                    borderColor: "border-yellow-500/30",
                    gradient: "from-yellow-500/20 to-amber-500/10",
                    emoji: "⚠️",
                };
            case "critical":
                return {
                    label: "Critical",
                    color: "text-red-500",
                    bgColor: "bg-red-500/10",
                    borderColor: "border-red-500/30",
                    gradient: "from-red-500/20 to-rose-500/10",
                    emoji: "🚨",
                };
        }
    };

    const getTrendIcon = () => {
        switch (trend) {
            case "up":
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            case "down":
                return <TrendingDown className="w-4 h-4 text-red-500" />;
            default:
                return <Minus className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getHealthColor = () => {
        if (healthScore >= 70) return "bg-green-500";
        if (healthScore >= 40) return "bg-yellow-500";
        return "bg-red-500";
    };

    const statusConfig = getStatusConfig();

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };

    const formatCurrency = (num: number) => {
        if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
        return `$${num.toFixed(2)}`;
    };

    return (
        <div
            className="relative w-full max-w-md mx-auto cursor-pointer perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: "1000px" }}
        >
            <div
                className={`
          relative w-full transition-transform duration-500 
          ${isFlipped ? "[transform:rotateY(180deg)]" : ""}
        `}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* FRONT OF CARD */}
                <div
                    className={`
            relative w-full rounded-3xl overflow-hidden
            bg-gradient-to-br from-card via-card to-background
            border-2 ${statusConfig.borderColor}
            shadow-2xl shadow-black/20
            ${isFlipped ? "invisible" : ""}
          `}
                    style={{ backfaceVisibility: "hidden" }}
                >
                    {/* Card Header */}
                    <div className={`p-4 bg-gradient-to-r ${statusConfig.gradient}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground truncate">{campaignName}</p>
                                <h3 className="font-bold text-foreground truncate">{adName}</h3>
                            </div>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig.bgColor}`}>
                                <span>{statusConfig.emoji}</span>
                                <span className={`text-xs font-semibold ${statusConfig.color}`}>{statusConfig.label}</span>
                            </div>
                        </div>
                    </div>

                    {/* Ad Preview */}
                    <div className="relative h-40 bg-muted/30 flex items-center justify-center overflow-hidden">
                        {adImage ? (
                            <img src={adImage} alt={adName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Eye className="w-8 h-8 opacity-50" />
                                <span className="text-sm">Ad Preview</span>
                            </div>
                        )}

                        {/* Trend badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/90 backdrop-blur-sm">
                            {getTrendIcon()}
                            <span className="text-xs font-medium">vs last week</span>
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-4 gap-1 p-3 bg-muted/20">
                        <div className="text-center p-2">
                            <div className="text-lg font-bold text-foreground">{metrics.roas.toFixed(1)}x</div>
                            <div className="text-[10px] uppercase text-muted-foreground tracking-wider">ROAS</div>
                        </div>
                        <div className="text-center p-2">
                            <div className="text-lg font-bold text-foreground">{metrics.ctr.toFixed(1)}%</div>
                            <div className="text-[10px] uppercase text-muted-foreground tracking-wider">CTR</div>
                        </div>
                        <div className="text-center p-2">
                            <div className="text-lg font-bold text-foreground">{formatCurrency(metrics.cpc)}</div>
                            <div className="text-[10px] uppercase text-muted-foreground tracking-wider">CPC</div>
                        </div>
                        <div className="text-center p-2">
                            <div className="text-lg font-bold text-foreground">{formatCurrency(metrics.spend)}</div>
                            <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Spend</div>
                        </div>
                    </div>

                    {/* Health Score */}
                    <div className="p-4 border-t border-border/30">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Health Score</span>
                            <span className={`text-lg font-bold ${statusConfig.color}`}>{healthScore}/100</span>
                        </div>
                        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${getHealthColor()} rounded-full transition-all duration-500`}
                                style={{ width: `${healthScore}%` }}
                            />
                        </div>
                    </div>

                    {/* Flip Hint */}
                    <div className="flex items-center justify-center gap-2 py-3 border-t border-border/30 text-muted-foreground">
                        <RotateCcw className="w-4 h-4" />
                        <span className="text-xs">Tap to see AI Analysis</span>
                    </div>
                </div>

                {/* BACK OF CARD - AI Analysis */}
                <div
                    className={`
            absolute inset-0 w-full rounded-3xl overflow-hidden
            bg-gradient-to-br from-card via-card to-background
            border-2 border-primary/30
            shadow-2xl shadow-black/20
            [transform:rotateY(180deg)]
            ${!isFlipped ? "invisible" : ""}
          `}
                    style={{ backfaceVisibility: "hidden" }}
                >
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-primary/20 to-chart-2/10 border-b border-border/30">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <span className="text-lg">🤖</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">AI Analysis</h3>
                                <p className="text-xs text-muted-foreground">{adName}</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4">
                        <p className="text-sm text-foreground leading-relaxed">{aiSummary}</p>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="px-4 pb-4">
                        <h4 className="text-xs uppercase text-muted-foreground tracking-wider mb-3">Performance Breakdown</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                                <Eye className="w-4 h-4 text-blue-500" />
                                <div>
                                    <div className="text-sm font-bold">{formatNumber(metrics.impressions)}</div>
                                    <div className="text-[10px] text-muted-foreground">Impressions</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                                <MousePointer className="w-4 h-4 text-purple-500" />
                                <div>
                                    <div className="text-sm font-bold">{formatNumber(metrics.clicks)}</div>
                                    <div className="text-[10px] text-muted-foreground">Clicks</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                                <Users className="w-4 h-4 text-green-500" />
                                <div>
                                    <div className="text-sm font-bold">{formatNumber(metrics.conversions)}</div>
                                    <div className="text-[10px] text-muted-foreground">Conversions</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                                <DollarSign className="w-4 h-4 text-yellow-500" />
                                <div>
                                    <div className="text-sm font-bold">{formatCurrency(metrics.cpm)}</div>
                                    <div className="text-[10px] text-muted-foreground">CPM</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="px-4 pb-4">
                        <h4 className="text-xs uppercase text-muted-foreground tracking-wider mb-2">Key Insights</h4>
                        <ul className="space-y-1">
                            {recommendations.slice(0, 3).map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                                    <span className="text-primary mt-0.5">•</span>
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Flip back hint */}
                    <div className="flex items-center justify-center gap-2 py-3 border-t border-border/30 text-muted-foreground">
                        <RotateCcw className="w-4 h-4" />
                        <span className="text-xs">Tap to flip back</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
