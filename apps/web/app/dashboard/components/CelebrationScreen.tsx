"use client";

import { useEffect, useState } from "react";
import { Trophy, Star, Zap, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "./Mascot";
import { Confetti } from "./Confetti";

interface CelebrationScreenProps {
    type: "level-up" | "streak" | "achievement" | "daily-complete" | "lesson-complete";
    title: string;
    subtitle: string;
    xpEarned?: number;
    gemsEarned?: number;
    streakDays?: number;
    newLevel?: number;
    onContinue: () => void;
}

export function CelebrationScreen({
    type,
    title,
    subtitle,
    xpEarned = 0,
    gemsEarned = 0,
    streakDays = 0,
    newLevel = 0,
    onContinue,
}: CelebrationScreenProps) {
    const [showContent, setShowContent] = useState(false);
    const [showRewards, setShowRewards] = useState(false);

    useEffect(() => {
        // Stagger animations
        const contentTimer = setTimeout(() => setShowContent(true), 300);
        const rewardsTimer = setTimeout(() => setShowRewards(true), 800);

        return () => {
            clearTimeout(contentTimer);
            clearTimeout(rewardsTimer);
        };
    }, []);

    const getIcon = () => {
        switch (type) {
            case "level-up":
                return <Star className="w-12 h-12 text-white" />;
            case "streak":
                return <span className="text-5xl">🔥</span>;
            case "achievement":
                return <Trophy className="w-12 h-12 text-white" />;
            case "daily-complete":
                return <Gift className="w-12 h-12 text-white" />;
            case "lesson-complete":
                return <Zap className="w-12 h-12 text-white" />;
        }
    };

    const getGradient = () => {
        switch (type) {
            case "level-up":
                return "from-purple-500 via-pink-500 to-orange-500";
            case "streak":
                return "from-orange-500 via-red-500 to-pink-500";
            case "achievement":
                return "from-yellow-400 via-amber-500 to-orange-500";
            case "daily-complete":
                return "from-green-400 via-emerald-500 to-teal-500";
            case "lesson-complete":
                return "from-blue-400 via-indigo-500 to-purple-500";
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl">
            <Confetti active={true} count={80} />

            <div className="max-w-md w-full mx-4 text-center">
                {/* Main Icon */}
                <div
                    className={`
            relative inline-flex items-center justify-center w-32 h-32 rounded-full 
            bg-gradient-to-br ${getGradient()} shadow-2xl
            ${showContent ? "animate-badge-unlock" : "opacity-0"}
          `}
                >
                    {getIcon()}

                    {/* Glow effect */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getGradient()} blur-2xl opacity-50 animate-pulse`} />

                    {/* Sparkles */}
                    <div className="absolute -top-4 -right-4 text-3xl animate-star-spin">✨</div>
                    <div className="absolute -top-2 -left-6 text-2xl animate-star-spin animation-delay-200">⭐</div>
                    <div className="absolute -bottom-2 -right-6 text-2xl animate-star-spin animation-delay-500">🌟</div>

                    {/* Level number for level-up */}
                    {type === "level-up" && newLevel > 0 && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-card px-4 py-1 rounded-full shadow-lg">
                            <span className="text-lg font-bold gradient-text">Level {newLevel}</span>
                        </div>
                    )}

                    {/* Streak number */}
                    {type === "streak" && streakDays > 0 && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-card px-4 py-1 rounded-full shadow-lg">
                            <span className="text-lg font-bold text-orange-500">{streakDays} Days</span>
                        </div>
                    )}
                </div>

                {/* Title & Subtitle */}
                <div
                    className={`mt-8 transition-all duration-500 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                    <h1 className="text-4xl font-bold gradient-text mb-3">{title}</h1>
                    <p className="text-lg text-muted-foreground">{subtitle}</p>
                </div>

                {/* Mascot */}
                <div
                    className={`mt-6 transition-all duration-500 delay-200 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                    <Mascot mood="celebrating" size="lg" />
                </div>

                {/* Rewards */}
                <div
                    className={`
            mt-8 flex items-center justify-center gap-4
            transition-all duration-500 ${showRewards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
                >
                    {xpEarned > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 animate-score-pop">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            <span className="font-bold text-yellow-600 dark:text-yellow-400">+{xpEarned} XP</span>
                        </div>
                    )}

                    {gemsEarned > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 animate-score-pop animation-delay-200">
                            <Gift className="w-5 h-5 text-cyan-500" />
                            <span className="font-bold text-cyan-600 dark:text-cyan-400">+{gemsEarned} Gems</span>
                        </div>
                    )}
                </div>

                {/* Continue Button */}
                <div
                    className={`
            mt-10 transition-all duration-500 delay-500
            ${showRewards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
                >
                    <Button
                        onClick={onContinue}
                        size="lg"
                        className={`
              w-full h-14 text-lg font-bold rounded-2xl
              bg-gradient-to-r ${getGradient()} hover:opacity-90
              shadow-xl transition-all hover:scale-105 active:scale-95
            `}
                    >
                        Continue
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
