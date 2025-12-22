"use client";

import { Check, X, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionPanelProps {
    recommendation: string;
    impact: string;
    xpReward?: number;
    onApply: () => void;
    onSkip: () => void;
    onDetails?: () => void;
    isLoading?: boolean;
}

export function ActionPanel({
    recommendation,
    impact,
    xpReward = 25,
    onApply,
    onSkip,
    onDetails,
    isLoading = false,
}: ActionPanelProps) {
    return (
        <div className="w-full max-w-md mx-auto">
            {/* Recommendation Card */}
            <div className="rounded-2xl bg-card/80 backdrop-blur border border-border/50 overflow-hidden shadow-xl">
                {/* Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-chart-2/5 border-b border-border/30">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                            <span className="text-sm">💡</span>
                        </div>
                        <span className="text-sm font-semibold text-primary">AI Recommendation</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <p className="text-base text-foreground leading-relaxed mb-3">
                        {recommendation}
                    </p>

                    {/* Impact Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            📈 {impact}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0">
                    <div className="flex gap-3">
                        {/* Skip Button */}
                        <Button
                            onClick={onSkip}
                            variant="outline"
                            size="lg"
                            disabled={isLoading}
                            className="flex-1 h-14 rounded-xl border-2 border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/50 transition-all active:scale-95"
                        >
                            <X className="w-5 h-5 mr-2 text-muted-foreground" />
                            <span className="text-muted-foreground font-medium">Skip</span>
                        </Button>

                        {/* Apply Button */}
                        <Button
                            onClick={onApply}
                            size="lg"
                            disabled={isLoading}
                            className="flex-[2] h-14 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/25 transition-all active:scale-95"
                        >
                            <Check className="w-5 h-5 mr-2" />
                            <span>Apply</span>
                            {xpReward > 0 && (
                                <span className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                                    <Zap className="w-3 h-3" />
                                    +{xpReward}
                                </span>
                            )}
                        </Button>
                    </div>

                    {/* Details link */}
                    {onDetails && (
                        <button
                            onClick={onDetails}
                            className="w-full mt-3 flex items-center justify-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span>View full details</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
