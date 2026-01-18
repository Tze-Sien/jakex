"use server";

import { db } from "@repo/database";
import {
  userDashboardPreferences,
  campaigns,
  adSets,
  ads,
  dailyInsights,
} from "@repo/database/schema";
import { eq, and, gte, lte, inArray, sql } from "drizzle-orm";
import { getAggregatedInsights, getInsightsForTimeRanges, type AggregatedInsights } from "../services/meta/insights-query-service";
import { categorizePerformance, type PerformanceStatus } from "../utils/performance-status";

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface OverviewMetrics extends AggregatedInsights {
  roas: number;
}

export interface CampaignWithMetrics {
  id: string;
  metaCampaignId: string;
  name: string | null;
  status: string | null;
  objective: string | null;
  metrics: AggregatedInsights;
  performanceStatus: PerformanceStatus;
}

export interface AdSetWithMetrics {
  id: string;
  metaAdSetId: string;
  name: string | null;
  status: string | null;
  campaignId: string;
  metrics: AggregatedInsights;
  performanceStatus: PerformanceStatus;
}

export interface AdWithMetrics {
  id: string;
  metaAdId: string;
  name: string | null;
  status: string | null;
  adSetId: string;
  thumbnailUrl: string | null;
  headline: string | null;
  bodyText: string | null;
  metrics: AggregatedInsights;
  performanceStatus: PerformanceStatus;
}

// ============================================================================
// User Dashboard Preferences
// ============================================================================

export async function getUserDashboardPreferences(userId: string) {
  const prefs = await db.query.userDashboardPreferences.findFirst({
    where: eq(userDashboardPreferences.userId, userId),
  });

  return prefs;
}

export async function saveUserDashboardPreferences(
  userId: string,
  preferences: {
    selectedAccountIds?: string[];
    visibleMetrics?: string[];
    defaultPeriod?: string;
    comparisonEnabled?: boolean;
  }
) {
  const existing = await getUserDashboardPreferences(userId);

  if (existing) {
    await db
      .update(userDashboardPreferences)
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where(eq(userDashboardPreferences.userId, userId));
  } else {
    await db.insert(userDashboardPreferences).values({
      userId,
      ...preferences,
    });
  }

  return getUserDashboardPreferences(userId);
}

// ============================================================================
// Overview Dashboard Queries
// ============================================================================

/**
 * Get aggregated metrics across multiple selected accounts
 */
export async function getOverviewMetrics(
  userId: string,
  selectedAccountIds: string[],
  dateRange: DateRange
): Promise<OverviewMetrics> {
  if (selectedAccountIds.length === 0) {
    return {
      spend: 0,
      impressions: 0,
      clicks: 0,
      reach: 0,
      conversions: 0,
      conversionValue: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
      costPerConversion: 0,
      roas: 0,
      dateStart: dateRange.startDate,
      dateStop: dateRange.endDate,
      daysIncluded: 0,
    };
  }

  // Query aggregated metrics across all selected accounts
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
    .where(
      and(
        inArray(dailyInsights.adAccountId, selectedAccountIds),
        gte(dailyInsights.date, dateRange.startDate),
        lte(dailyInsights.date, dateRange.endDate),
        eq(dailyInsights.entityLevel, "account")
      )
    );

  const data = result[0];

  // Calculate derived metrics
  const ctr =
    data.totalImpressions > 0
      ? (data.totalClicks / data.totalImpressions) * 100
      : 0;
  const cpc = data.totalClicks > 0 ? data.totalSpend / data.totalClicks : 0;
  const cpm =
    data.totalImpressions > 0
      ? (data.totalSpend / data.totalImpressions) * 1000
      : 0;
  const costPerConversion =
    data.totalConversions > 0
      ? data.totalSpend / data.totalConversions
      : 0;
  const roas =
    data.totalSpend > 0 ? data.totalConversionValue / data.totalSpend : 0;

  return {
    spend: data.totalSpend,
    impressions: data.totalImpressions,
    clicks: data.totalClicks,
    reach: data.totalReach,
    conversions: data.totalConversions,
    conversionValue: data.totalConversionValue,
    ctr,
    cpc,
    cpm,
    costPerConversion,
    roas,
    dateStart: dateRange.startDate,
    dateStop: dateRange.endDate,
    daysIncluded: data.daysIncluded,
  };
}

/**
 * Get account status summary (count by performance status)
 */
export async function getAccountStatusSummary(
  selectedAccountIds: string[],
  dateRange: DateRange
): Promise<{
  performing: number;
  normal: number;
  underperforming: number;
}> {
  if (selectedAccountIds.length === 0) {
    return { performing: 0, normal: 0, underperforming: 0 };
  }

  // Get metrics for each account
  const accountMetrics = await Promise.all(
    selectedAccountIds.map(async (accountId) => {
      const metrics = await getAggregatedInsights({
        adAccountId: accountId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        entityLevel: "account",
      });
      return {
        accountId,
        costPerConversion: metrics.costPerConversion,
      };
    })
  );

  // Calculate overall average cost per conversion
  const validMetrics = accountMetrics.filter((m) => m.costPerConversion > 0);
  const avgCostPerConversion =
    validMetrics.length > 0
      ? validMetrics.reduce((sum, m) => sum + m.costPerConversion, 0) /
        validMetrics.length
      : 0;

  // Categorize each account
  const statuses = accountMetrics.map((m) =>
    categorizePerformance(m.costPerConversion, avgCostPerConversion)
  );

  return {
    performing: statuses.filter((s) => s === "performing").length,
    normal: statuses.filter((s) => s === "normal").length,
    underperforming: statuses.filter((s) => s === "underperforming").length,
  };
}

// ============================================================================
// Account-Specific Queries
// ============================================================================

/**
 * Get aggregated metrics for a specific account
 */
export async function getAccountMetrics(
  accountId: string,
  dateRange: DateRange
): Promise<AggregatedInsights> {
  return getAggregatedInsights({
    adAccountId: accountId,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    entityLevel: "account",
  });
}

/**
 * Get period comparison for an account
 */
export async function getAccountMetricsComparison(
  accountId: string,
  currentRange: DateRange,
  previousRange: DateRange
): Promise<{
  current: AggregatedInsights;
  previous: AggregatedInsights;
  percentChange: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    cpm: number;
    costPerConversion: number;
  };
}> {
  const results = await getInsightsForTimeRanges(
    accountId,
    [
      { name: "current", startDate: currentRange.startDate, endDate: currentRange.endDate },
      { name: "previous", startDate: previousRange.startDate, endDate: previousRange.endDate },
    ],
    { entityLevel: "account" }
  );

  const current = results.current;
  const previous = results.previous;

  // Calculate percent changes
  const calculateChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  return {
    current,
    previous,
    percentChange: {
      spend: calculateChange(current.spend, previous.spend),
      impressions: calculateChange(current.impressions, previous.impressions),
      clicks: calculateChange(current.clicks, previous.clicks),
      conversions: calculateChange(current.conversions, previous.conversions),
      ctr: calculateChange(current.ctr, previous.ctr),
      cpc: calculateChange(current.cpc, previous.cpc),
      cpm: calculateChange(current.cpm, previous.cpm),
      costPerConversion: calculateChange(
        current.costPerConversion,
        previous.costPerConversion
      ),
    },
  };
}

/**
 * Get campaigns with aggregated metrics and performance status
 */
export async function getCampaignsWithMetrics(
  accountId: string,
  dateRange: DateRange
): Promise<CampaignWithMetrics[]> {
  // Get all campaigns for this account
  const accountCampaigns = await db.query.campaigns.findMany({
    where: eq(campaigns.adAccountId, accountId),
  });

  if (accountCampaigns.length === 0) {
    return [];
  }

  // Get account average for performance categorization
  const accountMetrics = await getAccountMetrics(accountId, dateRange);
  const accountAvgCostPerConversion = accountMetrics.costPerConversion;

  // Get metrics for each campaign
  const campaignsWithMetrics = await Promise.all(
    accountCampaigns.map(async (campaign) => {
      const metrics = await getAggregatedInsights({
        adAccountId: accountId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        campaignId: campaign.id,
        entityLevel: "campaign",
      });

      const performanceStatus = categorizePerformance(
        metrics.costPerConversion,
        accountAvgCostPerConversion
      );

      return {
        id: campaign.id,
        metaCampaignId: campaign.metaCampaignId,
        name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        metrics,
        performanceStatus,
      };
    })
  );

  return campaignsWithMetrics;
}

/**
 * Get ad sets with aggregated metrics and performance status
 */
export async function getAdSetsWithMetrics(
  accountId: string,
  dateRange: DateRange,
  campaignId?: string
): Promise<AdSetWithMetrics[]> {
  // Get ad sets (optionally filtered by campaign)
  const accountAdSets = await db.query.adSets.findMany({
    where: campaignId
      ? and(
          eq(adSets.campaignId, campaignId)
        )
      : undefined,
    with: {
      campaign: {
        columns: {
          adAccountId: true,
        },
      },
    },
  });

  if (accountAdSets.length === 0) {
    return [];
  }

  // Get account average for performance categorization
  const accountMetrics = await getAccountMetrics(accountId, dateRange);
  const accountAvgCostPerConversion = accountMetrics.costPerConversion;

  // Get metrics for each ad set
  const adSetsWithMetrics = await Promise.all(
    accountAdSets.map(async (adSet) => {
      const metrics = await getAggregatedInsights({
        adAccountId: accountId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        adSetId: adSet.id,
        entityLevel: "adset",
      });

      const performanceStatus = categorizePerformance(
        metrics.costPerConversion,
        accountAvgCostPerConversion
      );

      return {
        id: adSet.id,
        metaAdSetId: adSet.metaAdSetId,
        name: adSet.name,
        status: adSet.status,
        campaignId: adSet.campaignId,
        metrics,
        performanceStatus,
      };
    })
  );

  return adSetsWithMetrics;
}

/**
 * Get ads with aggregated metrics and performance status
 */
export async function getAdsWithMetrics(
  accountId: string,
  dateRange: DateRange,
  adSetId?: string
): Promise<AdWithMetrics[]> {
  // Get ads (optionally filtered by ad set)
  const accountAds = await db.query.ads.findMany({
    where: adSetId
      ? eq(ads.adSetId, adSetId)
      : undefined,
    with: {
      adSet: {
        with: {
          campaign: {
            columns: {
              adAccountId: true,
            },
          },
        },
      },
    },
  });

  if (accountAds.length === 0) {
    return [];
  }

  // Get account average for performance categorization
  const accountMetrics = await getAccountMetrics(accountId, dateRange);
  const accountAvgCostPerConversion = accountMetrics.costPerConversion;

  // Get metrics for each ad
  const adsWithMetrics = await Promise.all(
    accountAds.map(async (ad) => {
      const metrics = await getAggregatedInsights({
        adAccountId: accountId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        adId: ad.id,
        entityLevel: "ad",
      });

      const performanceStatus = categorizePerformance(
        metrics.costPerConversion,
        accountAvgCostPerConversion
      );

      return {
        id: ad.id,
        metaAdId: ad.metaAdId,
        name: ad.name,
        status: ad.status,
        adSetId: ad.adSetId,
        thumbnailUrl: ad.thumbnailUrl,
        headline: ad.headline,
        bodyText: ad.bodyText,
        metrics,
        performanceStatus,
      };
    })
  );

  return adsWithMetrics;
}

// ============================================================================
// Date Range Helpers
// ============================================================================

export async function getDateRangeFromPeriod(period: string): Promise<DateRange> {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() - 1); // Yesterday (since today's data is incomplete)

  let startDate = new Date(endDate);

  switch (period) {
    case "today":
      startDate = new Date(today);
      return {
        startDate: startDate.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    case "last_3_days":
      startDate.setDate(startDate.getDate() - 2);
      break;
    case "last_7_days":
      startDate.setDate(startDate.getDate() - 6);
      break;
    case "last_14_days":
      startDate.setDate(startDate.getDate() - 13);
      break;
    case "last_30_days":
      startDate.setDate(startDate.getDate() - 29);
      break;
    case "last_60_days":
      startDate.setDate(startDate.getDate() - 59);
      break;
    case "last_90_days":
      startDate.setDate(startDate.getDate() - 89);
      break;
    case "lifetime":
      // Set to 2 years ago as a reasonable "lifetime" range
      startDate.setFullYear(startDate.getFullYear() - 2);
      break;
    default:
      // Default to last 7 days
      startDate.setDate(startDate.getDate() - 6);
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}
