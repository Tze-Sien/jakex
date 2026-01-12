import { z } from "zod"

/**
 * Meta Ads-specific schemas for LLM analysis
 *
 * These types define the input and output structure for Meta Ads account analysis
 */

// Input schema for Meta Ads analysis
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

// Recommendation schema
export const RecommendationSchema = z.object({
  type: z.enum(["budget", "targeting", "creative", "bidding", "scheduling", "portfolio", "data", "tracking"]),
  priority: z.enum(["high", "medium", "low"]),
  title: z.string(),
  description: z.string(),
  actionableSteps: z.array(z.string()).min(1),
  expectedImpact: z.string(),
  affectedEntityType: z.enum(["account", "campaign", "adSet", "ad"]).default("account"),
  affectedEntityId: z.string().uuid().optional(),
})

export type Recommendation = z.infer<typeof RecommendationSchema>

// Output schema for Meta Ads analysis
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

// Complete analysis result
export interface AnalysisResult {
  output: AnalysisOutput
  metadata: {
    provider: string
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
}
