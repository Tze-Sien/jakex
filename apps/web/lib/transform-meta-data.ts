import type { MetaAd, MetaInsights, MetaCampaign } from "@repo/meta-api";
import type { AdReportCardProps } from "@/app/dashboard/components";

/**
 * Transforms META API data into the format expected by the AdReportCard component
 */
export function transformMetaAdToCardProps(
  ad: MetaAd,
  insights: MetaInsights,
  campaign: MetaCampaign
): Omit<AdReportCardProps, "id"> {
  // Calculate derived metrics
  const spend = parseFloat(insights.spend || "0");
  const impressions = parseInt(insights.impressions || "0");
  const clicks = parseInt(insights.clicks || "0");
  const conversions = getConversions(insights);

  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const roas = spend > 0 && conversions > 0 ? (conversions * 50) / spend : 0; // Assuming avg order value of $50

  // Calculate health score (0-100)
  const healthScore = calculateHealthScore({
    roas,
    ctr,
    cpc,
    status: ad.status || "PAUSED",
  });

  // Determine status
  const status = getAdStatus(healthScore, roas);

  // Determine trend (simplified - in production, compare with historical data)
  const trend = getTrend(ctr, roas);

  // Generate AI summary
  const aiSummary = generateAISummary(status, roas, ctr, healthScore);

  // Generate recommendations
  const recommendations = generateRecommendations(status, roas, ctr, cpc, ad.status || "PAUSED");

  return {
    adName: ad.name || "Untitled Ad",
    campaignName: campaign.name || "Untitled Campaign",
    adImage: ad.creative?.image_url,
    metrics: {
      roas,
      ctr,
      cpc,
      cpm,
      spend,
      conversions,
      impressions,
      clicks,
    },
    healthScore,
    status,
    trend,
    aiSummary,
    recommendations,
  };
}

/**
 * Extract conversions from insights actions
 */
function getConversions(insights: MetaInsights): number {
  if (!insights.actions) return 0;

  const conversionActions = insights.actions.filter(
    (action) =>
      action.action_type === "purchase" ||
      action.action_type === "offsite_conversion.fb_pixel_purchase"
  );

  return conversionActions.reduce((sum, action) => sum + parseInt(action.value || "0"), 0);
}

/**
 * Calculate health score based on key metrics
 */
function calculateHealthScore(params: {
  roas: number;
  ctr: number;
  cpc: number;
  status: string;
}): number {
  const { roas, ctr, cpc, status } = params;

  // Base score components
  let score = 0;

  // ROAS contribution (max 40 points)
  if (roas >= 4) score += 40;
  else if (roas >= 3) score += 35;
  else if (roas >= 2) score += 25;
  else if (roas >= 1) score += 15;
  else score += 5;

  // CTR contribution (max 30 points)
  if (ctr >= 3) score += 30;
  else if (ctr >= 2) score += 25;
  else if (ctr >= 1) score += 15;
  else score += 5;

  // CPC contribution (max 20 points - lower is better)
  if (cpc < 0.5) score += 20;
  else if (cpc < 1) score += 15;
  else if (cpc < 1.5) score += 10;
  else score += 5;

  // Status contribution (max 10 points)
  if (status === "ACTIVE") score += 10;
  else if (status === "PAUSED") score += 5;

  return Math.min(100, Math.max(0, score));
}

/**
 * Determine ad status based on health score and ROAS
 */
function getAdStatus(
  healthScore: number,
  roas: number
): "performer" | "attention" | "critical" {
  if (healthScore >= 70 && roas >= 2.5) return "performer";
  if (healthScore >= 40 || roas >= 1) return "attention";
  return "critical";
}

/**
 * Determine trend (simplified version)
 */
function getTrend(ctr: number, roas: number): "up" | "down" | "stable" {
  // In production, this would compare with historical data
  // For now, use simple heuristics
  if (ctr >= 2.5 && roas >= 3) return "up";
  if (ctr < 1 || roas < 1) return "down";
  return "stable";
}

/**
 * Generate AI summary based on performance
 */
function generateAISummary(
  status: "performer" | "attention" | "critical",
  roas: number,
  ctr: number,
  healthScore: number
): string {
  if (status === "performer") {
    return `This ad is performing exceptionally well with a ${roas.toFixed(1)}x ROAS and ${ctr.toFixed(1)}% CTR. The audience is responding positively to the creative, and engagement rates are above industry benchmarks. Health score: ${healthScore}/100.`;
  }

  if (status === "attention") {
    return `This ad shows moderate performance with a ${roas.toFixed(1)}x ROAS. The CTR of ${ctr.toFixed(1)}% suggests room for improvement in creative engagement or audience targeting. Consider testing variations. Health score: ${healthScore}/100.`;
  }

  return `This ad is underperforming with a ${roas.toFixed(1)}x ROAS and ${ctr.toFixed(1)}% CTR. Immediate action is recommended to prevent budget waste. The creative may need refreshing, or targeting may need adjustment. Health score: ${healthScore}/100.`;
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  status: "performer" | "attention" | "critical",
  roas: number,
  ctr: number,
  cpc: number,
  adStatus: string
): string[] {
  const recommendations: string[] = [];

  if (status === "performer") {
    recommendations.push(
      `Increase budget by 20-30% to scale this high performer`,
      `Consider creating lookalike audiences based on converters`,
      `Monitor creative fatigue - refresh if CTR drops below ${(ctr * 0.8).toFixed(1)}%`
    );
  } else if (status === "attention") {
    recommendations.push(
      `Test 2-3 new creative variations to improve engagement`,
      `Review and refine audience targeting parameters`,
      `Consider A/B testing different ad copy or CTAs`
    );
  } else {
    if (adStatus === "ACTIVE") {
      recommendations.push(`Pause this ad immediately to stop budget waste`);
    }
    recommendations.push(
      `Analyze top performers and apply those insights here`,
      `Review product-market fit for this audience`,
      `Consider reallocating budget to better performing ads`
    );
  }

  // CPC-specific recommendation
  if (cpc > 1.5) {
    recommendations.push(`CPC is high at $${cpc.toFixed(2)} - optimize targeting or creative`);
  }

  return recommendations.slice(0, 3); // Limit to 3 recommendations
}
