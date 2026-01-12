/**
 * @repo/llm-service - General-purpose LLM service abstraction
 *
 * Provides infrastructure for LLM completions:
 * - Provider management (Groq, OpenAI, etc.)
 * - Reliability patterns (circuit breaker, retry, rate limiting)
 * - Caching
 * - Observability (metrics, logging)
 *
 * Application layer should provide:
 * - System prompts
 * - User message formatting
 * - Output schemas
 */

// Main client
export { LLMClient, type LLMClientConfig } from "./client"

// Generic types
export type {
  CompletionRequest,
  CompletionResult,
  ResponseMetadata,
  LLMProvider,
  LLMModel,
} from "./types"

// Error types
export {
  LLMError,
  RateLimitError,
  TimeoutError,
  ValidationError,
} from "./types"
