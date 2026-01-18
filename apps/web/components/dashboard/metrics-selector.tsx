"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { saveUserDashboardPreferences } from "@/lib/actions/dashboard-queries";

export const AVAILABLE_METRICS = [
  { key: "spend", label: "Spend", description: "Total amount spent" },
  { key: "impressions", label: "Impressions", description: "Number of times ads were shown" },
  { key: "clicks", label: "Clicks", description: "Number of clicks received" },
  { key: "reach", label: "Reach", description: "Number of unique people reached" },
  { key: "conversions", label: "Conversions", description: "Total conversions" },
  { key: "conversionValue", label: "Conversion Value", description: "Total value of conversions" },
  { key: "ctr", label: "CTR", description: "Click-through rate (%)" },
  { key: "cpc", label: "CPC", description: "Cost per click" },
  { key: "cpm", label: "CPM", description: "Cost per 1,000 impressions" },
  { key: "costPerConversion", label: "Cost Per Conversion", description: "Average cost per conversion" },
  { key: "roas", label: "ROAS", description: "Return on ad spend" },
] as const;

interface MetricsSelectorProps {
  userId: string;
  selectedMetrics: string[];
  onSelectionChange: (selectedMetrics: string[]) => void;
}

export function MetricsSelector({
  userId,
  selectedMetrics,
  onSelectionChange,
}: MetricsSelectorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleToggleMetric = async (metricKey: string) => {
    const newSelection = selectedMetrics.includes(metricKey)
      ? selectedMetrics.filter((key) => key !== metricKey)
      : [...selectedMetrics, metricKey];

    onSelectionChange(newSelection);

    // Save to database
    setIsSaving(true);
    try {
      await saveUserDashboardPreferences(userId, {
        visibleMetrics: newSelection,
      });
    } catch (error) {
      console.error("Failed to save metrics selection:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Customize Metrics
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Customize Dashboard Metrics</SheetTitle>
          <SheetDescription>
            Select which metrics to display on your dashboard
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {AVAILABLE_METRICS.map((metric) => {
            const isSelected = selectedMetrics.includes(metric.key);
            return (
              <div key={metric.key} className="flex items-start space-x-3">
                <Checkbox
                  id={metric.key}
                  checked={isSelected}
                  onCheckedChange={() => handleToggleMetric(metric.key)}
                  disabled={isSaving}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={metric.key}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {metric.label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-between items-center text-sm text-muted-foreground">
          <span>{selectedMetrics.length} metrics selected</span>
          {isSaving && <span>Saving...</span>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
