"use client";

import { useState } from "react";
import { Trophy, Zap, Target, Flame, Star, Rocket, Award, Crown } from "lucide-react";

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: "trophy" | "zap" | "target" | "flame" | "star" | "rocket" | "award" | "crown";
    color: string;
    unlocked: boolean;
    progress?: number;
    maxProgress?: number;
}

interface AchievementBadgeProps {
    achievement: Achievement;
    size?: "sm" | "md" | "lg";
    showTooltip?: boolean;
}

const ICONS = {
    trophy: Trophy,
    zap: Zap,
    target: Target,
    flame: Flame,
    star: Star,
    rocket: Rocket,
    award: Award,
    crown: Crown,
};

const SIZE_CLASSES = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
};

const ICON_SIZE_CLASSES = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10",
};

export function AchievementBadge({
    achievement,
    size = "md",
    showTooltip = true
}: AchievementBadgeProps) {
    const [isHovered, setIsHovered] = useState(false);
    const Icon = ICONS[achievement.icon];

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Badge */}
            <div
                className={`
          ${SIZE_CLASSES[size]} rounded-2xl flex items-center justify-center
          transition-all duration-300 cursor-pointer
          ${achievement.unlocked
                        ? `bg-gradient-to-br ${achievement.color} shadow-lg hover:scale-110 animate-badge-unlock`
                        : "bg-muted/50 border-2 border-dashed border-muted-foreground/30"
                    }
        `}
            >
                {/* Icon */}
                <Icon
                    className={`
            ${ICON_SIZE_CLASSES[size]}
            ${achievement.unlocked ? "text-white" : "text-muted-foreground/50"}
          `}
                />

                {/* Shine effect for unlocked badges */}
                {achievement.unlocked && (
                    <div className="absolute inset-0 rounded-2xl animate-badge-shine opacity-50" />
                )}

                {/* Progress ring for locked badges with progress */}
                {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-primary/30"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - achievement.progress / achievement.maxProgress)}`}
                            strokeLinecap="round"
                        />
                    </svg>
                )}

                {/* Lock indicator */}
                {!achievement.unlocked && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-muted rounded-full border border-border flex items-center justify-center">
                        <span className="text-xs">🔒</span>
                    </div>
                )}
            </div>

            {/* Tooltip */}
            {showTooltip && isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="bg-popover border border-border rounded-xl p-3 shadow-xl min-w-[200px] max-w-[250px]">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${achievement.unlocked ? `bg-gradient-to-br ${achievement.color}` : "bg-muted"}`}>
                                <Icon className={`w-3 h-3 ${achievement.unlocked ? "text-white" : "text-muted-foreground"}`} />
                            </div>
                            <span className="font-bold text-sm text-foreground">{achievement.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>

                        {/* Progress bar for locked achievements */}
                        {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
                            <div className="mt-2">
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground mt-1 block">
                                    {achievement.progress} / {achievement.maxProgress}
                                </span>
                            </div>
                        )}

                        {achievement.unlocked && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <span>✓</span>
                                <span>Unlocked!</span>
                            </div>
                        )}
                    </div>

                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-popover border-r border-b border-border rotate-45 -mt-1.5" />
                </div>
            )}
        </div>
    );
}

// Achievements display component
interface AchievementsRowProps {
    achievements: Achievement[];
}

export function AchievementsRow({ achievements }: AchievementsRowProps) {
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Achievements
                </h3>
                <span className="text-sm text-muted-foreground">
                    {unlockedCount}/{achievements.length} unlocked
                </span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {achievements.map((achievement) => (
                    <AchievementBadge key={achievement.id} achievement={achievement} size="md" />
                ))}
            </div>
        </div>
    );
}
