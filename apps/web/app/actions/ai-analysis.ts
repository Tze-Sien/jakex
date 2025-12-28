"use server";

import { db } from "@repo/database";
import {
  aiAnalyses,
  reports,
  insights,
  campaigns,
  adSets,
  ads,
} from "@repo/database/schema";
import { eq, desc } from "drizzle-orm";
import { LLMClient } from "@repo/llm-service";

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
    const analysisData: any = {};

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

    // Get campaign, ad set, and ad details
    const campaignInsights = allInsights.filter((i) => i.campaignId !== null);
    const adSetInsights = allInsights.filter((i) => i.adSetId !== null);
    const adInsights = allInsights.filter((i) => i.adId !== null);

    // Prepare comprehensive analysis input
    const analysisInput = {
      reportId,
      timeRanges: analysisData,
      campaigns: campaignInsights.map((i) => ({
        entityName: i.entityName,
        entityStatus: i.entityStatus,
        objective: i.campaignObjective,
        dailyBudget: i.campaignDailyBudget,
        lifetimeBudget: i.campaignLifetimeBudget,
        spend: Number(i.spend),
        impressions: Number(i.impressions),
        clicks: Number(i.clicks),
        conversions: Number(i.conversions),
        ctr: i.ctr ? parseFloat(i.ctr) : 0,
        cpc: Number(i.cpc) || 0,
        cpm: Number(i.cpm) || 0,
      })),
      adSets: adSetInsights.map((i) => ({
        entityName: i.entityName,
        entityStatus: i.entityStatus,
        optimizationGoal: i.adSetOptimizationGoal,
        bidStrategy: i.adSetBidStrategy,
        targeting: i.adSetTargeting,
        spend: Number(i.spend),
        impressions: Number(i.impressions),
        clicks: Number(i.clicks),
        conversions: Number(i.conversions),
        ctr: i.ctr ? parseFloat(i.ctr) : 0,
        cpc: Number(i.cpc) || 0,
        cpm: Number(i.cpm) || 0,
      })),
      ads: adInsights.map((i) => ({
        entityName: i.entityName,
        entityStatus: i.entityStatus,
        creativeType: i.adCreativeType,
        headline: i.adHeadline,
        bodyText: i.adBodyText,
        callToAction: i.adCallToAction,
        spend: Number(i.spend),
        impressions: Number(i.impressions),
        clicks: Number(i.clicks),
        conversions: Number(i.conversions),
        ctr: i.ctr ? parseFloat(i.ctr) : 0,
        cpc: Number(i.cpc) || 0,
        cpm: Number(i.cpm) || 0,
      })),
    };

    // Initialize LLM Client with Qwen for better Chinese language support
    const llmClient = new LLMClient({
      groqApiKey,
      groqModel: "openai/gpt-oss-120b", // Qwen excels at Mandarin Chinese output
      enableCache: true,
      enableCircuitBreaker: true,
      enableRateLimiting: true,
    });

    // Build prompt for account-level analysis
    const prompt = buildAccountAnalysisPrompt(analysisInput);

    // Call LLM for analysis (using account-level prompt)
    // Note: The LLMClient.analyze() expects a specific input format,
    // so we'll need to adapt our comprehensive data
    const startTime = Date.now();

    // For now, we'll create a simplified input that matches the expected format
    // Use the "last_7d" data as the primary metrics
    const primaryMetrics = analysisData.last_7d;
    const previousMetrics = analysisData.last_3d; // Use as comparison

    // Create a pseudo-entity for account-level analysis
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

    const analysisResult = await llmClient.analyze(llmInput);
    const latencyMs = Date.now() - startTime;

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
  const [analysis] = await db
    .select()
    .from(aiAnalyses)
    .where(eq(aiAnalyses.reportId, reportId))
    .orderBy(desc(aiAnalyses.createdAt))
    .limit(1);

  return analysis;
}

/**
 * Get latest AI analysis for a user
 */
export async function getLatestAIAnalysis(userId: string) {
  const [analysis] = await db
    .select()
    .from(aiAnalyses)
    .where(eq(aiAnalyses.userId, userId))
    .orderBy(desc(aiAnalyses.createdAt))
    .limit(1);

  return analysis;
}

/**
 * Build comprehensive account-level analysis prompt
 */
function buildAccountAnalysisPrompt(data: any): string {
  return `
You are an expert Meta Ads analyst. Analyze this advertising account's performance and provide actionable insights.

## Account Performance Overview

### Time Range Data:
- Today: ${JSON.stringify(data.timeRanges.today, null, 2)}
- Last 3 Days: ${JSON.stringify(data.timeRanges.last_3d, null, 2)}
- Last 7 Days: ${JSON.stringify(data.timeRanges.last_7d, null, 2)}

### Campaigns (${data.campaigns.length} total):
${data.campaigns
  .map(
    (c: any, i: number) => `
${i + 1}. ${c.entityName} (${c.entityStatus})
   - Objective: ${c.objective}
   - Budget: ${c.dailyBudget ? `$${c.dailyBudget}/day` : `$${c.lifetimeBudget} lifetime`}
   - Spend: $${c.spend} | Impressions: ${c.impressions} | Clicks: ${c.clicks}
   - CTR: ${c.ctr.toFixed(2)}% | CPC: $${c.cpc.toFixed(2)} | CPM: $${c.cpm.toFixed(2)}
`
  )
  .join("\n")}

### Ad Sets (${data.adSets.length} total):
${data.adSets
  .slice(0, 5)
  .map(
    (as: any, i: number) => `
${i + 1}. ${as.entityName} (${as.entityStatus})
   - Optimization: ${as.optimizationGoal}
   - Spend: $${as.spend} | CTR: ${as.ctr.toFixed(2)}% | CPC: $${as.cpc.toFixed(2)}
`
  )
  .join("\n")}

### Ads (${data.ads.length} total):
${data.ads
  .slice(0, 5)
  .map(
    (ad: any, i: number) => `
${i + 1}. ${ad.entityName} (${ad.entityStatus})
   - Creative: ${ad.creativeType} | CTA: ${ad.callToAction}
   - Headline: ${ad.headline}
   - Spend: $${ad.spend} | CTR: ${ad.ctr.toFixed(2)}% | CPC: $${ad.cpc.toFixed(2)}
`
  )
  .join("\n")}

Please provide:
1. Overall assessment of account health (2-4 sentences)
2. 3-7 key findings from the data
3. Detailed performance analysis (300-600 words)
4. Creative analysis if applicable (200-400 words)
5. Targeting analysis if applicable (200-400 words)
6. 3-5 actionable recommendations with priority levels

Focus on:
- ROI and efficiency metrics
- Budget allocation opportunities
- Creative performance patterns
- Targeting optimization potential
- Quick wins vs long-term strategies
`;
}
