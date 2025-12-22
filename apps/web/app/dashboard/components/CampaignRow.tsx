import { TrendingUp, TrendingDown } from "lucide-react";

interface CampaignRowProps {
  name: string;
  status: "active" | "paused";
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
  trend: "up" | "down";
  trendValue: number;
}

export function CampaignRow({
  name,
  status,
  spend,
  impressions,
  clicks,
  conversions,
  roas,
  trend,
  trendValue,
}: CampaignRowProps) {
  const ctr = ((clicks / impressions) * 100).toFixed(2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 hover:border-border transition-all">
      {/* Campaign Name & Status */}
      <div className="lg:col-span-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                status === "active"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
              }`}
            >
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="lg:col-span-9 grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Spend */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Spend</p>
          <p className="text-sm font-semibold text-foreground">
            ${spend.toLocaleString()}
          </p>
        </div>

        {/* Impressions */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Impressions</p>
          <p className="text-sm font-semibold text-foreground">
            {(impressions / 1000).toFixed(1)}k
          </p>
        </div>

        {/* Clicks */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Clicks</p>
          <p className="text-sm font-semibold text-foreground">
            {clicks.toLocaleString()}
          </p>
        </div>

        {/* CTR */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">CTR</p>
          <p className="text-sm font-semibold text-foreground">{ctr}%</p>
        </div>

        {/* Conversions */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Conversions</p>
          <p className="text-sm font-semibold text-foreground">{conversions}</p>
        </div>

        {/* ROAS */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">ROAS</p>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground">
              {roas.toFixed(2)}x
            </p>
            {trend === "up" ? (
              <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
