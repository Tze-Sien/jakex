"use client";

import { useState } from "react";

interface MascotProps {
    mood: "happy" | "excited" | "sad" | "thinking" | "celebrating" | "sleeping" | "encouraging";
    size?: "sm" | "md" | "lg";
    message?: string;
    showBubble?: boolean;
}

export function Mascot({ mood, size = "md", message, showBubble = false }: MascotProps) {
    const sizeClasses = {
        sm: "w-16 h-16",
        md: "w-24 h-24",
        lg: "w-32 h-32",
    };

    const getMoodEmoji = () => {
        switch (mood) {
            case "happy":
                return "😊";
            case "excited":
                return "🤩";
            case "sad":
                return "😢";
            case "thinking":
                return "🤔";
            case "celebrating":
                return "🥳";
            case "sleeping":
                return "😴";
            case "encouraging":
                return "💪";
            default:
                return "😊";
        }
    };

    const getMoodAnimation = () => {
        switch (mood) {
            case "excited":
            case "celebrating":
                return "animate-bounce";
            case "thinking":
                return "animate-pulse";
            case "sleeping":
                return "";
            case "encouraging":
                return "animate-pulse";
            default:
                return "animate-float";
        }
    };

    const getMoodColor = () => {
        switch (mood) {
            case "happy":
                return "from-green-400 to-emerald-500";
            case "excited":
            case "celebrating":
                return "from-yellow-400 to-orange-500";
            case "sad":
                return "from-blue-400 to-indigo-500";
            case "thinking":
                return "from-purple-400 to-pink-500";
            case "sleeping":
                return "from-gray-400 to-slate-500";
            case "encouraging":
                return "from-green-400 to-teal-500";
            default:
                return "from-primary to-chart-2";
        }
    };

    return (
        <div className="relative inline-flex flex-col items-center">
            {/* Speech Bubble */}
            {showBubble && message && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 animate-in fade-in zoom-in-95 z-10">
                    <div className="bg-white dark:bg-card border-2 border-border rounded-2xl px-4 py-2 shadow-lg max-w-[200px]">
                        <p className="text-sm font-medium text-foreground text-center">{message}</p>
                    </div>
                    {/* Bubble tail */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-card border-r-2 border-b-2 border-border rotate-45" />
                </div>
            )}

            {/* Mascot Body */}
            <div className={`${sizeClasses[size]} ${getMoodAnimation()} relative`}>
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getMoodColor()} blur-xl opacity-30`} />

                {/* Main body */}
                <div className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br ${getMoodColor()} flex items-center justify-center shadow-xl border-4 border-white/20`}>
                    {/* Face */}
                    <div className="relative">
                        {/* Eyes */}
                        <div className="flex gap-3 mb-1">
                            <div className={`w-3 h-3 rounded-full bg-white ${mood === "sleeping" ? "h-0.5" : ""}`}>
                                {mood !== "sleeping" && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-800 mt-0.5 ml-0.5 animate-pulse" />
                                )}
                            </div>
                            <div className={`w-3 h-3 rounded-full bg-white ${mood === "sleeping" ? "h-0.5" : ""}`}>
                                {mood !== "sleeping" && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-800 mt-0.5 ml-0.5 animate-pulse" />
                                )}
                            </div>
                        </div>

                        {/* Mouth */}
                        <div className="flex justify-center">
                            {mood === "happy" || mood === "excited" || mood === "celebrating" || mood === "encouraging" ? (
                                <div className="w-4 h-2 border-b-2 border-white rounded-b-full" />
                            ) : mood === "sad" ? (
                                <div className="w-4 h-2 border-t-2 border-white rounded-t-full mt-1" />
                            ) : (
                                <div className="w-3 h-0.5 bg-white rounded-full" />
                            )}
                        </div>
                    </div>

                    {/* Blush marks for happy moods */}
                    {(mood === "happy" || mood === "excited" || mood === "celebrating") && (
                        <>
                            <div className="absolute left-2 top-1/2 w-2 h-1 bg-pink-300/50 rounded-full" />
                            <div className="absolute right-2 top-1/2 w-2 h-1 bg-pink-300/50 rounded-full" />
                        </>
                    )}

                    {/* Sparkles for celebrating */}
                    {mood === "celebrating" && (
                        <>
                            <div className="absolute -top-2 -right-2 text-xl animate-star-spin">✨</div>
                            <div className="absolute -top-2 -left-2 text-xl animate-star-spin animation-delay-200">⭐</div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-lg animate-bounce">🎉</div>
                        </>
                    )}

                    {/* Zzz for sleeping */}
                    {mood === "sleeping" && (
                        <div className="absolute -top-4 -right-2 text-lg animate-float">💤</div>
                    )}

                    {/* Sweat drop for thinking */}
                    {mood === "thinking" && (
                        <div className="absolute -top-1 -right-1 text-sm">💧</div>
                    )}
                </div>

                {/* Shadow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-black/10 rounded-full blur-sm" />
            </div>
        </div>
    );
}

// Pre-defined mascot messages
export const MASCOT_MESSAGES = {
    welcome: ["Hey there, superstar! 🌟", "Ready to crush it today?", "Let's make some magic! ✨"],
    correct: ["Amazing work! 🎉", "You're on fire! 🔥", "Brilliant move!", "That's the spirit! 💪"],
    wrong: ["No worries, keep going!", "You've got this!", "Try the next one!"],
    streak: ["Keep that streak alive! 🔥", "You're unstoppable!", "Consistency is key! 🗝️"],
    encouragement: ["You're doing great!", "Almost there!", "Don't give up! 💪"],
    celebration: ["INCREDIBLE! 🎊", "You're a champion! 🏆", "Victory dance time! 💃"],
    comeback: ["Welcome back! 🎉", "Missed you! Let's go!", "Ready for round 2?"],
};

export function getRandomMessage(type: keyof typeof MASCOT_MESSAGES): string {
    const messages = MASCOT_MESSAGES[type];
    return messages[Math.floor(Math.random() * messages.length)];
}
