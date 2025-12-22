import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  trend: "up" | "down";
  color: "primary" | "green" | "red" | "blue";
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  color,
}: MetricCardProps) {
  const colorClasses = {
    primary: {
      bg: "bg-primary/10",
      text: "text-primary",
      border: "border-primary/20",
    },
    green: {
      bg: "bg-green-500/10",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-500/20",
    },
    red: {
      bg: "bg-red-500/10",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-500/20",
    },
    blue: {
      bg: "bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500/20",
    },
  };

  const isPositive = trend === "up";

  return (
    <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6 hover:shadow-lg hover:border-border transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium mb-2">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-foreground mb-3">{value}</h3>

          {/* Change Indicator */}
          <div className="flex items-center gap-1.5">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                isPositive
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              )}
              <span>
                {isPositive ? "+" : ""}
                {change}%
              </span>
            </div>
            <span className="text-xs text-muted-foreground">vs last 7 days</span>
          </div>
        </div>

        {/* Icon */}
        <div
          className={`shrink-0 w-12 h-12 rounded-xl ${colorClasses[color].bg} border ${colorClasses[color].border} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${colorClasses[color].text}`} />
        </div>
      </div>
    </div>
  );
}
