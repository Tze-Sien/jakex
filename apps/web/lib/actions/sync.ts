"use server";

import { db } from "@repo/database";
import {
  adAccounts,
  campaigns,
  adSets,
  ads,
  syncJobs,
  metaConnections,
} from "@repo/database/schema";
import { eq, and } from "drizzle-orm";
import { MetaAdsClient } from "@repo/meta-api";
import { syncAdAccountInsights } from "@/lib/services/meta/insights-sync-service";
import { withAuth } from "@repo/auth/server";

// Define custom error type for auth-related errors
interface AuthError extends Error {
  needsAuth?: boolean;
}

/**
 * Syncs all data for a specific ad account from Meta API to the database
 * This includes campaigns, ad sets, ads, and insights
 *
 * @param connectionId - The META connection ID
 * @param adAccountId - The META ad account ID (e.g., "act_123456")
 * @param accessToken - The META access token
 * @returns Object containing sync results and any errors
 */
export async function syncAdAccountData(
  connectionId: string,
  adAccountId: string,
  accessToken: string
) {
  // Create a sync job record
  const [syncJob] = await db
    .insert(syncJobs)
    .values({
      metaConnectionId: connectionId,
      type: "manual",
      adAccountId: adAccountId,
      status: "running",
      startedAt: new Date(),
    })
    .returning();

  const errors: string[] = [];
  let totalSynced = 0;

  try {
    // Initialize Meta API client
    const client = new MetaAdsClient(accessToken);

    // Get the internal DB ad account record
    const [adAccount] = await db
      .select()
      .from(adAccounts)
      .where(
        and(
          eq(adAccounts.metaConnectionId, connectionId),
          eq(adAccounts.metaAdAccountId, adAccountId)
        )
      )
      .limit(1);

    if (!adAccount) {
      throw new Error(`Ad account ${adAccountId} not found in database`);
    }

    // Step 1: Sync Campaigns
    try {
      const metaCampaigns = await client.getCampaigns(adAccountId);

      for (const metaCampaign of metaCampaigns) {
        await db
          .insert(campaigns)
          .values({
            adAccountId: adAccount.id,
            metaCampaignId: metaCampaign.id,
            name: metaCampaign.name,
            objective: metaCampaign.objective,
            status: metaCampaign.status,
            dailyBudget: metaCampaign.daily_budget
              ? parseInt(metaCampaign.daily_budget)
              : null,
            lifetimeBudget: metaCampaign.lifetime_budget
              ? parseInt(metaCampaign.lifetime_budget)
              : null,
            lastSyncedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [campaigns.adAccountId, campaigns.metaCampaignId],
            set: {
              name: metaCampaign.name,
              objective: metaCampaign.objective,
              status: metaCampaign.status,
              dailyBudget: metaCampaign.daily_budget
                ? parseInt(metaCampaign.daily_budget)
                : null,
              lifetimeBudget: metaCampaign.lifetime_budget
                ? parseInt(metaCampaign.lifetime_budget)
                : null,
              lastSyncedAt: new Date(),
              updatedAt: new Date(),
            },
          });

        totalSynced++;
      }
    } catch (error) {
      const errorMsg = `Failed to sync campaigns: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
    }

    // Step 2: Sync Ad Sets
    try {
      const metaAdSets = await client.getAdSets(adAccountId);

      for (const metaAdSet of metaAdSets) {
        // Get the campaign DB ID
        const [campaign] = await db
          .select()
          .from(campaigns)
          .where(
            and(
              eq(campaigns.adAccountId, adAccount.id),
              eq(campaigns.metaCampaignId, metaAdSet.campaign_id)
            )
          )
          .limit(1);

        if (!campaign) {
          errors.push(`Campaign ${metaAdSet.campaign_id} not found for ad set ${metaAdSet.id}`);
          continue;
        }

        await db
          .insert(adSets)
          .values({
            campaignId: campaign.id,
            metaAdSetId: metaAdSet.id,
            name: metaAdSet.name,
            status: metaAdSet.status,
            dailyBudget: metaAdSet.daily_budget
              ? parseInt(metaAdSet.daily_budget)
              : null,
            lifetimeBudget: metaAdSet.lifetime_budget
              ? parseInt(metaAdSet.lifetime_budget)
              : null,
            optimizationGoal: metaAdSet.optimization_goal,
            bidStrategy: metaAdSet.bid_strategy || null,
            targeting: metaAdSet.targeting || null,
            lastSyncedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [adSets.campaignId, adSets.metaAdSetId],
            set: {
              name: metaAdSet.name,
              status: metaAdSet.status,
              dailyBudget: metaAdSet.daily_budget
                ? parseInt(metaAdSet.daily_budget)
                : null,
              lifetimeBudget: metaAdSet.lifetime_budget
                ? parseInt(metaAdSet.lifetime_budget)
                : null,
              optimizationGoal: metaAdSet.optimization_goal,
              bidStrategy: metaAdSet.bid_strategy || null,
              targeting: metaAdSet.targeting || null,
              lastSyncedAt: new Date(),
              updatedAt: new Date(),
            },
          });

        totalSynced++;
      }
    } catch (error) {
      const errorMsg = `Failed to sync ad sets: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
    }

    // Step 3: Sync Ads
    try {
      const metaAds = await client.getAds(adAccountId);

      for (const metaAd of metaAds) {
        // Get the ad set DB ID
        const [adSet] = await db
          .select()
          .from(adSets)
          .where(eq(adSets.metaAdSetId, metaAd.adset_id))
          .limit(1);

        if (!adSet) {
          errors.push(`Ad set ${metaAd.adset_id} not found for ad ${metaAd.id}`);
          continue;
        }

        // Extract creative information
        const creative = metaAd.creative;
        const creativeType = creative.asset_feed_spec
          ? "dynamic"
          : creative.object_story_spec?.video_data
          ? "video"
          : creative.object_story_spec?.link_data
          ? "link"
          : "image";

        const thumbnailUrl = creative.thumbnail_url || creative.image_url || null;
        const headline = creative.title || creative.object_story_spec?.link_data?.name || null;
        const bodyText = creative.body || creative.object_story_spec?.link_data?.message || null;
        const callToAction = creative.call_to_action_type ||
          creative.object_story_spec?.link_data?.call_to_action?.type ||
          null;
        const destinationUrl = creative.link_url ||
          creative.object_story_spec?.link_data?.link ||
          null;

        await db
          .insert(ads)
          .values({
            adSetId: adSet.id,
            metaAdId: metaAd.id,
            name: metaAd.name,
            status: metaAd.status,
            creativeType,
            thumbnailUrl,
            headline,
            bodyText,
            callToAction,
            destinationUrl,
            creativeMeta: creative,
            lastSyncedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [ads.adSetId, ads.metaAdId],
            set: {
              name: metaAd.name,
              status: metaAd.status,
              creativeType,
              thumbnailUrl,
              headline,
              bodyText,
              callToAction,
              destinationUrl,
              creativeMeta: creative,
              lastSyncedAt: new Date(),
              updatedAt: new Date(),
            },
          });

        totalSynced++;
      }
    } catch (error) {
      const errorMsg = `Failed to sync ads: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
    }

    // Step 4: Sync Insights (using new efficient sync service)
    // This now syncs atomic daily data instead of redundant aggregated ranges
    // Uses time_increment=1 to minimize API calls (4 calls vs 1,350+)
    try {
      console.log(`Starting insights sync for ad account ${adAccount.id}...`);
      const syncResults = await syncAdAccountInsights(accessToken, adAccount.id);

      // Count successful syncs
      const successfulSyncs = syncResults.filter(r => !r.error);
      const failedSyncs = syncResults.filter(r => r.error);

      totalSynced += successfulSyncs.reduce((sum, r) => sum + r.recordsInserted, 0);

      // Log summary
      console.log(`Insights sync completed: ${successfulSyncs.length} successful, ${failedSyncs.length} failed`);
      console.log(`Total API calls: ${syncResults.reduce((sum, r) => sum + r.apiCalls, 0)}`);
      console.log(`Total records inserted: ${successfulSyncs.reduce((sum, r) => sum + r.recordsInserted, 0)}`);
      console.log(`Total records skipped (unchanged): ${successfulSyncs.reduce((sum, r) => sum + r.recordsSkipped, 0)}`);

      // Add errors from failed syncs
      failedSyncs.forEach(result => {
        errors.push(`Failed to sync ${result.level} insights: ${result.error}`);
      });
    } catch (error) {
      const errorMsg = `Failed to sync insights: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
      console.error(errorMsg, error);
    }

    // Update sync job with completion status
    await db
      .update(syncJobs)
      .set({
        status: errors.length > 0 ? "failed" : "completed",
        completedAt: new Date(),
        totalSynced,
        totalErrors: errors.length,
        errorMessage: errors.length > 0 ? errors[0] : null,
        errorDetails: errors.length > 0 ? errors : null,
      })
      .where(eq(syncJobs.id, syncJob.id));

    return {
      success: errors.length === 0,
      syncJobId: syncJob.id,
      totalSynced,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check if the error is related to expired or invalid access token
    const isTokenExpired = errorMessage.includes('Session has expired') ||
                          errorMessage.includes('Error validating access token') ||
                          errorMessage.includes('OAuthException');

    // Update sync job with error
    await db
      .update(syncJobs)
      .set({
        status: "failed",
        completedAt: new Date(),
        totalSynced,
        totalErrors: errors.length + 1,
        errorMessage: errorMessage,
        errorDetails: [...errors, errorMessage],
      })
      .where(eq(syncJobs.id, syncJob.id));

    // If token expired, include that info in the error
    if (isTokenExpired) {
      const tokenError = new Error(errorMessage) as AuthError;
      tokenError.needsAuth = true;
      throw tokenError;
    }

    throw error;
  }
}

/**
 * Gets or creates an ad account from the database
 * If no ad account exists, fetches from Meta API and creates it
 * @param connectionId - The META connection ID
 * @param accessToken - The META access token
 * @returns The ad account or null if not found
 */
async function getOrCreateAdAccount(connectionId: string, accessToken: string) {
  // Get the ad account from database
  const accounts = await db
    .select()
    .from(adAccounts)
    .where(eq(adAccounts.metaConnectionId, connectionId))
    .limit(1);

  let adAccount = accounts[0];

  // If no ad account found in database, fetch from Meta API and create it
  if (!adAccount) {
    const client = new MetaAdsClient(accessToken);
    const metaAdAccounts = await client.getAdAccounts();

    if (metaAdAccounts.length === 0) {
      throw new Error("No ad accounts found in Meta API");
    }

    // Use the first ad account from Meta API
    const metaAccount = metaAdAccounts[0];

    // Create the ad account in database
    const [newAccount] = await db
      .insert(adAccounts)
      .values({
        metaConnectionId: connectionId,
        metaAdAccountId: metaAccount.id,
        name: metaAccount.name || null,
        currency: metaAccount.currency || null,
        timezone: metaAccount.timezone_name || null,
        accountStatus: metaAccount.account_status || null,
        lastSyncedAt: new Date(),
      })
      .returning();

    adAccount = newAccount;
  }

  return adAccount;
}

/**
 * Triggers a manual sync for the current user
 * Automatically gets the user's connection and ad account
 * Then triggers AI analysis on the synced data
 * @returns Success status and message
 */
export async function triggerSync() {
  // Data Access Layer auth guard
  const auth = await withAuth();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  try {
    // Get the user's META connection (profile.id = auth.users.id)
    const connections = await db
      .select()
      .from(metaConnections)
      .where(
        and(
          eq(metaConnections.userId, auth.user.id),
          eq(metaConnections.status, "active")
        )
      )
      .limit(1);

    const connection = connections[0];
    if (!connection) {
      return {
        success: false,
        error: "No active META connection found"
      };
    }

    // Get or create the ad account
    let adAccount;
    try {
      adAccount = await getOrCreateAdAccount(connection.id, connection.accessToken);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isTokenExpired = errorMessage.includes('Session has expired') ||
                            errorMessage.includes('Error validating access token') ||
                            errorMessage.includes('OAuthException');

      return {
        success: false,
        error: `Failed to get ad account: ${errorMessage}`,
        needsAuth: isTokenExpired
      };
    }

    // Sync the data
    const result = await syncAdAccountData(
      connection.id,
      adAccount.metaAdAccountId,
      connection.accessToken
    );

    if (result.success) {
      return {
        success: true,
        message: `Synced ${result.totalSynced} items successfully`,
        syncJobId: result.syncJobId
      };
    } else {
      return {
        success: false,
        error: result.errors[0] || "Sync failed"
      };
    }
  } catch (error) {
    console.error("Sync error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const needsAuth = error instanceof Error && 'needsAuth' in error ? (error as AuthError).needsAuth === true : false;

    return {
      success: false,
      error: errorMessage,
      needsAuth
    };
  }
}

/**
 * DEPRECATED: AI Analysis feature was removed during schema refactoring.
 *
 * Previous implementation:
 * - This function used to trigger sync and then AI analysis
 * - It relied on the `reports` and `aiAnalyses` tables which have been removed
 * - AI analysis was performed on aggregated insights data
 *
 * To re-implement AI analysis:
 * 1. Use the new `dailyInsights` table as the data source
 * 2. Use `insights-query-service.ts` to aggregate data for analysis
 * 3. Create a new table structure for storing AI analysis results
 * 4. Consider analyzing trends over time using daily data
 *
 * For now, use `triggerSync()` to sync data only.
 */
export async function triggerSyncAndAnalysis() {
  // Just call triggerSync for now
  const syncResult = await triggerSync();

  return {
    ...syncResult,
    step: syncResult.success ? "sync" : "error",
    message: syncResult.success
      ? `${syncResult.message}. Note: AI analysis is currently unavailable.`
      : syncResult.error
  };
}
