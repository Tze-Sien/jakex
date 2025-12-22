"use client";

import { useEffect, useState } from "react";

interface ConfettiPiece {
    id: number;
    x: number;
    color: string;
    delay: number;
    size: number;
    rotation: number;
}

interface ConfettiProps {
    active: boolean;
    count?: number;
}

const COLORS = [
    "#6366f1", // Primary indigo
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#3b82f6", // Blue
    "#22d3ee", // Cyan
];

export function Confetti({ active, count = 50 }: ConfettiProps) {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

    useEffect(() => {
        if (active) {
            const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                delay: Math.random() * 0.5,
                size: Math.random() * 10 + 5,
                rotation: Math.random() * 360,
            }));
            setPieces(newPieces);
        } else {
            setPieces([]);
        }
    }, [active, count]);

    if (!active || pieces.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="absolute animate-confetti"
                    style={{
                        left: `${piece.x}%`,
                        top: "-20px",
                        width: piece.size,
                        height: piece.size * 1.5,
                        backgroundColor: piece.color,
                        borderRadius: piece.id % 2 === 0 ? "50%" : "2px",
                        animationDelay: `${piece.delay}s`,
                        transform: `rotate(${piece.rotation}deg)`,
                    }}
                />
            ))}
        </div>
    );
}
