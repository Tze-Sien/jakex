"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Zap, Gift, Star } from "lucide-react";

interface Task {
  id: string;
  label: string;
  completed: boolean;
  xp?: number;
}

interface ProgressTrackerProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
}

export function ProgressTracker({ tasks, onTaskClick }: ProgressTrackerProps) {
  const [completedCount, setCompletedCount] = useState(0);
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);
  const totalCount = tasks.length;
  const progress = (completedCount / totalCount) * 100;
  const allComplete = completedCount === totalCount;

  useEffect(() => {
    setCompletedCount(tasks.filter((t) => t.completed).length);
  }, [tasks]);

  const handleTaskClick = (taskId: string) => {
    setAnimatingTaskId(taskId);
    setTimeout(() => setAnimatingTaskId(null), 500);
    onTaskClick?.(taskId);
  };

  const getTotalXP = () => {
    return tasks.reduce((sum, task) => sum + (task.xp || 25), 0);
  };

  const getEarnedXP = () => {
    return tasks
      .filter((t) => t.completed)
      .reduce((sum, task) => sum + (task.xp || 25), 0);
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border-2 border-border/50 rounded-3xl p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-chart-2/10 to-transparent rounded-full blur-2xl" />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${allComplete ? "bg-gradient-to-br from-yellow-400 to-amber-500 animate-level-up" : "bg-primary/10 border border-primary/20"}
          `}>
            {allComplete ? (
              <Star className="w-5 h-5 text-white animate-star-spin" />
            ) : (
              <Zap className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Daily Quests</h3>
            <p className="text-xs text-muted-foreground">Complete tasks to earn XP</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* XP Counter */}
          <div className="px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
              {getEarnedXP()}/{getTotalXP()} XP
            </span>
          </div>

          {/* Progress badge */}
          <div className={`
            px-3 py-1.5 rounded-xl border flex items-center gap-1.5
            ${allComplete
              ? "bg-green-500/10 border-green-500/30"
              : "bg-primary/10 border-primary/20"
            }
          `}>
            <span className={`text-sm font-bold ${allComplete ? "text-green-500" : "text-primary"}`}>
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="h-4 bg-muted/30 rounded-full overflow-hidden border border-border/30">
          {/* Shimmer effect */}
          <div className="absolute inset-0 animate-shimmer opacity-20" />

          {/* Progress fill */}
          <div
            className={`
              h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden
              ${allComplete
                ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500"
                : "bg-gradient-to-r from-primary to-chart-2"
              }
            `}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 animate-shimmer" />
          </div>
        </div>

        {/* Milestone markers */}
        <div className="absolute inset-0 flex items-center justify-around pointer-events-none">
          {[25, 50, 75].map((milestone) => (
            <div
              key={milestone}
              className={`
                w-1 h-6 rounded-full transition-colors
                ${progress >= milestone ? "bg-white/50" : "bg-muted-foreground/20"}
              `}
            />
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="relative space-y-3">
        {tasks.map((task, index) => (
          <button
            key={task.id}
            onClick={() => handleTaskClick(task.id)}
            className={`
              w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]
              ${animatingTaskId === task.id ? "animate-score-pop" : ""}
              ${task.completed
                ? "bg-green-500/10 border-2 border-green-500/30 shadow-lg shadow-green-500/10"
                : "bg-muted/20 border-2 border-border/30 hover:bg-muted/40 hover:border-border/50"
              }
            `}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Checkbox */}
            <div className="relative">
              {task.completed ? (
                <div className="relative">
                  <CheckCircle2 className="w-7 h-7 text-green-500 animate-badge-unlock" />
                  {/* Sparkle effect */}
                  <div className="absolute -top-1 -right-1 animate-star-spin">
                    <span className="text-xs">✨</span>
                  </div>
                </div>
              ) : (
                <Circle className="w-7 h-7 text-muted-foreground/50" />
              )}
            </div>

            {/* Task content */}
            <div className="flex-1 text-left">
              <span
                className={`
                  text-sm font-medium block
                  ${task.completed
                    ? "text-green-600 dark:text-green-400 line-through"
                    : "text-foreground"
                  }
                `}
              >
                {task.label}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Zap className="w-3 h-3 text-yellow-500" />
                +{task.xp || 25} XP
              </span>
            </div>

            {/* Status indicator */}
            <div className={`
              w-8 h-8 rounded-xl flex items-center justify-center
              ${task.completed
                ? "bg-green-500/20"
                : "bg-muted/30"
              }
            `}>
              {task.completed ? (
                <span className="text-lg">🎯</span>
              ) : (
                <span className="text-lg opacity-50">⭕</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Completion Message */}
      {allComplete && (
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 border-2 border-yellow-500/30 text-center relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 animate-shimmer opacity-30" />

          <div className="relative flex items-center justify-center gap-3">
            <Gift className="w-6 h-6 text-yellow-500 animate-bounce" />
            <div>
              <p className="text-sm font-bold text-foreground">
                🎉 All Quests Complete!
              </p>
              <p className="text-xs text-muted-foreground">
                You earned <span className="text-yellow-500 font-bold">{getTotalXP()} XP</span> today!
              </p>
            </div>
            <Gift className="w-6 h-6 text-yellow-500 animate-bounce animation-delay-200" />
          </div>
        </div>
      )}

      {/* Motivation message when not complete */}
      {!allComplete && completedCount > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {completedCount === totalCount - 1
              ? "🔥 Just one more to go!"
              : `💪 Keep going! ${totalCount - completedCount} quest${totalCount - completedCount > 1 ? "s" : ""} remaining`
            }
          </p>
        </div>
      )}
    </div>
  );
}
