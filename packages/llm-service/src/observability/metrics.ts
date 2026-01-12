/**
 * Metrics tracking for LLM performance monitoring
 *
 * Best Practice: Track latency, token usage, costs, and error rates
 */

export interface MetricData {
  provider: string;
  model: string;
  status: "success" | "error" | "timeout" | "rate_limited";
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  errorCode?: string;
}

interface MetricDataWithTimestamp extends MetricData {
  timestamp: number;
}

class MetricsCollector {
  private metrics: MetricDataWithTimestamp[] = [];

  /**
   * Record a request metric
   */
  record(data: MetricData): void {
    this.metrics.push({
      ...data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get aggregated metrics for a time window
   */
  getAggregated(windowMs: number) {
    const now = Date.now();
    const cutoffTime = now - windowMs;

    // Filter metrics within the time window
    const windowMetrics = this.metrics.filter((m) => m.timestamp >= cutoffTime);

    if (windowMetrics.length === 0) {
      return undefined;
    }

    // Calculate aggregations
    const totalRequests = windowMetrics.length;
    const successfulRequests = windowMetrics.filter((m) => m.status === "success").length;
    const failedRequests = windowMetrics.filter((m) => m.status === "error").length;
    const rateLimitedRequests = windowMetrics.filter((m) => m.status === "rate_limited").length;
    const timeoutRequests = windowMetrics.filter((m) => m.status === "timeout").length;

    const successRate = totalRequests > 0 ? successfulRequests / totalRequests : 0;

    // Calculate latency stats (only for successful requests)
    const successfulLatencies = windowMetrics
      .filter((m) => m.status === "success")
      .map((m) => m.latencyMs);

    const avgLatencyMs =
      successfulLatencies.length > 0
        ? successfulLatencies.reduce((a, b) => a + b, 0) / successfulLatencies.length
        : 0;

    const p50LatencyMs =
      successfulLatencies.length > 0 ? this.percentile(successfulLatencies, 0.5) : 0;
    const p95LatencyMs =
      successfulLatencies.length > 0 ? this.percentile(successfulLatencies, 0.95) : 0;
    const p99LatencyMs =
      successfulLatencies.length > 0 ? this.percentile(successfulLatencies, 0.99) : 0;

    // Calculate token and cost stats
    const totalInputTokens = windowMetrics
      .filter((m) => m.inputTokens !== undefined)
      .reduce((sum, m) => sum + (m.inputTokens ?? 0), 0);

    const totalOutputTokens = windowMetrics
      .filter((m) => m.outputTokens !== undefined)
      .reduce((sum, m) => sum + (m.outputTokens ?? 0), 0);

    const totalCostUsd = windowMetrics
      .filter((m) => m.costUsd !== undefined)
      .reduce((sum, m) => sum + (m.costUsd ?? 0), 0);

    // Group by provider
    const byProvider = this.groupBy(windowMetrics, "provider");

    return {
      windowMs,
      totalRequests,
      successfulRequests,
      failedRequests,
      rateLimitedRequests,
      timeoutRequests,
      successRate,
      latency: {
        avgMs: avgLatencyMs,
        p50Ms: p50LatencyMs,
        p95Ms: p95LatencyMs,
        p99Ms: p99LatencyMs,
      },
      tokens: {
        totalInput: totalInputTokens,
        totalOutput: totalOutputTokens,
        total: totalInputTokens + totalOutputTokens,
      },
      totalCostUsd,
      byProvider,
    };
  }

  /**
   * Calculate percentile from sorted array
   */
  private percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)] ?? 0;
  }

  /**
   * Group metrics by a field
   */
  private groupBy(metrics: MetricDataWithTimestamp[], field: keyof MetricData) {
    const groups: Record<string, number> = {};
    for (const metric of metrics) {
      const key = String(metric[field]);
      groups[key] = (groups[key] || 0) + 1;
    }
    return groups;
  }
}

export const metricsCollector = new MetricsCollector();
