export type PerformanceStatus = "performing" | "normal" | "underperforming";

export interface PerformanceMetrics {
  costPerResult: number;
  accountAverage: number;
}

/**
 * Categorizes performance based on cost per result vs account average
 * @param costPerResult - The cost per result for the entity (campaign/ad set/ad)
 * @param accountAverage - The account's average cost per result
 * @returns Performance status: 'performing' | 'normal' | 'underperforming'
 */
export function categorizePerformance(
  costPerResult: number,
  accountAverage: number
): PerformanceStatus {
  if (costPerResult < accountAverage) {
    return "performing";
  }
  if (costPerResult > accountAverage * 1.5) {
    return "underperforming";
  }
  return "normal";
}

/**
 * Get status badge color classes for UI display
 */
export function getStatusColor(status: PerformanceStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "performing":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      };
    case "underperforming":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
      };
    case "normal":
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
      };
  }
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: PerformanceStatus): string {
  switch (status) {
    case "performing":
      return "Performing";
    case "underperforming":
      return "Underperforming";
    case "normal":
      return "Normal";
  }
}
