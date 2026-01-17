"use server";

import { db } from "@repo/database";
import {
  aiAnalyses,
  reports,
  insights,
} from "@repo/database/schema";
import { eq, desc, and } from "drizzle-orm";
import { LLMClient } from "@repo/llm-service";
import { MetaAdsAnalysisClient } from "@/lib/llm/meta-ads/client";
import { withAuth } from "@repo/auth/server";

/**
 * Performs AI analysis on synced ad data
 * Analyzes all campaigns, ad sets, and ads from a report
 * Stores the analysis results in the database
 *
 * @param reportId - The report ID to analyze
 * @param userId - The user's ID
 * @returns Analysis result with ID and status
 */
export async function performAIAnalysis(reportId: string, userId: string) {
  try {
    // Validate GROQ_API_KEY is configured
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY is not configured in environment variables");
    }

    // Get the report
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    // Get all insights for this report
    const allInsights = await db
      .select()
      .from(insights)
      .where(eq(insights.reportId, reportId));

    if (allInsights.length === 0) {
      throw new Error(`No insights found for report ${reportId}`);
    }

    // Group insights by time range and aggregate
    const timeRanges = ["today", "last_3d", "last_7d"];
    const analysisData: Record<string, any> = {};

    for (const timeRange of timeRanges) {
      const timeRangeInsights = allInsights.filter(
        (i) => i.timeRange === timeRange
      );

      // Calculate totals
      const totals = {
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      };

      timeRangeInsights.forEach((insight) => {
        totals.spend += Number(insight.spend) || 0;
        totals.impressions += Number(insight.impressions) || 0;
        totals.clicks += Number(insight.clicks) || 0;
        totals.conversions += Number(insight.conversions) || 0;
      });

      // Calculate derived metrics
      const ctr =
        totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
      const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
      const cpm =
        totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;
      const costPerConversion =
        totals.conversions > 0 ? totals.spend / totals.conversions : null;

      analysisData[timeRange] = {
        ...totals,
        ctr,
        cpc,
        cpm,
        costPerConversion,
        roas: null, // Would need revenue data
      };
    }

    // Initialize generic LLM Client
    const llmClient = new LLMClient({
      groqApiKey,
      groqModel: "openai/gpt-oss-120b", // Qwen excels at Mandarin Chinese output
      enableCache: true,
      enableCircuitBreaker: true,
      enableRateLimiting: true,
    });

    // Initialize Meta Ads-specific client wrapper with prompt version
    const metaAdsClient = new MetaAdsAnalysisClient(llmClient, "v1.0.0");

    // Use the "last_7d" data as the primary metrics
    const primaryMetrics = analysisData.last_7d;
    const previousMetrics = analysisData.last_3d; // Use as comparison

    // Create analysis input for Meta Ads client
    const llmInput = {
      entityType: "campaign" as const, // Use campaign type for account-level
      entityId: reportId, // Use report ID as pseudo-entity
      reportId,
      dataRangeStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      dataRangeEnd: new Date().toISOString(),
      metrics: {
        spend: primaryMetrics.spend,
        impressions: primaryMetrics.impressions,
        clicks: primaryMetrics.clicks,
        conversions: primaryMetrics.conversions,
        ctr: primaryMetrics.ctr,
        cpc: primaryMetrics.cpc,
        cpm: primaryMetrics.cpm,
        costPerConversion: primaryMetrics.costPerConversion,
        roas: primaryMetrics.roas,
      },
      previousMetrics: {
        spend: previousMetrics.spend,
        impressions: previousMetrics.impressions,
        clicks: previousMetrics.clicks,
        conversions: previousMetrics.conversions,
        ctr: previousMetrics.ctr,
        cpc: previousMetrics.cpc,
        cpm: previousMetrics.cpm,
        costPerConversion: previousMetrics.costPerConversion,
        roas: previousMetrics.roas,
      },
    };

    // Call Meta Ads-specific analyzer
    const analysisResult = await metaAdsClient.analyze(llmInput);

    // Store analysis in database
    const [aiAnalysis] = await db
      .insert(aiAnalyses)
      .values({
        reportId,
        userId,
        overallAssessment: analysisResult.output.overallAssessment,
        keyFindings: analysisResult.output.keyFindings,
        performanceAnalysis: analysisResult.output.performanceAnalysis,
        creativeAnalysis: analysisResult.output.creativeAnalysis || null,
        targetingAnalysis: analysisResult.output.targetingAnalysis || null,
        practicalAdvice: analysisResult.output.practicalAdvice || null,
        recommendations: analysisResult.output.recommendations,
        confidenceScore: analysisResult.output.confidenceScore.toString(),
        llmProvider: analysisResult.metadata.provider,
        llmModel: analysisResult.metadata.model,
        inputTokens: analysisResult.metadata.inputTokens,
        outputTokens: analysisResult.metadata.outputTokens,
        latencyMs: analysisResult.metadata.latencyMs,
        costUsd: analysisResult.metadata.costUsd.toString(),
        status: "completed",
      })
      .returning();

    return {
      success: true,
      analysisId: aiAnalysis.id,
      reportId,
      overallAssessment: aiAnalysis.overallAssessment,
      keyFindings: aiAnalysis.keyFindings,
      recommendations: aiAnalysis.recommendations,
    };
  } catch (error) {
    console.error("AI Analysis error:", error);

    // Store failed analysis
    try {
      await db.insert(aiAnalyses).values({
        reportId,
        userId,
        overallAssessment: "Analysis failed",
        keyFindings: [],
        performanceAnalysis: "Error occurred during analysis",
        recommendations: [],
        confidenceScore: "0",
        llmProvider: "groq",
        llmModel: "openai/gpt-oss-120b",
        status: "failed",
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    } catch (dbError) {
      console.error("Failed to save error to database:", dbError);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get AI analysis for a specific report
 */
export async function getAIAnalysis(reportId: string) {
  // Data Access Layer auth guard
  const auth = await withAuth();
  if (!auth.success) {
    return null;
  }

  // Verify report belongs to user (profile.id = auth.users.id)
  const [report] = await db
    .select()
    .from(reports)
    .where(and(eq(reports.id, reportId), eq(reports.userId, auth.user.id)))
    .limit(1);

  if (!report) {
    return null;
  }

  const [analysis] = await db
    .select()
    .from(aiAnalyses)
    .where(eq(aiAnalyses.reportId, reportId))
    .orderBy(desc(aiAnalyses.createdAt))
    .limit(1);

  return analysis;
}

/**
 * Get latest AI analysis for the current user
 */
export async function getLatestAIAnalysis() {
  // Data Access Layer auth guard
  const auth = await withAuth();
  if (!auth.success) {
    return null;
  }

  // profile.id = auth.users.id
  const [analysis] = await db
    .select()
    .from(aiAnalyses)
    .where(eq(aiAnalyses.userId, auth.user.id))
    .orderBy(desc(aiAnalyses.createdAt))
    .limit(1);

  return analysis;
}
