/**
 * Analysis cache to reduce redundant LLM calls
 *
 * Best Practice: Cache similar analyses for 1 hour to reduce costs
 * Cache key = hash(entityId + dataRangeStart + dataRangeEnd + promptVersion)
 */

import { createHash } from "crypto"
import type { AnalysisInput, AnalysisResult } from "../types"

export class CacheManager {
  private cache: Map<string, { result: AnalysisResult; expiresAt: number }> = new Map()
  private ttlMs: number
  private cleanupTimer?: ReturnType<typeof setInterval>

  constructor(ttlMs: number = 3600000) {
    // 1 hour default TTL
    this.ttlMs = ttlMs
    this.startCleanup()
  }

  /**
   * Generate cache key from input
   */
  private getCacheKey(input: AnalysisInput, promptVersion: string): string {
    const keyData = {
      entityId: input.entityId,
      dataRangeStart: input.dataRangeStart,
      dataRangeEnd: input.dataRangeEnd,
      promptVersion,
    }

    return createHash("sha256").update(JSON.stringify(keyData)).digest("hex")
  }

  /**
   * Get cached result if available and not expired
   */
  get(input: AnalysisInput, promptVersion: string): AnalysisResult | null {
    const key = this.getCacheKey(input, promptVersion)
    const cached = this.cache.get(key)

    if (!cached) return null

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key)
      return null
    }

    console.log(`[Cache] HIT for ${input.entityType}:${input.entityId}`)
    return cached.result
  }

  /**
   * Store result in cache
   */
  set(input: AnalysisInput, promptVersion: string, result: AnalysisResult) {
    const key = this.getCacheKey(input, promptVersion)
    this.cache.set(key, {
      result,
      expiresAt: Date.now() + this.ttlMs,
    })
    console.log(`[Cache] SET for ${input.entityType}:${input.entityId}`)
  }

  /**
   * Clear all cached entries
   */
  clear() {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now()
    const validEntries = Array.from(this.cache.values()).filter((entry) => now <= entry.expiresAt)

    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: this.cache.size - validEntries.length,
    }
  }

  /**
   * Periodic cleanup of expired entries
   */
  private startCleanup() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key)
        }
      }
    }, 300000) // Clean every 5 minutes
  }

  /**
   * Stop the cache manager
   */
  stop() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
  }
}

export const cacheManager = new CacheManager()
