"use client";

import { Gem } from "lucide-react";

interface GemsDisplayProps {
    gems: number;
    showAnimation?: boolean;
    size?: "sm" | "md" | "lg";
}

export function GemsDisplay({ gems, showAnimation = false, size = "md" }: GemsDisplayProps) {
    const sizeClasses = {
        sm: { container: "px-2 py-1", icon: "w-4 h-4", text: "text-sm" },
        md: { container: "px-3 py-1.5", icon: "w-5 h-5", text: "text-base" },
        lg: { container: "px-4 py-2", icon: "w-6 h-6", text: "text-lg" },
    };

    const sizes = sizeClasses[size];

    return (
        <div
            className={`
        inline-flex items-center gap-1.5 rounded-xl 
        bg-gradient-to-r from-cyan-500/10 to-blue-500/10 
        border border-cyan-500/30
        ${sizes.container}
        ${showAnimation ? "animate-score-pop" : ""}
      `}
        >
            <div className="relative">
                <Gem className={`${sizes.icon} text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]`} />
                {/* Shine effect */}
                <div className="absolute inset-0 animate-badge-shine opacity-50" />
            </div>
            <span className={`${sizes.text} font-bold text-cyan-600 dark:text-cyan-400`}>
                {gems.toLocaleString()}
            </span>
        </div>
    );
}
