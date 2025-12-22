"use client";

import { Heart, HeartCrack } from "lucide-react";

interface HeartsDisplayProps {
    lives: number;
    maxLives: number;
    onLoseLife?: () => void;
}

export function HeartsDisplay({ lives, maxLives }: HeartsDisplayProps) {
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: maxLives }, (_, index) => {
                const isFilled = index < lives;
                const isLast = index === lives - 1;

                return (
                    <div
                        key={index}
                        className={`
              relative transition-all duration-300
              ${isFilled ? "scale-100" : "scale-90 opacity-50"}
              ${isLast && lives > 0 ? "animate-heartbeat" : ""}
            `}
                    >
                        {isFilled ? (
                            <Heart
                                className="w-6 h-6 text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                            />
                        ) : (
                            <HeartCrack className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
