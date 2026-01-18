"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const PERIODS = [
  { value: "today", label: "Today" },
  { value: "last_3_days", label: "Last 3 Days" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_14_days", label: "Last 14 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "last_60_days", label: "Last 60 Days" },
  { value: "last_90_days", label: "Last 90 Days" },
  { value: "lifetime", label: "Lifetime" },
] as const;

interface PeriodSelectorProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
}

export function PeriodSelector({ value, onValueChange }: PeriodSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-45">
        <SelectValue/>
      </SelectTrigger>
      <SelectContent>
        {PERIODS.map((period) => (
          <SelectItem key={period.value} value={period.value}>
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
