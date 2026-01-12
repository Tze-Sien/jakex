import { randomUUID, createHash } from "crypto"
import { GroqProvider, type GroqProviderConfig } from "./providers"
import { CircuitBreaker, RateLimiter, retryWithBackoff } from "./reliability"
import { cacheManager } from "./cache"
import { logger, metricsCollector } from "./observability"
import type { CompletionRequest, CompletionResult } from "./types"

export interface LLMClientConfig {
  groqApiKey: string
  groqModel?: string
  enableCache?: boolean
  cacheTtlMs?: number
  enableCircuitBreaker?: boolean
  enableRateLimiting?: boolean
}

/**
 * Generic LLM Client
 *
 * Provides infrastructure for LLM completions:
 * - Provider management (currently Groq only)
 * - Reliability patterns (circuit breaker, retry, rate limiting)
 * - Caching
 * - Observability (metrics, logging)
 *
 * Application layer should provide:
 * - System prompts
 * - User message formatting
 * - Output schemas
 */
export class LLMClient {
  private groqProvider: GroqProvider
  private circuitBreaker: CircuitBreaker
  private rateLimiter: RateLimiter
  private config: Required<LLMClientConfig>

  constructor(config: LLMClientConfig) {
    this.config = {
      groqModel: "openai/gpt-oss-120b", // Default to Qwen for better Chinese language support
      enableCache: true,
      cacheTtlMs: 3600000, // 1 hour
      enableCircuitBreaker: true,
      enableRateLimiting: true,
      ...config,
    }

    // Initialize Groq provider
    this.groqProvider = new GroqProvider({
      apiKey: this.config.groqApiKey,
      model: this.config.groqModel,
    } as GroqProviderConfig)

    // Initialize circuit breaker
    this.circuitBreaker = new CircuitBreaker("groq-provider", {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      halfOpenMaxAttempts: 3,
      monitoringWindow: 300000, // 5 minutes
    })

    // Initialize rate limiter (Groq: 30 requests per minute)
    this.rateLimiter = new RateLimiter("groq-provider", {
      maxTokens: 30,
      refillRate: 0.5, // 30 tokens per 60 seconds = 0.5 per second
      refillInterval: 1000,
    })
  }

  /**
   * Generic LLM completion with reliability patterns
   *
   * @param request - Completion request with system prompt, user message, and output schema
   * @returns Completion result with parsed output and metadata
   */
  async complete<TOutput>(
    request: CompletionRequest<TOutput>
  ): Promise<CompletionResult<TOutput>> {
    const traceId = randomUUID()

    logger.info("Starting LLM completion", {
      traceId,
      cacheKey: request.cacheKey,
    })

    try {
      // Check cache first (if enabled)
      if (this.config.enableCache) {
        const cacheKey = request.cacheKey ?? this.generateCacheKey(request)
        const cached = cacheManager.get(cacheKey)
        if (cached) {
          logger.info("Cache hit", { traceId, cacheKey })
          return cached as CompletionResult<TOutput>
        }
      }

      // Check if circuit breaker allows requests
      if (this.config.enableCircuitBreaker && this.circuitBreaker.isOpen()) {
        const error = new Error("Circuit breaker is OPEN, provider unavailable")
        logger.error("Circuit breaker open", { traceId, provider: "groq" }, error)
        throw error
      }

      // Acquire rate limit token
      if (this.config.enableRateLimiting) {
        await this.rateLimiter.acquire()
      }

      // Execute with retry logic
      const result = await this.executeWithRetry(request, traceId)

      // Store in cache
      if (this.config.enableCache) {
        const cacheKey = request.cacheKey ?? this.generateCacheKey(request)
        cacheManager.set(cacheKey, result)
      }

      // Record success metrics
      metricsCollector.record({
        provider: result.metadata.provider,
        model: result.metadata.model,
        status: "success",
        latencyMs: result.metadata.latencyMs,
        inputTokens: result.metadata.inputTokens,
        outputTokens: result.metadata.outputTokens,
        costUsd: result.metadata.costUsd,
      })

      if (this.config.enableCircuitBreaker) {
        this.circuitBreaker.recordSuccess()
      }

      logger.info("Completion completed successfully", {
        traceId,
        provider: result.metadata.provider,
        latencyMs: result.metadata.latencyMs,
        costUsd: result.metadata.costUsd,
      })

      return result
    } catch (error) {
      // Record failure
      if (this.config.enableCircuitBreaker) {
        this.circuitBreaker.recordFailure()
      }

      metricsCollector.record({
        provider: "groq",
        model: this.config.groqModel,
        status: "error",
        latencyMs: 0,
        errorCode: error instanceof Error ? error.message : "UNKNOWN",
      })

      logger.error("Completion failed", { traceId }, error as Error)
      throw error
    }
  }

  /**
   * Execute completion with retry logic
   */
  private async executeWithRetry<TOutput>(
    request: CompletionRequest<TOutput>,
    traceId: string
  ): Promise<CompletionResult<TOutput>> {
    let attemptNumber = 0

    const result = await retryWithBackoff(
      async () => {
        attemptNumber++
        logger.info("Executing completion", {
          traceId,
          provider: "groq",
          attemptNumber,
        })

        const response = await this.groqProvider.execute(
          request.systemPrompt,
          request.userMessage,
          request.outputSchema,
          {
            temperature: request.temperature,
            maxTokens: request.maxTokens,
            timeout: request.timeout,
          }
        )

        return {
          output: response.output,
          metadata: {
            ...response.metadata,
            traceId,
            attemptNumber,
            usedFallback: false,
          },
        }
      },
      {
        maxAttempts: 3,
        initialDelayMs: 1000,
        maxDelayMs: 30000,
        backoffMultiplier: 2,
      },
      (attempt, error) => {
        logger.warn("Retry attempt", {
          traceId,
          attempt,
          error: error.message,
        })
      }
    )

    return result
  }

  /**
   * Generate cache key from request
   */
  private generateCacheKey(request: CompletionRequest<unknown>): string {
    const data = `${request.systemPrompt}:${request.userMessage}`
    return createHash("sha256").update(data).digest("hex")
  }

  /**
   * Get current provider
   */
  getProvider(): "groq" {
    return this.groqProvider.getProviderName()
  }

  /**
   * Health check
   */
  async getHealth() {
    const groqHealth = await this.groqProvider.healthCheck()
    const circuitBreakerHealth = this.circuitBreaker.getHealth()
    const rateLimiterStatus = this.rateLimiter.getStatus()
    const cacheStats = cacheManager.getStats()

    return {
      groq: {
        healthy: groqHealth,
        circuitBreaker: circuitBreakerHealth,
        rateLimiter: rateLimiterStatus,
      },
      cache: cacheStats,
      overall: groqHealth && circuitBreakerHealth.state !== "OPEN",
    }
  }

  /**
   * Get metrics
   */
  getMetrics(windowMs: number = 300000) {
    return metricsCollector.getAggregated(windowMs)
  }

  /**
   * Reset circuit breaker manually
   */
  resetCircuitBreaker() {
    this.circuitBreaker.reset()
  }
}
