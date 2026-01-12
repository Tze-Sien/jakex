/**
 * Generic cache for LLM completions
 *
 * Caches completion results to reduce redundant LLM calls and costs
 * Cache key provided by caller (usually hash of input data)
 */

export class CacheManager {
  private cache: Map<string, { result: unknown; expiresAt: number }> = new Map()
  private ttlMs: number
  private cleanupTimer?: ReturnType<typeof setInterval>

  constructor(ttlMs: number = 3600000) {
    // 1 hour default TTL
    this.ttlMs = ttlMs
    this.startCleanup()
  }

  /**
   * Get cached result if available and not expired
   */
  get(cacheKey: string): unknown | null {
    const cached = this.cache.get(cacheKey)

    if (!cached) return null

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(cacheKey)
      return null
    }

    console.log(`[Cache] HIT for key: ${cacheKey.substring(0, 8)}...`)
    return cached.result
  }

  /**
   * Store result in cache
   */
  set(cacheKey: string, result: unknown): void {
    this.cache.set(cacheKey, {
      result,
      expiresAt: Date.now() + this.ttlMs,
    })
    console.log(`[Cache] SET for key: ${cacheKey.substring(0, 8)}...`)
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      ttlMs: this.ttlMs,
    }
  }

  /**
   * Start background cleanup of expired entries
   */
  private startCleanup() {
    // Run cleanup every 5 minutes
    this.cleanupTimer = setInterval(() => {
      const now = Date.now()
      let expiredCount = 0

      for (const [key, value] of this.cache.entries()) {
        if (now > value.expiresAt) {
          this.cache.delete(key)
          expiredCount++
        }
      }

      if (expiredCount > 0) {
        console.log(`[Cache] Cleaned up ${expiredCount} expired entries`)
      }
    }, 300000) // 5 minutes

    // Ensure timer doesn't prevent process exit
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref()
    }
  }

  /**
   * Stop background cleanup (for testing or shutdown)
   */
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }
}

export const cacheManager = new CacheManager()
