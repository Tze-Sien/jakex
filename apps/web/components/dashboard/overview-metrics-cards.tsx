"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OverviewMetrics } from "@/lib/actions/dashboard-queries";

interface OverviewMetricsCardsProps {
  metrics: OverviewMetrics;
  selectedMetrics: string[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100); // Convert from cents to dollars
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatDecimal(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
}

function MetricCard({ label, value, change }: MetricCardProps) {
  const hasChange = change !== undefined && !isNaN(change);
  const isPositive = hasChange && change > 0;
  const isNegative = hasChange && change < 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hasChange && (
          <div className={`flex items-center text-xs mt-2 ${
            isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-muted-foreground"
          }`}>
            {isPositive && <ArrowUp className="h-3 w-3 mr-1" />}
            {isNegative && <ArrowDown className="h-3 w-3 mr-1" />}
            <span>{Math.abs(change).toFixed(1)}% vs previous period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function OverviewMetricsCards({
  metrics,
  selectedMetrics,
}: OverviewMetricsCardsProps) {
  const metricConfig: Record<string, { label: string; value: string }> = {
    spend: {
      label: "Total Spend",
      value: formatCurrency(metrics.spend),
    },
    impressions: {
      label: "Impressions",
      value: formatNumber(metrics.impressions),
    },
    clicks: {
      label: "Clicks",
      value: formatNumber(metrics.clicks),
    },
    reach: {
      label: "Reach",
      value: formatNumber(metrics.reach),
    },
    conversions: {
      label: "Conversions",
      value: formatNumber(metrics.conversions),
    },
    conversionValue: {
      label: "Conversion Value",
      value: formatCurrency(metrics.conversionValue),
    },
    ctr: {
      label: "CTR",
      value: formatPercentage(metrics.ctr),
    },
    cpc: {
      label: "CPC",
      value: formatCurrency(metrics.cpc),
    },
    cpm: {
      label: "CPM",
      value: formatCurrency(metrics.cpm),
    },
    costPerConversion: {
      label: "Cost Per Conversion",
      value: formatCurrency(metrics.costPerConversion),
    },
    roas: {
      label: "ROAS",
      value: formatDecimal(metrics.roas, 2) + "x",
    },
  };

  const displayedMetrics = selectedMetrics
    .filter((key) => key in metricConfig)
    .map((key) => ({ key, ...metricConfig[key] }));

  if (displayedMetrics.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No metrics selected. Use the customize button to select metrics to display.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {displayedMetrics.map((metric) => (
        <MetricCard
          key={metric.key}
          label={metric.label}
          value={metric.value}
        />
      ))}
    </div>
  );
}
