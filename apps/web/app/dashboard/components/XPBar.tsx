"use client";

import { useState, useEffect } from "react";
import { Zap, Star, Crown } from "lucide-react";

interface XPBarProps {
    currentXP: number;
    maxXP: number;
    level: number;
    streak: number;
}

export function XPBar({ currentXP, maxXP, level, streak }: XPBarProps) {
    const [animatedXP, setAnimatedXP] = useState(0);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const progress = (animatedXP / maxXP) * 100;

    useEffect(() => {
        // Animate XP bar filling
        const timer = setTimeout(() => {
            setAnimatedXP(currentXP);
        }, 100);
        return () => clearTimeout(timer);
    }, [currentXP]);

    const getLevelIcon = () => {
        if (level >= 10) return <Crown className="w-5 h-5" />;
        if (level >= 5) return <Star className="w-5 h-5" />;
        return <Zap className="w-5 h-5" />;
    };

    const getLevelColor = () => {
        if (level >= 10) return "from-yellow-400 to-orange-500";
        if (level >= 5) return "from-purple-400 to-pink-500";
        return "from-primary to-chart-2";
    };

    return (
        <div className="relative">
            {/* Level Badge */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    {/* Level Circle */}
                    <div
                        className={`
              relative w-12 h-12 rounded-xl bg-gradient-to-br ${getLevelColor()} 
              flex items-center justify-center shadow-lg
              ${showLevelUp ? "animate-level-up" : ""}
            `}
                    >
                        <div className="text-white font-bold text-lg">{level}</div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center shadow">
                            {getLevelIcon()}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-semibold text-foreground">Level {level}</div>
                        <div className="text-xs text-muted-foreground">
                            {maxXP - currentXP} XP to next level
                        </div>
                    </div>
                </div>

                {/* Streak Indicator */}
                {streak > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30">
                        <div className="animate-fire-flicker">🔥</div>
                        <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">
                            {streak} day{streak > 1 ? "s" : ""}
                        </span>
                    </div>
                )}
            </div>

            {/* XP Progress Bar */}
            <div className="relative h-4 bg-muted/30 rounded-full overflow-hidden border border-border/30">
                {/* Background shimmer effect */}
                <div className="absolute inset-0 animate-shimmer opacity-30" />

                {/* Progress fill */}
                <div
                    className={`
            h-full rounded-full bg-gradient-to-r ${getLevelColor()} 
            transition-all duration-1000 ease-out relative overflow-hidden
          `}
                    style={{ width: `${progress}%` }}
                >
                    {/* Shimmer overlay on progress */}
                    <div className="absolute inset-0 animate-shimmer" />
                </div>

                {/* XP Counter */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-foreground drop-shadow-sm">
                        {animatedXP} / {maxXP} XP
                    </span>
                </div>
            </div>

            {/* XP Indicators */}
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>🎯 Complete tasks to earn XP</span>
                <span className="flex items-center gap-1">
                    +50 XP per task
                    <span className="animate-pulse text-green-500">✨</span>
                </span>
            </div>
        </div>
    );
}
