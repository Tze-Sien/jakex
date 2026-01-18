/**
 * Insights Query Service
 *
 * Aggregates atomic daily insights into requested time ranges.
 * Instead of storing redundant aggregated data, we compute it on-demand from daily values.
 */

import { db } from '@repo/database';
import { dailyInsights } from '@repo/database/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export interface AggregatedInsights {
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  costPerConversion: number;
  dateStart: string;
  dateStop: string;
  daysIncluded: number;
}

export interface InsightsQueryParams {
  adAccountId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  entityLevel?: 'account' | 'campaign' | 'adset' | 'ad';
  campaignId?: string;
  adSetId?: string;
  adId?: string;
}

/**
 * Calculate derived metrics from aggregated base metrics
 */
function calculateDerivedMetrics(data: {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
}): {
  ctr: number;
  cpc: number;
  cpm: number;
  costPerConversion: number;
} {
  const { totalSpend, totalImpressions, totalClicks, totalConversions } = data;

  return {
    ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
    cpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
    costPerConversion: totalConversions > 0 ? totalSpend / totalConversions : 0,
  };
}

/**
 * Get aggregated insights for a time range
 * Computes the aggregation from atomic daily data
 */
export async function getAggregatedInsights(
  params: InsightsQueryParams
): Promise<AggregatedInsights> {
  const {
    adAccountId,
    startDate,
    endDate,
    entityLevel,
    campaignId,
    adSetId,
    adId,
  } = params;

  // Build WHERE conditions
  const conditions = [
    eq(dailyInsights.adAccountId, adAccountId),
    gte(dailyInsights.date, startDate),
    lte(dailyInsights.date, endDate),
  ];

  if (entityLevel) {
    conditions.push(eq(dailyInsights.entityLevel, entityLevel));
  }

  if (campaignId) {
    conditions.push(eq(dailyInsights.campaignId, campaignId));
  }

  if (adSetId) {
    conditions.push(eq(dailyInsights.adSetId, adSetId));
  }

  if (adId) {
    conditions.push(eq(dailyInsights.adId, adId));
  }

  // Query aggregated metrics
  const result = await db
    .select({
      totalSpend: sql<number>`COALESCE(SUM(${dailyInsights.spend}), 0)`,
      totalImpressions: sql<number>`COALESCE(SUM(${dailyInsights.impressions}), 0)`,
      totalClicks: sql<number>`COALESCE(SUM(${dailyInsights.clicks}), 0)`,
      totalReach: sql<number>`COALESCE(SUM(${dailyInsights.reach}), 0)`,
      totalConversions: sql<number>`COALESCE(SUM(${dailyInsights.conversions}), 0)`,
      totalConversionValue: sql<number>`COALESCE(SUM(${dailyInsights.conversionValue}), 0)`,
      daysIncluded: sql<number>`COUNT(DISTINCT ${dailyInsights.date})`,
    })
    .from(dailyInsights)
    .where(and(...conditions));

  const data = result[0];

  // Calculate derived metrics
  const derived = calculateDerivedMetrics({
    totalSpend: data.totalSpend,
    totalImpressions: data.totalImpressions,
    totalClicks: data.totalClicks,
    totalConversions: data.totalConversions,
  });

  return {
    spend: data.totalSpend,
    impressions: data.totalImpressions,
    clicks: data.totalClicks,
    reach: data.totalReach,
    conversions: data.totalConversions,
    conversionValue: data.totalConversionValue,
    ctr: derived.ctr,
    cpc: derived.cpc,
    cpm: derived.cpm,
    costPerConversion: derived.costPerConversion,
    dateStart: startDate,
    dateStop: endDate,
    daysIncluded: data.daysIncluded,
  };
}

/**
 * Get insights for multiple time ranges (e.g., last_3d, last_7d, last_30d)
 * Returns a map of range name to aggregated insights
 */
export async function getInsightsForTimeRanges(
  adAccountId: string,
  ranges: { name: string; startDate: string; endDate: string }[],
  options?: {
    entityLevel?: 'account' | 'campaign' | 'adset' | 'ad';
    campaignId?: string;
    adSetId?: string;
    adId?: string;
  }
): Promise<Record<string, AggregatedInsights>> {
  const results: Record<string, AggregatedInsights> = {};

  for (const range of ranges) {
    const insights = await getAggregatedInsights({
      adAccountId,
      startDate: range.startDate,
      endDate: range.endDate,
      ...options,
    });
    results[range.name] = insights;
  }

  return results;
}

/**
 * Get daily insights breakdown (returns each day separately)
 */
export async function getDailyInsightsBreakdown(
  params: InsightsQueryParams
): Promise<(AggregatedInsights & { date: string })[]> {
  const {
    adAccountId,
    startDate,
    endDate,
    entityLevel,
    campaignId,
    adSetId,
    adId,
  } = params;

  // Build WHERE conditions
  const conditions = [
    eq(dailyInsights.adAccountId, adAccountId),
    gte(dailyInsights.date, startDate),
    lte(dailyInsights.date, endDate),
  ];

  if (entityLevel) {
    conditions.push(eq(dailyInsights.entityLevel, entityLevel));
  }

  if (campaignId) {
    conditions.push(eq(dailyInsights.campaignId, campaignId));
  }

  if (adSetId) {
    conditions.push(eq(dailyInsights.adSetId, adSetId));
  }

  if (adId) {
    conditions.push(eq(dailyInsights.adId, adId));
  }

  // Query daily aggregated metrics
  const result = await db
    .select({
      date: dailyInsights.date,
      totalSpend: sql<number>`COALESCE(SUM(${dailyInsights.spend}), 0)`,
      totalImpressions: sql<number>`COALESCE(SUM(${dailyInsights.impressions}), 0)`,
      totalClicks: sql<number>`COALESCE(SUM(${dailyInsights.clicks}), 0)`,
      totalReach: sql<number>`COALESCE(SUM(${dailyInsights.reach}), 0)`,
      totalConversions: sql<number>`COALESCE(SUM(${dailyInsights.conversions}), 0)`,
      totalConversionValue: sql<number>`COALESCE(SUM(${dailyInsights.conversionValue}), 0)`,
    })
    .from(dailyInsights)
    .where(and(...conditions))
    .groupBy(dailyInsights.date)
    .orderBy(dailyInsights.date);

  return result.map((day) => {
    const derived = calculateDerivedMetrics({
      totalSpend: day.totalSpend,
      totalImpressions: day.totalImpressions,
      totalClicks: day.totalClicks,
      totalConversions: day.totalConversions,
    });

    return {
      date: day.date,
      spend: day.totalSpend,
      impressions: day.totalImpressions,
      clicks: day.totalClicks,
      reach: day.totalReach,
      conversions: day.totalConversions,
      conversionValue: day.totalConversionValue,
      ctr: derived.ctr,
      cpc: derived.cpc,
      cpm: derived.cpm,
      costPerConversion: derived.costPerConversion,
      dateStart: day.date,
      dateStop: day.date,
      daysIncluded: 1,
    };
  });
}

/**
 * Helper to get common dashboard time ranges
 */
export function getCommonTimeRanges(baseDate: Date = new Date()): {
  name: string;
  startDate: string;
  endDate: string;
}[] {
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const endDate = formatDate(baseDate);

  const ranges = [
    { name: 'today', days: 0 },
    { name: 'yesterday', days: 1 },
    { name: 'last_3d', days: 3 },
    { name: 'last_7d', days: 7 },
    { name: 'last_14d', days: 14 },
    { name: 'last_30d', days: 30 },
    { name: 'last_90d', days: 90 },
  ];

  return ranges.map((range) => {
    const start = new Date(baseDate);
    start.setDate(start.getDate() - range.days);
    return {
      name: range.name,
      startDate: formatDate(start),
      endDate,
    };
  });
}

/**
 * Get campaign performance comparison
 * Returns aggregated metrics for each campaign in the account
 */
export async function getCampaignPerformanceComparison(
  adAccountId: string,
  startDate: string,
  endDate: string
): Promise<
  Array<
    AggregatedInsights & {
      campaignId: string;
      campaignName?: string;
    }
  >
> {
  const result = await db
    .select({
      campaignId: dailyInsights.campaignId,
      totalSpend: sql<number>`COALESCE(SUM(${dailyInsights.spend}), 0)`,
      totalImpressions: sql<number>`COALESCE(SUM(${dailyInsights.impressions}), 0)`,
      totalClicks: sql<number>`COALESCE(SUM(${dailyInsights.clicks}), 0)`,
      totalReach: sql<number>`COALESCE(SUM(${dailyInsights.reach}), 0)`,
      totalConversions: sql<number>`COALESCE(SUM(${dailyInsights.conversions}), 0)`,
      totalConversionValue: sql<number>`COALESCE(SUM(${dailyInsights.conversionValue}), 0)`,
      daysIncluded: sql<number>`COUNT(DISTINCT ${dailyInsights.date})`,
    })
    .from(dailyInsights)
    .where(
      and(
        eq(dailyInsights.adAccountId, adAccountId),
        gte(dailyInsights.date, startDate),
        lte(dailyInsights.date, endDate),
        sql`${dailyInsights.campaignId} IS NOT NULL`
      )
    )
    .groupBy(dailyInsights.campaignId);

  return result.map((campaign) => {
    const derived = calculateDerivedMetrics({
      totalSpend: campaign.totalSpend,
      totalImpressions: campaign.totalImpressions,
      totalClicks: campaign.totalClicks,
      totalConversions: campaign.totalConversions,
    });

    return {
      campaignId: campaign.campaignId!,
      spend: campaign.totalSpend,
      impressions: campaign.totalImpressions,
      clicks: campaign.totalClicks,
      reach: campaign.totalReach,
      conversions: campaign.totalConversions,
      conversionValue: campaign.totalConversionValue,
      ctr: derived.ctr,
      cpc: derived.cpc,
      cpm: derived.cpm,
      costPerConversion: derived.costPerConversion,
      dateStart: startDate,
      dateStop: endDate,
      daysIncluded: campaign.daysIncluded,
    };
  });
}
