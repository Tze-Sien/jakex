/**
 * Retry logic with exponential backoff for transient failures
 *
 * Best Practice: Use retries for transient errors (network, rate limits),
 * but fail fast for persistent errors (invalid input, auth failure)
 */

export interface RetryConfig {
  maxAttempts: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  retryableStatusCodes: number[]
  retryableErrorCodes: string[]
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrorCodes: ["TIMEOUT", "RATE_LIMIT", "SERVER_ERROR", "NETWORK_ERROR"],
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  const mergedConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: Error

  for (let attempt = 1; attempt <= mergedConfig.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Check if error is retryable
      const isRetryable = isRetryableError(error, mergedConfig)

      if (!isRetryable || attempt === mergedConfig.maxAttempts) {
        throw error
      }

      // Calculate delay with exponential backoff + jitter
      const delay = Math.min(
        mergedConfig.initialDelayMs * Math.pow(mergedConfig.backoffMultiplier, attempt - 1),
        mergedConfig.maxDelayMs
      )
      const jitter = Math.random() * 0.3 * delay // ±30% jitter to prevent thundering herd
      const finalDelay = delay + jitter

      console.log(
        `[Retry] Attempt ${attempt}/${mergedConfig.maxAttempts} failed, retrying in ${finalDelay.toFixed(0)}ms...`
      )

      if (onRetry) {
        onRetry(attempt, error as Error)
      }

      await sleep(finalDelay)
    }
  }

  throw lastError!
}

function isRetryableError(error: unknown, config: RetryConfig): boolean {
  if (!error || typeof error !== "object") return false

  // Check status code
  if ("statusCode" in error && typeof error.statusCode === "number") {
    if (config.retryableStatusCodes.includes(error.statusCode)) {
      return true
    }
  }

  // Check error code
  if ("code" in error && typeof error.code === "string") {
    if (config.retryableErrorCodes.includes(error.code)) {
      return true
    }
  }

  // Check retryable flag
  if ("retryable" in error && typeof error.retryable === "boolean") {
    return error.retryable
  }

  return false
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
