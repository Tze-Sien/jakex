/**
 * Metrics tracking for LLM performance monitoring
 *
 * Best Practice: Track latency, token usage, costs, and error rates
 */

export interface MetricData {
  provider: string
  model: string
  status: "success" | "error" | "timeout" | "rate_limited"
  latencyMs: number
  inputTokens?: number
  outputTokens?: number
  costUsd?: number
  errorCode?: string
}

interface MetricDataWithTimestamp extends MetricData {
  timestamp: number
}

class MetricsCollector {
  private metrics: MetricDataWithTimestamp[] = []

  /**
   * Record a request metric
   */
  record(metric: MetricData) {
    this.metrics.push({
      ...metric,
      timestamp: Date.now(),
    })

    // Keep only last 10,000 metrics in memory
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-10000)
    }

    // In production, send to metrics service (e.g., Prometheus, Datadog)
    console.log(`[Metrics] ${metric.provider} - ${metric.status} - ${metric.latencyMs}ms`)
  }

  /**
   * Get aggregated metrics for a time window
   */
  getAggregated(windowMs: number = 300000): {
    byProvider: Record<
      string,
      {
        count: number
        successRate: number
        avgLatencyMs: number
        p95LatencyMs: number
        totalCost: number
        errorRate: number
      }
    >
  } {
    const now = Date.now()
    const recentMetrics = this.metrics.filter((m) => now - m.timestamp < windowMs)

    const byProvider: Record<
      string,
      {
        count: number
        successes: number
        errors: number
        latencies: number[]
        totalCost: number
      }
    > = {}

    for (const metric of recentMetrics) {
      if (!byProvider[metric.provider]) {
        byProvider[metric.provider] = {
          count: 0,
          successes: 0,
          errors: 0,
          latencies: [],
          totalCost: 0,
        }
      }

      const providerStats = byProvider[metric.provider]!
      providerStats.count++
      if (metric.status === "success") providerStats.successes++
      if (metric.status === "error") providerStats.errors++
      providerStats.latencies.push(metric.latencyMs)
      providerStats.totalCost += metric.costUsd ?? 0
    }

    // Calculate aggregates
    const result: Record<string, any> = {}
    for (const [provider, stats] of Object.entries(byProvider)) {
      const latencies = stats.latencies.sort((a, b) => a - b)
      const p95Index = Math.floor(latencies.length * 0.95)

      result[provider] = {
        count: stats.count,
        successRate: stats.count > 0 ? stats.successes / stats.count : 0,
        avgLatencyMs: latencies.reduce((sum, l) => sum + l, 0) / latencies.length,
        p95LatencyMs: latencies[p95Index] ?? 0,
        totalCost: stats.totalCost,
        errorRate: stats.count > 0 ? stats.errors / stats.count : 0,
      }
    }

    return { byProvider: result }
  }
}

export const metricsCollector = new MetricsCollector()
