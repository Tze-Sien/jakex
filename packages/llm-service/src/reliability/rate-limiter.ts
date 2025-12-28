/**
 * Token bucket rate limiter to respect provider limits
 *
 * Best Practice: Implement client-side rate limiting to avoid hitting API limits
 */

export interface RateLimiterConfig {
  maxTokens: number // Maximum requests allowed
  refillRate: number // Tokens per second
  refillInterval: number // Ms between refills
}

export class RateLimiter {
  private tokens: number
  private lastRefillTime: number
  private refillTimer?: ReturnType<typeof setInterval>

  constructor(
    private name: string,
    private config: RateLimiterConfig
  ) {
    this.tokens = config.maxTokens
    this.lastRefillTime = Date.now()
    this.startRefill()
  }

  /**
   * Try to consume a token for a request
   */
  async tryAcquire(tokensNeeded: number = 1): Promise<boolean> {
    this.refill()

    if (this.tokens >= tokensNeeded) {
      this.tokens -= tokensNeeded
      return true
    }

    return false
  }

  /**
   * Wait until token is available
   */
  async acquire(tokensNeeded: number = 1): Promise<void> {
    while (!(await this.tryAcquire(tokensNeeded))) {
      const waitTime = ((tokensNeeded - this.tokens) / this.config.refillRate) * 1000
      await sleep(Math.min(waitTime, 1000)) // Wait max 1 second at a time
    }
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refill() {
    const now = Date.now()
    const timeSinceLastRefill = now - this.lastRefillTime
    const tokensToAdd = (timeSinceLastRefill / 1000) * this.config.refillRate

    this.tokens = Math.min(this.tokens + tokensToAdd, this.config.maxTokens)
    this.lastRefillTime = now
  }

  /**
   * Start periodic refill
   */
  private startRefill() {
    this.refillTimer = setInterval(() => {
      this.refill()
    }, this.config.refillInterval)
  }

  /**
   * Stop rate limiter
   */
  stop() {
    if (this.refillTimer) {
      clearInterval(this.refillTimer)
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    this.refill()
    return {
      availableTokens: Math.floor(this.tokens),
      maxTokens: this.config.maxTokens,
      utilizationPercent: ((this.config.maxTokens - this.tokens) / this.config.maxTokens) * 100,
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
