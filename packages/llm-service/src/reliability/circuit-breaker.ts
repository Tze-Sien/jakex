/**
 * Circuit Breaker implementation to prevent cascading failures
 *
 * Best Practice: Stop traffic to failing providers before exhausting retries
 * Reference: https://portkey.ai/blog/retries-fallbacks-and-circuit-breakers-in-llm-apps/
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN"

export interface CircuitBreakerConfig {
  failureThreshold: number // Number of failures before opening circuit
  resetTimeout: number // Ms to wait before attempting half-open
  halfOpenMaxAttempts: number // Attempts allowed in half-open state
  monitoringWindow: number // Ms to track failure rate
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED"
  private failures: number[] = [] // Timestamps of failures
  private lastFailureTime: number = 0
  private halfOpenAttempts: number = 0

  constructor(
    private name: string,
    private config: CircuitBreakerConfig = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      halfOpenMaxAttempts: 3,
      monitoringWindow: 300000, // 5 minutes
    }
  ) {}

  /**
   * Check if circuit allows requests
   */
  isOpen(): boolean {
    if (this.state === "OPEN") {
      // Check if we should transition to half-open
      if (Date.now() - this.lastFailureTime >= this.config.resetTimeout) {
        this.state = "HALF_OPEN"
        this.halfOpenAttempts = 0
        console.log(`[CircuitBreaker:${this.name}] Transitioning to HALF_OPEN`)
        return false
      }
      return true
    }

    if (this.state === "HALF_OPEN") {
      if (this.halfOpenAttempts >= this.config.halfOpenMaxAttempts) {
        return true // Limit attempts in half-open
      }
    }

    return false
  }

  /**
   * Record successful call
   */
  recordSuccess() {
    if (this.state === "HALF_OPEN") {
      console.log(`[CircuitBreaker:${this.name}] Success in HALF_OPEN, transitioning to CLOSED`)
      this.state = "CLOSED"
      this.failures = []
      this.halfOpenAttempts = 0
    }
  }

  /**
   * Record failed call
   */
  recordFailure() {
    const now = Date.now()
    this.lastFailureTime = now
    this.failures.push(now)

    // Clean old failures outside monitoring window
    this.failures = this.failures.filter((timestamp) => now - timestamp < this.config.monitoringWindow)

    if (this.state === "HALF_OPEN") {
      this.halfOpenAttempts++
      if (this.halfOpenAttempts >= this.config.halfOpenMaxAttempts) {
        console.log(`[CircuitBreaker:${this.name}] HALF_OPEN attempts exhausted, transitioning to OPEN`)
        this.state = "OPEN"
      }
    } else if (this.failures.length >= this.config.failureThreshold) {
      console.log(
        `[CircuitBreaker:${this.name}] Failure threshold reached (${this.failures.length}), transitioning to OPEN`
      )
      this.state = "OPEN"
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state
  }

  /**
   * Get failure count in monitoring window
   */
  getFailureCount(): number {
    const now = Date.now()
    return this.failures.filter((timestamp) => now - timestamp < this.config.monitoringWindow).length
  }

  /**
   * Manually reset circuit
   */
  reset() {
    this.state = "CLOSED"
    this.failures = []
    this.halfOpenAttempts = 0
    console.log(`[CircuitBreaker:${this.name}] Manually reset to CLOSED`)
  }

  /**
   * Get health status
   */
  getHealth() {
    return {
      state: this.state,
      failureCount: this.getFailureCount(),
      lastFailureTime: this.lastFailureTime,
      halfOpenAttempts: this.halfOpenAttempts,
    }
  }
}
