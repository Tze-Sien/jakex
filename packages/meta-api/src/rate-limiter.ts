/**
 * Token Bucket Rate Limiter for Meta API
 *
 * Meta API Rate Limits (as of 2025):
 * - 200 calls per hour per user per app (default)
 * - Can vary by app tier and permissions
 *
 * This implementation uses a token bucket algorithm to prevent rate limit errors.
 * We use conservative limits: 50 tokens max, refilling at 0.05 tokens/sec (~180 calls/hour)
 */

export class MetaApiRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per millisecond
  private readonly acquireWaitMs: number;

  constructor(
    maxTokens = 50,
    refillPerSecond = 0.05, // ~180 calls per hour
    acquireWaitMs = 100
  ) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
    this.refillRate = refillPerSecond / 1000; // convert to per ms
    this.acquireWaitMs = acquireWaitMs;
  }

  /**
   * Refill tokens based on time elapsed since last refill
   */
  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Wait until a token is available, then consume it
   * @returns Promise that resolves when token is acquired
   */
  async acquire(): Promise<void> {
    while (true) {
      this.refill();

      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }

      // Calculate wait time needed
      const tokensNeeded = 1 - this.tokens;
      const waitMs = Math.max(
        this.acquireWaitMs,
        Math.ceil(tokensNeeded / this.refillRate)
      );

      await this.sleep(waitMs);
    }
  }

  /**
   * Handle a rate limit response from Meta API
   * Depletes all tokens and waits for the specified duration
   * @param retryAfterSeconds - Duration from Meta's response header (default 5 minutes)
   */
  async handleRateLimit(retryAfterSeconds = 300): Promise<void> {
    console.warn(
      `Meta API rate limit hit. Waiting ${retryAfterSeconds} seconds before retry.`
    );

    // Deplete all tokens to prevent further requests
    this.tokens = 0;
    this.lastRefill = Date.now() + retryAfterSeconds * 1000;

    // Wait for the specified duration
    await this.sleep(retryAfterSeconds * 1000);
  }

  /**
   * Get current token count (for monitoring/debugging)
   */
  getTokenCount(): number {
    this.refill();
    return this.tokens;
  }

  /**
   * Reset the rate limiter to full capacity
   */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Singleton rate limiter instances per ad account
 * This ensures rate limiting is properly scoped per account
 */
const rateLimiters = new Map<string, MetaApiRateLimiter>();

/**
 * Get or create a rate limiter for a specific ad account
 * @param adAccountId - The Meta ad account ID
 * @returns Rate limiter instance for this account
 */
export function getRateLimiter(adAccountId: string): MetaApiRateLimiter {
  if (!rateLimiters.has(adAccountId)) {
    rateLimiters.set(adAccountId, new MetaApiRateLimiter());
  }
  return rateLimiters.get(adAccountId)!;
}

/**
 * Clear rate limiter for a specific account (useful for testing)
 */
export function clearRateLimiter(adAccountId: string): void {
  rateLimiters.delete(adAccountId);
}

/**
 * Clear all rate limiters (useful for testing)
 */
export function clearAllRateLimiters(): void {
  rateLimiters.clear();
}
