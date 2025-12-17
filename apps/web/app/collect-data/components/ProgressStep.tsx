import { Check, Loader2 } from "lucide-react";

interface ProgressStepProps {
  title: string;
  description: string;
  status: "pending" | "loading" | "completed";
  icon: React.ReactNode;
}

export function ProgressStep({
  title,
  description,
  status,
  icon,
}: ProgressStepProps) {
  return (
    <div className="flex items-start gap-4">
      {/* Icon Container */}
      <div
        className={`
        shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500
        ${
          status === "completed"
            ? "bg-green-500/10 border-2 border-green-500/30"
            : status === "loading"
            ? "bg-primary/10 border-2 border-primary/30 animate-pulse"
            : "bg-muted/50 border-2 border-border/30"
        }
      `}
      >
        {status === "completed" ? (
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        ) : status === "loading" ? (
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        ) : (
          <div className="text-muted-foreground">{icon}</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pt-2">
        <h3
          className={`text-base font-semibold transition-colors ${
            status === "loading"
              ? "text-foreground"
              : status === "completed"
              ? "text-green-600 dark:text-green-400"
              : "text-muted-foreground"
          }`}
        >
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>

        {/* Loading Bar */}
        {status === "loading" && (
          <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-progress-bar" />
          </div>
        )}
      </div>
    </div>
  );
}
