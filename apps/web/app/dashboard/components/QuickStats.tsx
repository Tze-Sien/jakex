"use client";

import { LayoutGrid, DollarSign, TrendingUp, AlertCircle } from "lucide-react";

interface QuickStatsProps {
    totalAds: number;
    activeAds: number;
    totalSpend: number;
    overallRoas: number;
    pendingActions: number;
}

export function QuickStats({
    totalAds,
    activeAds,
    totalSpend,
    overallRoas,
    pendingActions
}: QuickStatsProps) {
    const formatCurrency = (num: number) => {
        if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
        return `$${num.toFixed(0)}`;
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <h3 className="text-sm font-semibold text-foreground">Overview</h3>

            {/* Stats Grid */}
            <div className="space-y-2">
                {/* Active Ads */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/30">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <LayoutGrid className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="text-sm text-muted-foreground">Active Ads</span>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-bold text-foreground">{activeAds}</span>
                        <span className="text-sm text-muted-foreground">/{totalAds}</span>
                    </div>
                </div>

                {/* Total Spend */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/30">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-green-500" />
                        </div>
                        <span className="text-sm text-muted-foreground">Total Spend</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{formatCurrency(totalSpend)}</span>
                </div>

                {/* ROAS */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/30">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                        </div>
                        <span className="text-sm text-muted-foreground">Overall ROAS</span>
                    </div>
                    <span className={`text-lg font-bold ${overallRoas >= 2 ? "text-green-500" : overallRoas >= 1 ? "text-yellow-500" : "text-red-500"}`}>
                        {overallRoas.toFixed(1)}x
                    </span>
                </div>

                {/* Pending Actions */}
                {pendingActions > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm text-primary font-medium">Actions Pending</span>
                        </div>
                        <span className="text-lg font-bold text-primary">{pendingActions}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
