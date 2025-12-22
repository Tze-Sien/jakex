"use client";

import { useState, useEffect } from "react";
import { Sparkles, ThumbsUp, ThumbsDown, Info, Zap, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SwipeableCardProps {
  title: string;
  description: string;
  impact: string;
  category?: "budget" | "creative" | "targeting" | "general";
  difficulty?: "easy" | "medium" | "hard";
  xpReward?: number;
  onAccept: () => void;
  onReject: () => void;
  onInfo: () => void;
}

export function SwipeableCard({
  title,
  description,
  impact,
  category = "general",
  difficulty = "easy",
  xpReward = 50,
  onAccept,
  onReject,
  onInfo,
}: SwipeableCardProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [exitAnimation, setExitAnimation] = useState<"left" | "right" | null>(null);
  const [showXPPopup, setShowXPPopup] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    // Card entrance animation
    const timer = setTimeout(() => setIsEntering(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (exitAnimation) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || exitAnimation) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (exitAnimation) return;
    setIsDragging(false);

    if (dragOffset > 100) {
      triggerAccept();
    } else if (dragOffset < -100) {
      triggerReject();
    } else {
      setDragOffset(0);
    }
  };

  const triggerAccept = () => {
    setExitAnimation("right");
    setShowXPPopup(true);
    setTimeout(() => {
      onAccept();
      setExitAnimation(null);
      setShowXPPopup(false);
      setDragOffset(0);
    }, 400);
  };

  const triggerReject = () => {
    setExitAnimation("left");
    setTimeout(() => {
      onReject();
      setExitAnimation(null);
      setDragOffset(0);
    }, 400);
  };

  const getRotation = () => {
    return dragOffset / 20;
  };

  const getOpacity = (side: "left" | "right") => {
    if (side === "left") {
      return dragOffset < 0 ? Math.min(Math.abs(dragOffset) / 100, 1) : 0;
    } else {
      return dragOffset > 0 ? Math.min(dragOffset / 100, 1) : 0;
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case "budget":
        return <DollarSign className="w-5 h-5" />;
      case "creative":
        return <Sparkles className="w-5 h-5" />;
      case "targeting":
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case "budget":
        return "from-green-500 to-emerald-600";
      case "creative":
        return "from-purple-500 to-pink-600";
      case "targeting":
        return "from-blue-500 to-indigo-600";
      default:
        return "from-primary to-chart-2";
    }
  };

  const getDifficultyBadge = () => {
    switch (difficulty) {
      case "easy":
        return { label: "Easy", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30" };
      case "medium":
        return { label: "Medium", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30" };
      case "hard":
        return { label: "Advanced", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" };
    }
  };

  const difficultyBadge = getDifficultyBadge();

  const getCardClasses = () => {
    if (isEntering) return "animate-card-enter";
    if (exitAnimation === "right") return "animate-card-exit-right";
    if (exitAnimation === "left") return "animate-card-exit-left";
    return "";
  };

  return (
    <div className="relative touch-none select-none">
      {/* XP Popup */}
      {showXPPopup && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="animate-score-float text-4xl font-bold text-green-500 flex items-center gap-2">
            +{xpReward} XP
            <span className="animate-star-spin">⭐</span>
          </div>
        </div>
      )}

      {/* Swipe Indicators */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Reject indicator */}
        <div
          className="absolute top-8 right-8 bg-gradient-to-br from-red-500 to-rose-600 text-white p-4 rounded-2xl shadow-2xl shadow-red-500/30 transition-all duration-200"
          style={{
            opacity: getOpacity("left"),
            transform: `scale(${0.5 + getOpacity("left") * 0.5})`,
          }}
        >
          <ThumbsDown className="w-8 h-8" />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold bg-red-600 px-2 py-0.5 rounded-full">
            SKIP
          </span>
        </div>

        {/* Accept indicator */}
        <div
          className="absolute top-8 left-8 bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-2xl shadow-green-500/30 transition-all duration-200"
          style={{
            opacity: getOpacity("right"),
            transform: `scale(${0.5 + getOpacity("right") * 0.5})`,
          }}
        >
          <ThumbsUp className="w-8 h-8" />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold bg-green-600 px-2 py-0.5 rounded-full">
            FIX
          </span>
        </div>
      </div>

      {/* Card */}
      <div
        className={`
          relative bg-card/80 backdrop-blur-xl border-2 border-border/50 rounded-3xl p-6 
          shadow-2xl shadow-primary/10 transition-transform
          ${getCardClasses()}
          ${isDragging ? "cursor-grabbing" : "cursor-grab"}
        `}
        style={{
          transform: exitAnimation ? undefined : `translateX(${dragOffset}px) rotate(${getRotation()}deg)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Glass overlay effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

        {/* Category & Difficulty badges */}
        <div className="flex items-center justify-between mb-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getCategoryColor()} text-white text-xs font-semibold`}>
            {getCategoryIcon()}
            <span className="capitalize">{category}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficultyBadge.color}`}>
              {difficultyBadge.label}
            </span>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">+{xpReward} XP</span>
            </div>
          </div>
        </div>

        {/* Sparkle Icon with pulse effect */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* Pulse ring */}
            <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-chart-2/30 animate-pulse-ring" />

            {/* Main icon */}
            <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${getCategoryColor()} flex items-center justify-center shadow-xl shadow-primary/30 animate-pulse-glow`}>
              <Sparkles className="w-10 h-10 text-white animate-star-spin" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <h3 className="text-2xl font-bold text-foreground text-center leading-tight">
            {title}
          </h3>
          <p className="text-base text-muted-foreground text-center leading-relaxed">
            {description}
          </p>
        </div>

        {/* Impact Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 animate-pulse">
            <span className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
              {impact}
              <span className="animate-bounce">📈</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() => !exitAnimation && triggerReject()}
            variant="outline"
            size="lg"
            className="h-16 border-2 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 active:scale-95 transition-all group"
          >
            <div className="flex flex-col items-center gap-1">
              <ThumbsDown className="w-6 h-6 text-red-500 group-hover:animate-shake" />
              <span className="text-xs text-muted-foreground">Skip</span>
            </div>
          </Button>

          <Button
            onClick={onInfo}
            variant="outline"
            size="lg"
            className="h-16 border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 active:scale-95 transition-all group"
          >
            <div className="flex flex-col items-center gap-1">
              <Info className="w-6 h-6 text-primary group-hover:animate-wobble" />
              <span className="text-xs text-muted-foreground">Details</span>
            </div>
          </Button>

          <Button
            onClick={() => !exitAnimation && triggerAccept()}
            size="lg"
            className="h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl shadow-green-500/30 active:scale-95 transition-all group"
          >
            <div className="flex flex-col items-center gap-1">
              <ThumbsUp className="w-6 h-6 group-hover:animate-bounce" />
              <span className="text-xs">Fix It!</span>
            </div>
          </Button>
        </div>

        {/* Swipe Instruction */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <span className="animate-bounce">👈</span>
            Swipe to decide
            <span className="animate-bounce">👉</span>
          </p>
        </div>
      </div>
    </div>
  );
}
