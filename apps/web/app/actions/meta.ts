"use server";

import { db } from "@repo/database";
import { metaConnections, adAccounts, ads, campaigns, adSets, profiles } from "@repo/database/schema";
import { eq, and } from "drizzle-orm";
import { MetaAdsClient, MetaSyncService, generateMockAds, generateMockCampaigns, generateMockAdSets, AdAccountStatus } from "@repo/meta-api";
import { revalidatePath } from "next/cache";

/**
 * Gets the META connection for a user
 * @param userId - The user's ID
 * @returns The active META connection or null if not found
 */
export async function getMetaConnection(userId: string) {
  const connections = await db
    .select()
    .from(metaConnections)
    .where(
      and(
        eq(metaConnections.userId, userId),
        eq(metaConnections.status, "active")
      )
    )
    .limit(1);

  return connections[0] || null;
}

/**
 * Gets the selected ad account for a user
 * @param connectionId - The META connection ID
 * @returns The first ad account or null
 */
export async function getSelectedAdAccount(connectionId: string) {
  const accounts = await db
    .select()
    .from(adAccounts)
    .where(eq(adAccounts.metaConnectionId, connectionId))
    .limit(1);

  return accounts[0] || null;
}

/**
 * Triggers a manual sync for the user's META data
 * @param userId - The user's ID
 * @returns The sync result with job ID and summary
 */
export async function triggerManualSync(userId: string) {
  try {
    // Get user's META connection
    const connection = await getMetaConnection(userId);
    if (!connection) {
      return {
        success: false,
        error: "No active META connection found",
      };
    }

    // Initialize META client and sync service
    const client = new MetaAdsClient(connection.accessToken);
    const syncService = new MetaSyncService({
      client,
      db,
      metaConnectionId: connection.id,
    });

    // Run full sync
    const result = await syncService.fullSync();

    // Revalidate dashboard to show fresh data
    revalidatePath("/dashboard");

    return {
      success: result.success,
      jobId: result.jobId,
      totalSynced: result.totalSynced,
      totalErrors: result.totalErrors,
      message: result.success
        ? `Successfully synced ${result.totalSynced} items`
        : `Sync completed with ${result.totalErrors} error(s)`,
    };
  } catch (error) {
    console.error("Manual sync failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during sync",
    };
  }
}

/**
 * Gets ads from the database for a specific ad account
 * @param adAccountId - The META ad account ID
 * @param connectionId - The META connection ID
 * @returns Array of ads with their campaign and ad set data
 */
export async function getAdsFromDatabase(adAccountId: string, connectionId: string) {
  // Get the internal DB ID for this ad account
  const adAccount = await db.query.adAccounts.findFirst({
    where: and(
      eq(adAccounts.metaConnectionId, connectionId),
      eq(adAccounts.metaAdAccountId, adAccountId)
    ),
  });

  if (!adAccount) {
    return [];
  }

  // Fetch ads with their relationships
  const adsData = await db.query.ads.findMany({
    where: eq(ads.adSetId, adAccount.id),
    with: {
      adSet: {
        with: {
          campaign: true,
        },
      },
    },
  });

  return adsData;
}

/**
 * Gets campaigns from the database for a specific ad account
 * @param adAccountId - The META ad account ID
 * @param connectionId - The META connection ID
 * @returns Array of campaigns
 */
export async function getCampaignsFromDatabase(adAccountId: string, connectionId: string) {
  // Get the internal DB ID for this ad account
  const adAccount = await db.query.adAccounts.findFirst({
    where: and(
      eq(adAccounts.metaConnectionId, connectionId),
      eq(adAccounts.metaAdAccountId, adAccountId)
    ),
  });

  if (!adAccount) {
    return [];
  }

  // Fetch campaigns
  const campaignsData = await db.query.campaigns.findMany({
    where: eq(campaigns.adAccountId, adAccount.id),
  });

  return campaignsData;
}

/**
 * Syncs mock data to the database for testing purposes
 * Creates a mock META connection and syncs generated data
 * @param userId - The user's ID (can be mock UUID)
 * @returns Sync result with counts
 */
export async function syncMockDataToDatabase(userId: string) {
  try {
    console.log("🔵 Starting syncMockDataToDatabase for userId:", userId);
    const accountId = "act_123456789";

    // 0. Create or get mock profile if using mock user ID
    if (userId === "00000000-0000-0000-0000-000000000000") {
      console.log("🔵 Step 0: Checking for mock profile...");
      const existingProfile = await db.query.profiles.findFirst({
        where: eq(profiles.id, userId),
      });

      if (!existingProfile) {
        console.log("🔵 Creating mock profile...");
        await db.insert(profiles).values({
          id: userId,
          email: "mock@example.com",
          fullName: "Mock User",
        });
        console.log("🔵 Mock profile created");
      } else {
        console.log("🔵 Mock profile already exists");
      }
    }

    // 1. Create or get mock META connection
    console.log("🔵 Step 1: Finding META connection...");
    let connection = await db.query.metaConnections.findFirst({
      where: and(
        eq(metaConnections.userId, userId),
        eq(metaConnections.metaUserId, "mock_meta_user_123")
      ),
    });

    if (!connection) {
      console.log("🔵 No connection found, creating new one...");
      const insertResult = await db.insert(metaConnections).values({
        userId,
        metaUserId: "mock_meta_user_123",
        metaUserName: "Mock Meta User",
        accessToken: "mock_access_token",
        grantedScopes: ["ads_read", "ads_management"],
        status: "active",
      }).returning();
      console.log("🔵 Insert result type:", typeof insertResult, "isArray:", Array.isArray(insertResult));
      const [newConnection] = insertResult;
      connection = newConnection;
      console.log("🔵 Created connection:", connection?.id);
    } else {
      console.log("🔵 Found existing connection:", connection.id);
    }

    // 2. Create or get mock ad account
    console.log("🔵 Step 2: Finding ad account...");
    const strippedAccountId = accountId.replace('act_', '');
    let adAccount = await db.query.adAccounts.findFirst({
      where: and(
        eq(adAccounts.metaConnectionId, connection.id),
        eq(adAccounts.metaAdAccountId, strippedAccountId)
      ),
    });

    if (!adAccount) {
      console.log("🔵 Creating ad account...");
      const [newAdAccount] = await db.insert(adAccounts).values({
        metaConnectionId: connection.id,
        metaAdAccountId: accountId.replace('act_', ''),
        name: "Mock Ad Account",
        currency: "USD",
        accountStatus: AdAccountStatus.ACTIVE,
      }).returning();
      adAccount = newAdAccount;
      console.log("🔵 Ad account created:", adAccount.id);
    } else {
      console.log("🔵 Found existing ad account:", adAccount.id);

      // Delete existing data in correct order (to avoid cascade issues)
      console.log("🔵 Deleting existing data for fresh sync...");

      // Get all campaign IDs for this ad account
      const existingCampaigns = await db.query.campaigns.findMany({
        where: eq(campaigns.adAccountId, adAccount.id),
      });

      if (existingCampaigns.length > 0) {
        const campaignIdsToDelete = existingCampaigns.map(c => c.id);

        // Get all ad set IDs for these campaigns
        const existingAdSets = await db.query.adSets.findMany({
          where: eq(adSets.campaignId, campaignIdsToDelete[0]), // Just get first for now
        });

        // Delete ads first (leaf nodes)
        for (const campaign of existingCampaigns) {
          const campaignAdSets = await db.query.adSets.findMany({
            where: eq(adSets.campaignId, campaign.id),
          });

          for (const adSet of campaignAdSets) {
            await db.delete(ads).where(eq(ads.adSetId, adSet.id));
          }

          // Delete ad sets
          await db.delete(adSets).where(eq(adSets.campaignId, campaign.id));
        }

        // Finally delete campaigns
        await db.delete(campaigns).where(eq(campaigns.adAccountId, adAccount.id));
        console.log(`🔵 Deleted ${existingCampaigns.length} campaigns and their associated data`);
      } else {
        console.log("🔵 No existing data to delete");
      }
    }

    // 3. Generate and insert mock campaigns
    const mockCampaigns = generateMockCampaigns(accountId, 10);
    const campaignIds: string[] = [];

    for (const campaign of mockCampaigns) {
      const [dbCampaign] = await db.insert(campaigns).values({
        adAccountId: adAccount.id,
        metaCampaignId: campaign.id,
        name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        dailyBudget: campaign.daily_budget ? parseFloat(campaign.daily_budget) : null,
        lifetimeBudget: campaign.lifetime_budget ? parseFloat(campaign.lifetime_budget) : null,
      }).returning();
      campaignIds.push(dbCampaign.id);
    }

    // 4. Generate and insert mock ad sets for first 3 campaigns
    const adSetIds: string[] = [];
    for (let i = 0; i < Math.min(3, mockCampaigns.length); i++) {
      const campaign = mockCampaigns[i];
      const mockAdSetsForCampaign = generateMockAdSets(accountId, campaign.id, 3);
      
      for (const adSet of mockAdSetsForCampaign) {
        const [dbAdSet] = await db.insert(adSets).values({
          campaignId: campaignIds[i],
          metaAdSetId: adSet.id,
          name: adSet.name,
          status: adSet.status,
          optimizationGoal: adSet.optimization_goal,
          dailyBudget: adSet.daily_budget ? parseFloat(adSet.daily_budget) : null,
        }).returning();
        adSetIds.push(dbAdSet.id);
      }
    }

    // 5. Generate and insert mock ads
    let adsCount = 0;
    for (let i = 0; i < adSetIds.length; i++) {
      const adSetIndex = i;
      const campaignIndex = Math.floor(i / 3);
      const campaign = mockCampaigns[campaignIndex];
      const adSetMetaId = `${campaign.id}_${adSetIndex + 1}`;

      console.log(`Generating ads for adSet ${i}: accountId=${accountId}, campaignId=${campaign.id}, adSetMetaId=${adSetMetaId}`);
      const mockAdsForAdSet = generateMockAds(accountId, campaign.id, adSetMetaId, 5);
      console.log(`Generated ${Array.isArray(mockAdsForAdSet) ? mockAdsForAdSet.length : 'NOT AN ARRAY'} ads:`, typeof mockAdsForAdSet);

      for (const ad of mockAdsForAdSet) {
        await db.insert(ads).values({
          adSetId: adSetIds[i],
          metaAdId: ad.id,
          name: ad.name,
          status: ad.status,
          creativeType: ad.creative?.name || "image",
          headline: ad.creative?.title || null,
          bodyText: ad.creative?.body || null,
          thumbnailUrl: ad.creative?.image_url || null,
          callToAction: ad.creative?.call_to_action_type || null,
        });
        adsCount++;
      }
    }

    // Revalidate dashboard
    revalidatePath("/dashboard");

    console.log(`✅ Sync completed! ${mockCampaigns.length} campaigns, ${adSetIds.length} ad sets, ${adsCount} ads`);

    return {
      success: true,
      message: `Synced ${mockCampaigns.length} campaigns and ${adsCount} ads to database`,
      totalSynced: mockCampaigns.length + adsCount,
      connectionId: connection.id,
    };
  } catch (error) {
    console.error("Mock sync failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during mock sync",
    };
  }
}

/**
 * Fetch synced ad data from database
 */
export async function fetchDatabaseAds(userId: string) {
  try {
    // Get user's META connection
    const connection = await db.query.metaConnections.findFirst({
      where: eq(metaConnections.userId, userId),
    });

    if (!connection) {
      return { success: false, error: "No META connection found" };
    }

    // Get ad account
    const adAccount = await db.query.adAccounts.findFirst({
      where: eq(adAccounts.metaConnectionId, connection.id),
    });

    if (!adAccount) {
      return { success: false, error: "No ad account found" };
    }

    // Fetch all campaigns
    const campaignsData = await db.query.campaigns.findMany({
      where: eq(campaigns.adAccountId, adAccount.id),
    });

    // Get all ad sets for all campaigns
    const allAdSets: Awaited<ReturnType<typeof db.query.adSets.findMany>> = [];
    for (const campaign of campaignsData) {
      const campaignAdSets = await db.query.adSets.findMany({
        where: eq(adSets.campaignId, campaign.id),
      });
      allAdSets.push(...campaignAdSets);
    }

    // Get all ads for all ad sets
    const allAds = [];
    for (const adSet of allAdSets) {
      const adSetAds = await db.query.ads.findMany({
        where: eq(ads.adSetId, adSet.id),
      });
      allAds.push(...adSetAds.map(ad => ({ ...ad, adSetMetaId: adSet.metaAdSetId, campaignId: adSet.campaignId })));
    }

    // Transform database data to match UI expectations
    const transformedData = {
      accounts: [{
        id: `act_${adAccount.metaAdAccountId}`,
        name: adAccount.name || "Ad Account",
        currency: adAccount.currency || "USD",
        status: adAccount.accountStatus === 1 ? "ACTIVE" : "INACTIVE",
        timezone: adAccount.timezone,
        lastSyncedAt: adAccount.lastSyncedAt,
      }],
      campaigns: campaignsData.map(c => ({
        id: c.metaCampaignId,
        account_id: `act_${adAccount.metaAdAccountId}`,
        name: c.name,
        status: c.status,
        objective: c.objective || "OUTCOME_SALES",
        created_time: c.createdAt?.toISOString() || new Date().toISOString(),
        updated_time: c.updatedAt?.toISOString() || new Date().toISOString(),
      })),
      adSets: allAdSets.map(adSet => {
        const campaign = campaignsData.find(c => c.id === adSet.campaignId);
        return {
          id: adSet.metaAdSetId,
          campaign_id: campaign?.metaCampaignId || "",
          name: adSet.name,
          status: adSet.status,
          optimization_goal: adSet.optimizationGoal || "OFFSITE_CONVERSIONS",
          billing_event: "IMPRESSIONS",
          bid_amount: 0,
          daily_budget: adSet.dailyBudget || 0,
          created_time: adSet.createdAt?.toISOString() || new Date().toISOString(),
          updated_time: adSet.updatedAt?.toISOString() || new Date().toISOString(),
        };
      }),
      ads: allAds.map(ad => {
        const campaign = campaignsData.find(c => c.id === ad.campaignId);
        return {
          id: ad.metaAdId,
          account_id: `act_${adAccount.metaAdAccountId}`,
          campaign_id: campaign?.metaCampaignId || "",
          adset_id: ad.adSetMetaId,
          name: ad.name,
          status: ad.status,
          creative: {
            id: `${ad.metaAdId}_creative`,
            title: ad.headline || "",
            body: ad.bodyText || "",
            link_url: ad.destinationUrl || "",
            call_to_action_type: ad.callToAction || "LEARN_MORE",
            image_url: ad.thumbnailUrl || "",
            object_story_spec: {},
          },
          // Generate mock insights since they're not in the ads table
          insights: {
            impressions: "15234",
            clicks: "456",
            spend: "234.56",
            ctr: "3.0",
            cpc: "0.51",
            conversions: "23",
            conversion_value: "1156.00",
            roas: "4.93",
          },
          created_time: ad.createdAt?.toISOString() || new Date().toISOString(),
          updated_time: ad.updatedAt?.toISOString() || new Date().toISOString(),
        };
      }),
      lastSyncTime: adAccount.lastSyncedAt,
    };

    return { success: true, data: transformedData };
  } catch (error) {
    console.error("Error fetching database ads:", error);
    return { success: false, error: "Failed to fetch ads from database" };
  }
}
