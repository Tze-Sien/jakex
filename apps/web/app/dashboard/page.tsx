import { transformMetaAdToCardProps } from "@/lib/transform-meta-data";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type { AdReportCardProps } from "@/app/dashboard/components";
import { fetchDatabaseAds } from "@/app/actions/meta";
import { AdStatus } from "@repo/meta-api";

// Force dynamic rendering to ensure cookies() works properly
export const dynamic = 'force-dynamic';

/**
 * Dashboard Page - Server Component (TEMP: Auth Bypassed for Testing)
 * Displays synced data from database
 */
export default async function DashboardPage() {
  // TEMPORARY: Bypass authentication and use mock user ID
  const userId = "00000000-0000-0000-0000-000000000000";

  // Fetch data from database
  const result = await fetchDatabaseAds(userId);

  let transformedAds: AdReportCardProps[] = [];
  let dataSource: "database" | "api" = "database";
  let lastSyncTime: Date | null = null;

  if (result.success && result.data) {
    const { accounts, campaigns, adSets, ads, lastSyncTime: syncTime } = result.data;
    lastSyncTime = syncTime;

    // Transform database data for UI
    transformedAds = ads.map((ad) => {
      // Find corresponding campaign
      const campaign = campaigns.find((c) => c.id === ad.campaign_id);

      // Skip ads without campaign data
      if (!campaign) {
        return null;
      }

      // Ensure ad has required fields with proper types
      const adWithDefaults = {
        ...ad,
        name: ad.name || "Unnamed Ad",
        status: (ad.status || "ACTIVE") as AdStatus,
        created_time: ad.created_time,
        updated_time: ad.updated_time,
      };

      // Create insights object from ad data (cast as any to bypass strict typing)
      const adInsights = {
        ad_id: ad.id,
        account_id: ad.account_id,
        date_start: new Date().toISOString().split('T')[0],
        date_stop: new Date().toISOString().split('T')[0],
        impressions: ad.insights.impressions,
        clicks: ad.insights.clicks,
        spend: ad.insights.spend,
        ctr: ad.insights.ctr,
        cpc: ad.insights.cpc,
        cpm: "0",
        cpp: "0",
        conversions: ad.insights.conversions,
        conversion_value: ad.insights.conversion_value,
        roas: ad.insights.roas,
      } as any;

      return {
        id: ad.id || "",
        ...transformMetaAdToCardProps(adWithDefaults as any, adInsights, campaign as any),
      };
    }).filter((ad): ad is AdReportCardProps => ad !== null);
  }

  // Calculate aggregate stats
  const totalSpend = transformedAds.reduce((sum, ad) => sum + ad.metrics.spend, 0);
  const averageRoas = transformedAds.length > 0
    ? transformedAds.reduce((sum, ad) => sum + ad.metrics.roas, 0) / transformedAds.length
    : 0;

  // Render client component with data
  return (
    <DashboardClient
      ads={transformedAds}
      userId={userId}
      totalSpend={totalSpend}
      averageRoas={averageRoas}
      lastSyncTime={lastSyncTime}
      dataSource={dataSource}
      accounts={result.success && result.data ? result.data.accounts : []}
      campaigns={result.success && result.data ? result.data.campaigns : []}
      adSets={result.success && result.data ? result.data.adSets : []}
      rawAds={result.success && result.data ? result.data.ads : []}
    />
  );
}
