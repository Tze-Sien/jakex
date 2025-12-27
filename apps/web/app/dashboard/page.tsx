import { redirect } from "next/navigation";
import { getServerUser } from "@repo/auth/server";
import { MetaAdsClient } from "@repo/meta-api";
import { getMetaConnection, getSelectedAdAccount } from "@/app/actions/meta";
import { transformMetaAdToCardProps } from "@/lib/transform-meta-data";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type { AdReportCardProps } from "@/app/dashboard/components";

/**
 * Dashboard Page - Server Component
 * Fetches data from META API (mock or real) and displays ads for review
 */
export default async function DashboardPage() {
  // 1. Get authenticated user
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Get META connection
  const connection = await getMetaConnection(user.id);
  if (!connection) {
    redirect("/authorize-meta");
  }

  // 3. Initialize META client
  const client = new MetaAdsClient(connection.accessToken);

  // 4. Get selected ad account (or use first one)
  const selectedAccount = await getSelectedAdAccount(connection.id);

  // If no account selected, fetch accounts and redirect to selection
  if (!selectedAccount) {
    const accounts = await client.getAdAccounts();
    if (accounts.length === 0) {
      throw new Error("No ad accounts found for this META connection");
    }
    // TODO: In Phase 3, implement proper account selection flow
    // For now, we'll use the first account
  }

  // 5. Fetch data in parallel
  const accountId = selectedAccount?.metaAdAccountId || "act_123456789"; // Fallback to mock account

  const [ads, campaigns, insights] = await Promise.all([
    client.getAds(accountId),
    client.getCampaigns(accountId),
    client.getInsights(accountId, "ad", "last_30d"),
  ]);

  // 6. Transform data for UI
  const transformedAds: AdReportCardProps[] = ads.map((ad) => {
    // Find corresponding campaign
    const campaign = campaigns.find((c) => c.id === ad.campaign_id) || {
      id: ad.campaign_id || "",
      name: "Unknown Campaign",
    };

    // Find corresponding insights
    const adInsights = insights.find((i) => i.ad_id === ad.id) || {
      spend: "0",
      impressions: "0",
      clicks: "0",
      cpc: "0",
      cpm: "0",
      ctr: "0",
    };

    return {
      id: ad.id || "",
      ...transformMetaAdToCardProps(ad, adInsights, campaign),
    };
  });

  // 7. Calculate aggregate stats
  const totalSpend = transformedAds.reduce((sum, ad) => sum + ad.metrics.spend, 0);
  const averageRoas = transformedAds.length > 0
    ? transformedAds.reduce((sum, ad) => sum + ad.metrics.roas, 0) / transformedAds.length
    : 0;

  // 8. Render client component with data
  return (
    <DashboardClient
      ads={transformedAds}
      userId={user.id}
      totalSpend={totalSpend}
      averageRoas={averageRoas}
    />
  );
}
