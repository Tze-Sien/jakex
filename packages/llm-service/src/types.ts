import { z } from "zod"

// Provider types
export type LLMProvider = "groq"

export type LLMModel =
  | "openai/gpt-oss-120b"
  | "llama-3.1-8b-instant"
  | "qwen/qwen-2.5-32b-instruct"

// Input/Output schemas
export const AnalysisInputSchema = z.object({
  entityType: z.enum(["campaign", "adSet", "ad"]),
  entityId: z.string().uuid(),
  reportId: z.string().uuid(),
  dataRangeStart: z.string().datetime(),
  dataRangeEnd: z.string().datetime(),

  // Optional business context for personalized advice
  businessContext: z
    .object({
      industry: z.string().optional(), // e.g., "电商", "餐饮", "美容", "教育"
      productType: z.string().optional(), // e.g., "护肤品", "服装", "食品"
      adType: z.string().optional(), // e.g., "促销广告", "品牌广告", "新品推广"
    })
    .optional(),

  // Performance metrics
  metrics: z.object({
    spend: z.number(),
    impressions: z.number(),
    clicks: z.number(),
    conversions: z.number(),
    ctr: z.number(),
    cpc: z.number(),
    cpm: z.number(),
    costPerConversion: z.number().nullable(),
    roas: z.number().nullable(),
  }),

  // Historical comparison (previous period)
  previousMetrics: z
    .object({
      spend: z.number(),
      impressions: z.number(),
      clicks: z.number(),
      conversions: z.number(),
      ctr: z.number(),
      cpc: z.number(),
      cpm: z.number(),
      costPerConversion: z.number().nullable(),
      roas: z.number().nullable(),
    })
    .optional(),

  // Entity-specific context
  campaign: z
    .object({
      name: z.string(),
      objective: z.string(),
      dailyBudget: z.number().nullable(),
      lifetimeBudget: z.number().nullable(),
      status: z.string(),
    })
    .optional(),

  adSet: z
    .object({
      name: z.string(),
      optimizationGoal: z.string().nullable(),
      bidStrategy: z.string().nullable(),
      targeting: z.any(), // JSONB targeting data
      dailyBudget: z.number().nullable(),
      lifetimeBudget: z.number().nullable(),
      status: z.string(),
    })
    .optional(),

  ad: z
    .object({
      name: z.string(),
      creativeType: z.string().nullable(),
      headline: z.string().nullable(),
      bodyText: z.string().nullable(),
      callToAction: z.string().nullable(),
      destinationUrl: z.string().nullable(),
      status: z.string(),
    })
    .optional(),
})

export type AnalysisInput = z.infer<typeof AnalysisInputSchema>

export const RecommendationSchema = z.object({
  type: z.enum(["budget", "targeting", "creative", "bidding", "scheduling", "portfolio", "data", "tracking"]), // Added "portfolio", "data", and "tracking"
  priority: z.enum(["high", "medium", "low"]),
  title: z.string(),
  description: z.string(),
  actionableSteps: z.array(z.string()).min(1),
  expectedImpact: z.string(),
  affectedEntityType: z.enum(["account", "campaign", "adSet", "ad"]).default("account"), // Default to "account", making it effectively optional
  affectedEntityId: z.string().uuid().optional(), // Optional for account-level recommendations
})

export type Recommendation = z.infer<typeof RecommendationSchema>

export const AnalysisOutputSchema = z.object({
  overallAssessment: z.string(),
  keyFindings: z.array(z.string()).min(3).max(6),
  performanceAnalysis: z.string(),
  creativeAnalysis: z.string().nullable(),
  targetingAnalysis: z.string().nullable(),
  practicalAdvice: z.string().nullable(), // 经验谈 - Colloquial practical advice in 白话文
  recommendations: z.array(RecommendationSchema),
  confidenceScore: z.number().min(0).max(1),
})

export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>

// Provider response metadata
export interface LLMResponseMetadata {
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

// Complete analysis result
export interface AnalysisResult {
  output: AnalysisOutput
  metadata: LLMResponseMetadata
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
