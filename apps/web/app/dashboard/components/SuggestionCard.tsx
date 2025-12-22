import { Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuggestionCardProps {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: string;
  estimatedImpact: string;
  onApply?: () => void;
  onDismiss?: () => void;
}

export function SuggestionCard({
  title,
  description,
  impact,
  category,
  estimatedImpact,
  onApply,
  onDismiss,
}: SuggestionCardProps) {
  const impactConfig = {
    high: {
      badge: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      label: "High Impact",
      icon: TrendingUp,
    },
    medium: {
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      label: "Medium Impact",
      icon: Sparkles,
    },
    low: {
      badge: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      label: "Low Impact",
      icon: AlertCircle,
    },
  };

  const ImpactIcon = impactConfig[impact].icon;

  return (
    <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6 hover:shadow-lg hover:border-border transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              {category}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {title}
          </h3>
        </div>

        {/* Impact Badge */}
        <div
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${impactConfig[impact].badge}`}
        >
          <ImpactIcon className="w-3.5 h-3.5" />
          {impactConfig[impact].label}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {description}
      </p>

      {/* Estimated Impact */}
      <div className="flex items-center gap-2 mb-5 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <TrendingUp className="w-4 h-4 text-primary shrink-0" />
        <div className="flex-1">
          <span className="text-xs text-muted-foreground">Estimated Impact: </span>
          <span className="text-sm font-semibold text-foreground">
            {estimatedImpact}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onApply}
          className="flex-1 bg-linear-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-primary-foreground shadow-sm"
        >
          View Details
        </Button>
        <Button
          onClick={onDismiss}
          variant="outline"
          className="px-4"
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
