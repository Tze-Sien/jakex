"use client";

import { Flame } from "lucide-react";

interface StreakCalendarProps {
    currentStreak: number;
    weekData: { day: string; completed: boolean; isToday: boolean }[];
}

export function StreakCalendar({ currentStreak, weekData }: StreakCalendarProps) {
    return (
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-orange-500 animate-fire-flicker" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">Daily Streak</h3>
                        <p className="text-xs text-muted-foreground">Don't break the chain!</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30">
                    <span className="text-2xl font-bold text-orange-500">{currentStreak}</span>
                    <span className="text-sm text-orange-600 dark:text-orange-400">days</span>
                </div>
            </div>

            {/* Week calendar */}
            <div className="flex items-center justify-between gap-1">
                {weekData.map((day, index) => (
                    <div
                        key={index}
                        className="flex-1 flex flex-col items-center gap-1"
                    >
                        <span className="text-xs text-muted-foreground uppercase">{day.day}</span>
                        <div
                            className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all
                ${day.completed
                                    ? "bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/30"
                                    : day.isToday
                                        ? "border-2 border-dashed border-orange-500/50 bg-orange-500/5"
                                        : "bg-muted/30 border border-border/30"
                                }
                ${day.isToday ? "ring-2 ring-orange-500/30 ring-offset-2 ring-offset-background" : ""}
              `}
                        >
                            {day.completed ? (
                                <span className="text-xl">🔥</span>
                            ) : day.isToday ? (
                                <span className="text-lg opacity-50">⭕</span>
                            ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Motivation message */}
            <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                    {currentStreak >= 7
                        ? "🏆 Incredible! You're on a roll!"
                        : currentStreak >= 3
                            ? "🔥 Keep it up! You're building momentum!"
                            : "💪 Start your streak today!"
                    }
                </p>
            </div>
        </div>
    );
}
