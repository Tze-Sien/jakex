"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Sparkles, Zap, Target, DollarSign } from "lucide-react";

interface AISummaryProps {
  summary: string;
  trend: "up" | "down" | "stable";
  score: number; // 0-100
}

export function AISummary({ summary, trend, score }: AISummaryProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showInsight, setShowInsight] = useState(false);

  useEffect(() => {
    // Animate score counting up
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    // Show insight after score animation
    const insightTimer = setTimeout(() => setShowInsight(true), 500);

    return () => {
      clearInterval(timer);
      clearTimeout(insightTimer);
    };
  }, [score]);

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case "down":
        return <TrendingDown className="w-6 h-6 text-red-500" />;
      default:
        return <Minus className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getTrendGradient = () => {
    switch (trend) {
      case "up":
        return "from-green-500/20 via-emerald-500/10 to-green-600/5";
      case "down":
        return "from-red-500/20 via-rose-500/10 to-red-600/5";
      default:
        return "from-yellow-500/20 via-amber-500/10 to-yellow-600/5";
    }
  };

  const getTrendBorderColor = () => {
    switch (trend) {
      case "up":
        return "border-green-500/30";
      case "down":
        return "border-red-500/30";
      default:
        return "border-yellow-500/30";
    }
  };

  const getScoreColor = () => {
    if (score >= 80) return "from-green-400 to-emerald-500";
    if (score >= 60) return "from-blue-400 to-indigo-500";
    if (score >= 40) return "from-yellow-400 to-orange-500";
    return "from-red-400 to-rose-500";
  };

  const getScoreLabel = () => {
    if (score >= 80) return { text: "Excellent!", emoji: "🚀" };
    if (score >= 60) return { text: "Good Progress!", emoji: "👍" };
    if (score >= 40) return { text: "Room to Grow", emoji: "💪" };
    return { text: "Needs Attention", emoji: "⚠️" };
  };

  const scoreLabel = getScoreLabel();

  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl p-6 lg:p-8
        bg-gradient-to-br ${getTrendGradient()}
        border-2 ${getTrendBorderColor()}
        transition-all duration-500
      `}
    >
      {/* Animated background orbs */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-chart-2/10 to-transparent rounded-full blur-3xl animate-float-slow animation-delay-500" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-2xl animate-float-reverse animation-delay-300" />

      <div className="relative space-y-6">
        {/* Header with AI Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse-glow">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                {/* Pulse ring */}
                <div className="absolute inset-0 w-10 h-10 rounded-xl bg-primary/30 animate-pulse-ring" />
              </div>
              <div>
                <span className="text-sm font-bold gradient-text">AI Insight</span>
                <span className="text-xs text-muted-foreground block">Powered by JakeX AI</span>
              </div>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
              {scoreLabel.text}
              <span className="text-3xl animate-bounce">{scoreLabel.emoji}</span>
            </h2>
          </div>

          {/* Animated Score Circle */}
          <div className="shrink-0 relative w-20 h-20 lg:w-24 lg:h-24">
            {/* Background ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="38%"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="50%"
                cy="50%"
                r="38%"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - animatedScore / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={score >= 60 ? "#22c55e" : "#f59e0b"} />
                  <stop offset="100%" stopColor={score >= 60 ? "#10b981" : "#ef4444"} />
                </linearGradient>
              </defs>
            </svg>

            {/* Score number */}
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className={`text-2xl lg:text-3xl font-bold bg-gradient-to-br ${getScoreColor()} bg-clip-text text-transparent`}>
                {animatedScore}
              </span>
              <span className="text-xs text-muted-foreground">Health</span>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-lg animate-pulse opacity-50" />
          </div>
        </div>

        {/* Summary Text with typing effect appearance */}
        <div
          className={`
            flex items-start gap-3 p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/30
            transition-all duration-500
            ${showInsight ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center">
            {getTrendIcon()}
          </div>
          <p className="text-base lg:text-lg text-foreground leading-relaxed flex-1">
            {summary}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/30">
          <div className="text-center p-3 rounded-2xl bg-background/30 backdrop-blur-sm border border-border/20 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-1">Active Ads</div>
            <div className="text-xl font-bold text-foreground">12</div>
          </div>

          <div className="text-center p-3 rounded-2xl bg-background/30 backdrop-blur-sm border border-border/20 hover:border-green-500/30 hover:bg-green-500/5 transition-all cursor-pointer group">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-4 h-4 text-green-500" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-1">Today's Spend</div>
            <div className="text-xl font-bold text-foreground">$1.8K</div>
          </div>

          <div className="text-center p-3 rounded-2xl bg-background/30 backdrop-blur-sm border border-border/20 hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all cursor-pointer group">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-1">Total ROAS</div>
            <div className="text-xl font-bold text-green-500">4.2x</div>
          </div>
        </div>
      </div>
    </div>
  );
}
