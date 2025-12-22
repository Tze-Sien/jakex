"use client";

import { useState, useEffect } from "react";
import { Target, Check, Zap } from "lucide-react";

interface DailyGoalProps {
    current: number;
    target: number;
    xpPerAction?: number;
}

export function DailyGoal({ current, target, xpPerAction = 10 }: DailyGoalProps) {
    const [animatedCurrent, setAnimatedCurrent] = useState(0);
    const progress = Math.min((animatedCurrent / target) * 100, 100);
    const isComplete = animatedCurrent >= target;
    const circumference = 2 * Math.PI * 45;

    useEffect(() => {
        // Animate the counter
        const timer = setTimeout(() => {
            setAnimatedCurrent(current);
        }, 100);
        return () => clearTimeout(timer);
    }, [current]);

    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-card/50 backdrop-blur border border-border/50">
            {/* Circular Progress */}
            <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="40"
                        cy="40"
                        r="35"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-muted/30"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="40"
                        cy="40"
                        r="35"
                        stroke="url(#dailyGoalGradient)"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - progress / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient id="dailyGoalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={isComplete ? "#22c55e" : "#6366f1"} />
                            <stop offset="100%" stopColor={isComplete ? "#10b981" : "#8b5cf6"} />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    {isComplete ? (
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center animate-badge-unlock">
                            <Check className="w-6 h-6 text-white" />
                        </div>
                    ) : (
                        <>
                            <span className="text-2xl font-bold text-foreground">{animatedCurrent}</span>
                            <span className="text-xs text-muted-foreground">/ {target}</span>
                        </>
                    )}
                </div>

                {/* Glow effect when complete */}
                {isComplete && (
                    <div className="absolute inset-0 rounded-full bg-green-500/20 blur-lg animate-pulse" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <Target className={`w-5 h-5 ${isComplete ? "text-green-500" : "text-primary"}`} />
                    <h3 className="font-bold text-foreground">
                        {isComplete ? "Goal Complete! 🎉" : "Daily Goal"}
                    </h3>
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                    {isComplete
                        ? "Amazing work today! Come back tomorrow!"
                        : `Complete ${target - animatedCurrent} more action${target - animatedCurrent !== 1 ? "s" : ""}`
                    }
                </p>

                {/* XP indicator */}
                <div className="flex items-center gap-1 text-xs">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span className="text-muted-foreground">
                        {xpPerAction} XP per action
                    </span>
                </div>
            </div>
        </div>
    );
}
