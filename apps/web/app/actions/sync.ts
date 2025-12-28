"use server";

import { db } from "@repo/database";
import {
  adAccounts,
  campaigns,
  adSets,
  ads,
  insights,
  reports,
  syncJobs,
  metaConnections,
} from "@repo/database/schema";
import { eq, and } from "drizzle-orm";
import { MetaAdsClient, InsightsDatePreset, InsightsLevel } from "@repo/meta-api";

/**
 * Syncs all data for a specific ad account from Meta API to the database
 * This includes campaigns, ad sets, ads, and insights
 *
 * @param userId - The user's ID
 * @param connectionId - The META connection ID
 * @param adAccountId - The META ad account ID (e.g., "act_123456")
 * @param accessToken - The META access token
 * @returns Object containing sync results and any errors
 */
export async function syncAdAccountData(
  userId: string,
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

    // Step 4: Sync Insights
    // Create a report record for this sync
    const [report] = await db
      .insert(reports)
      .values({
        userId,
        adAccountId: adAccount.id,
        status: "active",
      })
      .returning();

    // Define time ranges to sync
    const timeRanges = [
      { preset: InsightsDatePreset.TODAY, name: "today" },
      { preset: InsightsDatePreset.LAST_3D, name: "last_3d" },
      { preset: InsightsDatePreset.LAST_7D, name: "last_7d" },
    ];

    // Step 4.1: Sync Campaign Insights
    try {
      const dbCampaigns = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.adAccountId, adAccount.id));

      for (const campaign of dbCampaigns) {
        for (const timeRange of timeRanges) {
          try {
            const insightsData = await client.getInsights(campaign.metaCampaignId, {
              level: InsightsLevel.CAMPAIGN,
              date_preset: timeRange.preset,
            });

            for (const insight of insightsData) {
              await db
                .insert(insights)
                .values({
                  reportId: report.id,
                  campaignId: campaign.id,
                  adSetId: null,
                  adId: null,
                  timeRange: timeRange.name,
                  dateStart: insight.date_start,
                  dateEnd: insight.date_stop,
                  entityName: campaign.name || null,
                  entityStatus: campaign.status || null,
                  campaignObjective: campaign.objective || null,
                  campaignDailyBudget: campaign.dailyBudget || null,
                  campaignLifetimeBudget: campaign.lifetimeBudget || null,
                  spend: parseInt(insight.spend) || 0,
                  impressions: parseInt(insight.impressions) || 0,
                  clicks: parseInt(insight.clicks) || 0,
                  ctr: insight.ctr || null,
                  cpc: parseInt(insight.cpc) || null,
                  cpm: parseInt(insight.cpm) || null,
                  conversions: 0, // Extract from actions if needed
                  costPerConversion: null,
                  roas: null,
                })
                .onConflictDoUpdate({
                  target: [insights.reportId, insights.campaignId, insights.timeRange],
                  set: {
                    dateStart: insight.date_start,
                    dateEnd: insight.date_stop,
                    entityName: campaign.name || null,
                    entityStatus: campaign.status || null,
                    spend: parseInt(insight.spend) || 0,
                    impressions: parseInt(insight.impressions) || 0,
                    clicks: parseInt(insight.clicks) || 0,
                    ctr: insight.ctr || null,
                    cpc: parseInt(insight.cpc) || null,
                    cpm: parseInt(insight.cpm) || null,
                  },
                });

              totalSynced++;
            }
          } catch (error) {
            errors.push(
              `Failed to sync insights for campaign ${campaign.metaCampaignId} (${timeRange.name}): ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }
      }
    } catch (error) {
      const errorMsg = `Failed to sync campaign insights: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
    }

    // Step 4.2: Sync Ad Set Insights
    try {
      const dbAdSets = await db
        .select()
        .from(adSets)
        .innerJoin(campaigns, eq(adSets.campaignId, campaigns.id))
        .where(eq(campaigns.adAccountId, adAccount.id));

      for (const { ad_sets: adSet } of dbAdSets) {
        for (const timeRange of timeRanges) {
          try {
            const insightsData = await client.getInsights(adSet.metaAdSetId, {
              level: InsightsLevel.ADSET,
              date_preset: timeRange.preset,
            });

            for (const insight of insightsData) {
              await db
                .insert(insights)
                .values({
                  reportId: report.id,
                  campaignId: null,
                  adSetId: adSet.id,
                  adId: null,
                  timeRange: timeRange.name,
                  dateStart: insight.date_start,
                  dateEnd: insight.date_stop,
                  entityName: adSet.name || null,
                  entityStatus: adSet.status || null,
                  adSetOptimizationGoal: adSet.optimizationGoal || null,
                  adSetBidStrategy: adSet.bidStrategy || null,
                  adSetDailyBudget: adSet.dailyBudget || null,
                  adSetLifetimeBudget: adSet.lifetimeBudget || null,
                  adSetTargeting: adSet.targeting || null,
                  spend: parseInt(insight.spend) || 0,
                  impressions: parseInt(insight.impressions) || 0,
                  clicks: parseInt(insight.clicks) || 0,
                  ctr: insight.ctr || null,
                  cpc: parseInt(insight.cpc) || null,
                  cpm: parseInt(insight.cpm) || null,
                  conversions: 0,
                  costPerConversion: null,
                  roas: null,
                })
                .onConflictDoUpdate({
                  target: [insights.reportId, insights.adSetId, insights.timeRange],
                  set: {
                    dateStart: insight.date_start,
                    dateEnd: insight.date_stop,
                    entityName: adSet.name || null,
                    entityStatus: adSet.status || null,
                    spend: parseInt(insight.spend) || 0,
                    impressions: parseInt(insight.impressions) || 0,
                    clicks: parseInt(insight.clicks) || 0,
                    ctr: insight.ctr || null,
                    cpc: parseInt(insight.cpc) || null,
                    cpm: parseInt(insight.cpm) || null,
                  },
                });

              totalSynced++;
            }
          } catch (error) {
            errors.push(
              `Failed to sync insights for ad set ${adSet.metaAdSetId} (${timeRange.name}): ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }
      }
    } catch (error) {
      const errorMsg = `Failed to sync ad set insights: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
    }

    // Step 4.3: Sync Ad Insights
    try {
      const dbAds = await db
        .select()
        .from(ads)
        .innerJoin(adSets, eq(ads.adSetId, adSets.id))
        .innerJoin(campaigns, eq(adSets.campaignId, campaigns.id))
        .where(eq(campaigns.adAccountId, adAccount.id));

      for (const { ads: ad } of dbAds) {
        for (const timeRange of timeRanges) {
          try {
            const insightsData = await client.getInsights(ad.metaAdId, {
              level: InsightsLevel.AD,
              date_preset: timeRange.preset,
            });

            for (const insight of insightsData) {
              await db
                .insert(insights)
                .values({
                  reportId: report.id,
                  campaignId: null,
                  adSetId: null,
                  adId: ad.id,
                  timeRange: timeRange.name,
                  dateStart: insight.date_start,
                  dateEnd: insight.date_stop,
                  entityName: ad.name || null,
                  entityStatus: ad.status || null,
                  adCreativeType: ad.creativeType || null,
                  adHeadline: ad.headline || null,
                  adBodyText: ad.bodyText || null,
                  adCallToAction: ad.callToAction || null,
                  spend: parseInt(insight.spend) || 0,
                  impressions: parseInt(insight.impressions) || 0,
                  clicks: parseInt(insight.clicks) || 0,
                  ctr: insight.ctr || null,
                  cpc: parseInt(insight.cpc) || null,
                  cpm: parseInt(insight.cpm) || null,
                  conversions: 0,
                  costPerConversion: null,
                  roas: null,
                })
                .onConflictDoUpdate({
                  target: [insights.reportId, insights.adId, insights.timeRange],
                  set: {
                    dateStart: insight.date_start,
                    dateEnd: insight.date_stop,
                    entityName: ad.name || null,
                    entityStatus: ad.status || null,
                    spend: parseInt(insight.spend) || 0,
                    impressions: parseInt(insight.impressions) || 0,
                    clicks: parseInt(insight.clicks) || 0,
                    ctr: insight.ctr || null,
                    cpc: parseInt(insight.cpc) || null,
                    cpm: parseInt(insight.cpm) || null,
                  },
                });

              totalSynced++;
            }
          } catch (error) {
            errors.push(
              `Failed to sync insights for ad ${ad.metaAdId} (${timeRange.name}): ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }
      }
    } catch (error) {
      const errorMsg = `Failed to sync ad insights: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
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
      reportId: report.id,
      totalSynced,
      errors,
      userId, // Return userId for AI analysis
    };
  } catch (error) {
    // Update sync job with error
    await db
      .update(syncJobs)
      .set({
        status: "failed",
        completedAt: new Date(),
        totalSynced,
        totalErrors: errors.length + 1,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorDetails: [...errors, error instanceof Error ? error.message : String(error)],
      })
      .where(eq(syncJobs.id, syncJob.id));

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
 * @param userId - The user's ID
 * @returns Success status and message
 */
export async function triggerSync(userId: string) {
  try {
    // Get the user's META connection
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
      return {
        success: false,
        error: `Failed to get ad account: ${error instanceof Error ? error.message : String(error)}`
      };
    }

    // Sync the data
    const result = await syncAdAccountData(
      userId,
      connection.id,
      adAccount.metaAdAccountId,
      connection.accessToken
    );

    if (result.success) {
      return {
        success: true,
        message: `Synced ${result.totalSynced} items successfully`,
        reportId: result.reportId,
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Triggers sync and then AI analysis
 * This is the main entry point for the sync + analyze workflow
 * @param userId - The user's ID
 * @returns Combined result of sync and analysis
 */
export async function triggerSyncAndAnalysis(userId: string) {
  try {
    // Step 1: Sync data
    const syncResult = await triggerSync(userId);

    if (!syncResult.success) {
      return {
        success: false,
        error: syncResult.error,
        step: "sync"
      };
    }

    // Import AI analysis function dynamically to avoid circular dependencies
    const { performAIAnalysis } = await import("./ai-analysis");

    // Step 2: Perform AI analysis
    const analysisResult = await performAIAnalysis(
      syncResult.reportId!,
      userId
    );

    if (!analysisResult.success) {
      return {
        success: false,
        error: analysisResult.error,
        step: "analysis",
        syncSuccess: true,
        syncMessage: syncResult.message,
        reportId: syncResult.reportId
      };
    }

    return {
      success: true,
      message: `${syncResult.message}. AI analysis completed.`,
      reportId: syncResult.reportId,
      analysisId: analysisResult.analysisId,
      syncJobId: syncResult.syncJobId,
      analysis: {
        overallAssessment: analysisResult.overallAssessment,
        keyFindings: analysisResult.keyFindings,
        recommendations: analysisResult.recommendations
      }
    };
  } catch (error) {
    console.error("Sync and analysis error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      step: "unknown"
    };
  }
}
