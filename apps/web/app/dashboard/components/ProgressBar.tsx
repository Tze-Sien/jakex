"use client";

import { Zap, Flame } from "lucide-react";

interface ProgressBarProps {
    currentXP: number;
    maxXP: number;
    level: number;
    streak: number;
}

export function ProgressBar({ currentXP, maxXP, level, streak }: ProgressBarProps) {
    const progress = (currentXP / maxXP) * 100;

    return (
        <div className="flex items-center gap-4">
            {/* Level Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-white text-xs font-bold">
                    {level}
                </div>
                <span className="text-sm font-medium text-foreground">Lv.{level}</span>
            </div>

            {/* XP Bar */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                        <Zap className="w-3 h-3 inline mr-1 text-yellow-500" />
                        {currentXP} / {maxXP} XP
                    </span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Streak */}
            {streak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{streak}</span>
                </div>
            )}
        </div>
    );
}
