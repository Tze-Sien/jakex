import type { AnalysisInput } from "./schemas"

/**
 * Format Meta Ads analysis data for LLM consumption
 *
 * Converts structured analysis input into a human-readable prompt
 * that provides context for the LLM to analyze
 */
export function formatAnalysisInput(input: AnalysisInput): string {
  const metricChanges = input.previousMetrics
    ? {
        spendChange: ((input.metrics.spend - input.previousMetrics.spend) / input.previousMetrics.spend) * 100,
        impressionsChange:
          ((input.metrics.impressions - input.previousMetrics.impressions) / input.previousMetrics.impressions) *
          100,
        ctrChange: ((input.metrics.ctr - input.previousMetrics.ctr) / input.previousMetrics.ctr) * 100,
        roasChange:
          input.metrics.roas && input.previousMetrics.roas
            ? ((input.metrics.roas - input.previousMetrics.roas) / input.previousMetrics.roas) * 100
            : null,
      }
    : null

  return `Analyze the following ${input.entityType} performance data:

**Entity:** ${input.entityType === "campaign" ? input.campaign?.name : input.entityType === "adSet" ? input.adSet?.name : input.ad?.name}

**Time Period:** ${input.dataRangeStart} to ${input.dataRangeEnd}

${input.businessContext ? `**Business Context:**
- Industry: ${input.businessContext.industry ?? "Not specified"}
- Product Type: ${input.businessContext.productType ?? "Not specified"}
- Ad Type: ${input.businessContext.adType ?? "Not specified"}` : ""}

**Current Metrics:**
- Spend: $${(input.metrics.spend / 100).toFixed(2)}
- Impressions: ${input.metrics.impressions.toLocaleString()}
- Clicks: ${input.metrics.clicks.toLocaleString()}
- CTR: ${input.metrics.ctr.toFixed(2)}%
- CPC: $${(input.metrics.cpc / 100).toFixed(2)}
- CPM: $${(input.metrics.cpm / 100).toFixed(2)}
- Conversions: ${input.metrics.conversions}
${input.metrics.costPerConversion ? `- Cost per Conversion: $${(input.metrics.costPerConversion / 100).toFixed(2)}` : ""}
${input.metrics.roas ? `- ROAS: ${input.metrics.roas.toFixed(2)}x` : ""}

${metricChanges ? `**Changes from Previous Period:**
- Spend: ${metricChanges.spendChange > 0 ? "+" : ""}${metricChanges.spendChange.toFixed(1)}%
- Impressions: ${metricChanges.impressionsChange > 0 ? "+" : ""}${metricChanges.impressionsChange.toFixed(1)}%
- CTR: ${metricChanges.ctrChange > 0 ? "+" : ""}${metricChanges.ctrChange.toFixed(1)}%
${metricChanges.roasChange !== null ? `- ROAS: ${metricChanges.roasChange > 0 ? "+" : ""}${metricChanges.roasChange.toFixed(1)}%` : ""}` : ""}

${input.campaign ? `**Campaign Context:**
- Objective: ${input.campaign.objective}
- Daily Budget: ${input.campaign.dailyBudget ? `$${(input.campaign.dailyBudget / 100).toFixed(2)}` : "Not set"}
- Lifetime Budget: ${input.campaign.lifetimeBudget ? `$${(input.campaign.lifetimeBudget / 100).toFixed(2)}` : "Not set"}
- Status: ${input.campaign.status}` : ""}

${input.adSet ? `**Ad Set Context:**
- Optimization Goal: ${input.adSet.optimizationGoal ?? "Not set"}
- Bid Strategy: ${input.adSet.bidStrategy ?? "Not set"}
- Daily Budget: ${input.adSet.dailyBudget ? `$${(input.adSet.dailyBudget / 100).toFixed(2)}` : "Not set"}
- Status: ${input.adSet.status}` : ""}

${input.ad ? `**Ad Creative:**
- Type: ${input.ad.creativeType ?? "Unknown"}
- Headline: ${input.ad.headline ?? "N/A"}
- Body Text: ${input.ad.bodyText ?? "N/A"}
- Call to Action: ${input.ad.callToAction ?? "N/A"}
- Status: ${input.ad.status}` : ""}

Provide a comprehensive analysis with specific, actionable recommendations.`
}
