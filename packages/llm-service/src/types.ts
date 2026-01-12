import { z } from "zod"

// Provider types
export type LLMProvider = "groq"

export type LLMModel =
  | "openai/gpt-oss-120b"
  | "llama-3.1-8b-instant"
  | "qwen/qwen-2.5-32b-instruct"

// Generic completion request/response types
export interface CompletionRequest<TOutput = unknown> {
  systemPrompt: string
  userMessage: string
  outputSchema: z.ZodType<TOutput>
  cacheKey?: string
  temperature?: number
  maxTokens?: number
  timeout?: number
}

export interface CompletionResult<TOutput = unknown> {
  output: TOutput
  metadata: ResponseMetadata
}

// Provider response metadata
export interface ResponseMetadata {
  provider: LLMProvider
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  latencyMs: number
  costUsd: number
  traceId: string
  attemptNumber: number
  usedFallback: boolean
}

// Error types
export class LLMError extends Error {
  constructor(
    message: string,
    public provider: LLMProvider,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = "LLMError"
  }
}

export class RateLimitError extends LLMError {
  retryAfter?: number

  constructor(provider: LLMProvider, retryAfter?: number) {
    super(`Rate limit exceeded for ${provider}`, provider, "RATE_LIMIT", 429, true)
    this.retryAfter = retryAfter
  }
}

export class TimeoutError extends LLMError {
  constructor(provider: LLMProvider, timeoutMs: number) {
    super(`Request timeout after ${timeoutMs}ms`, provider, "TIMEOUT", 408, true)
  }
}

export class ValidationError extends LLMError {
  constructor(provider: LLMProvider, message: string) {
    super(`Output validation failed: ${message}`, provider, "VALIDATION_ERROR", 422, false)
  }
}
