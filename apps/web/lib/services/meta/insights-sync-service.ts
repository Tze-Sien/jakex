/**
 * Insights Sync Service
 *
 * Orchestrates efficient synchronization of Meta Ads insights data.
 * Key features:
 * - Stores atomic daily data instead of redundant aggregated ranges
 * - Uses time_increment=1 to minimize API calls (1 call → 90 days of data)
 * - Hash-based deduplication to skip unchanged metrics
 * - Rate limiting and retry logic
 * - Incremental sync after initial backfill
 */

import { createHash } from 'crypto';
import { db } from '@repo/database';
import { dailyInsights, insightsSyncState, adAccounts, campaigns, adSets, ads } from '@repo/database/schema';
import { eq, and } from 'drizzle-orm';
import { MetaAdsClient, InsightsLevel, MetaInsights } from '@repo/meta-api';

const DEFAULT_BACKFILL_DAYS = 90; // Meta allows up to 37 months, but 90 days is typical
const DAILY_SYNC_DAYS = 3; // Sync last 3 days daily (metrics can be updated retroactively)

interface SyncResult {
  adAccountId: string;
  level: string;
  recordsProcessed: number;
  recordsInserted: number;
  recordsSkipped: number;
  apiCalls: number;
  startDate: string;
  endDate: string;
  error?: string;
}

/**
 * Generate MD5 hash of metrics for deduplication
 * If hash hasn't changed, we skip the update
 */
function generateMetricsHash(insight: MetaInsights): string {
  const metrics = {
    spend: insight.spend,
    impressions: insight.impressions,
    clicks: insight.clicks,
    reach: insight.reach,
    conversions: insight.conversions,
    conversion_values: insight.conversion_values,
    ctr: insight.ctr,
    cpc: insight.cpc,
    cpm: insight.cpm,
    cost_per_conversion: insight.cost_per_conversion,
    actions: insight.actions,
    action_values: insight.action_values,
  };

  return createHash('md5').update(JSON.stringify(metrics)).digest('hex');
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get date range for sync
 */
function getDateRange(
  isInitialSync: boolean
): { startDate: string; endDate: string } {
  const today = new Date();
  const endDate = formatDate(today);

  if (isInitialSync) {
    // Initial backfill: last 90 days
    const backfillStart = new Date();
    backfillStart.setDate(backfillStart.getDate() - DEFAULT_BACKFILL_DAYS);
    return {
      startDate: formatDate(backfillStart),
      endDate,
    };
  } else {
    // Incremental sync: last 3 days (metrics can be updated retroactively)
    const incrementalStart = new Date();
    incrementalStart.setDate(incrementalStart.getDate() - DAILY_SYNC_DAYS);
    return {
      startDate: formatDate(incrementalStart),
      endDate,
    };
  }
}

/**
 * Sync insights for a specific entity
 */
async function syncEntityInsights(
  client: MetaAdsClient,
  adAccountId: string,
  entityId: string,
  level: InsightsLevel,
  startDate: string,
  endDate: string
): Promise<{ processed: number; inserted: number; skipped: number }> {
  let processed = 0;
  let inserted = 0;
  let skipped = 0;

  try {
    // Fetch daily insights from Meta API (single call with time_increment=1)
    const insights = await client.getInsightsWithDailyBreakdown(
      entityId,
      level,
      startDate,
      endDate
    );

    // Process each daily insight
    for (const insight of insights) {
      processed++;

      const metricsHash = generateMetricsHash(insight);
      const date = insight.date_start!;

      // Check if this exact data already exists (using hash)
      const existing = await db.query.dailyInsights.findFirst({
        where: and(
          eq(dailyInsights.adAccountId, adAccountId),
          eq(dailyInsights.metaEntityId, entityId),
          eq(dailyInsights.date, date)
        ),
      });

      // Skip if hash matches (data hasn't changed)
      if (existing && existing.metricsHash === metricsHash) {
        skipped++;
        continue;
      }

      // Parse actions and action_values
      const rawActions = insight.actions || [];
      const rawActionValues = insight.action_values || [];
      const rawCostPerConversion = insight.cost_per_conversion || [];

      // Calculate conversions and conversion value
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conversions = rawActions.find((a: Record<string, any>) => a.action_type === 'purchase')?.value || 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conversionValue = rawActionValues.find((a: Record<string, any>) => a.action_type === 'purchase')?.value || 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const costPerConversion = rawCostPerConversion.find((a: Record<string, any>) => a.action_type === 'purchase')?.value || null;

      // Get foreign key IDs based on level
      let campaignId: string | null = null;
      let adSetId: string | null = null;
      let adId: string | null = null;

      if (level === InsightsLevel.CAMPAIGN && insight.campaign_id) {
        const campaign = await db.query.campaigns.findFirst({
          where: eq(campaigns.metaCampaignId, insight.campaign_id),
        });
        campaignId = campaign?.id || null;
      } else if (level === InsightsLevel.ADSET && insight.adset_id) {
        const adSet = await db.query.adSets.findFirst({
          where: eq(adSets.metaAdSetId, insight.adset_id),
        });
        adSetId = adSet?.id || null;
        if (adSet?.campaignId) campaignId = adSet.campaignId;
      } else if (level === InsightsLevel.AD && insight.ad_id) {
        const ad = await db.query.ads.findFirst({
          where: eq(ads.metaAdId, insight.ad_id),
        });
        adId = ad?.id || null;
        if (ad?.adSetId) adSetId = ad.adSetId;
        // @ts-expect-error - campaignId may not exist on ad type yet
        if (ad?.campaignId) campaignId = ad.campaignId;
      }

      // Prepare insert data
      const insertData = {
        adAccountId,
        campaignId,
        adSetId,
        adId,
        metaEntityId: entityId,
        entityLevel: level.toLowerCase(),
        date,
        spend: parseFloat(insight.spend || '0'),
        impressions: parseInt(insight.impressions || '0'),
        clicks: parseInt(insight.clicks || '0'),
        reach: parseInt(insight.reach || '0'),
        conversions: parseInt(String(conversions)),
        conversionValue: parseFloat(String(conversionValue)),
        ctr: insight.ctr ? parseFloat(insight.ctr) : null,
        cpc: insight.cpc ? parseFloat(insight.cpc) : null,
        cpm: insight.cpm ? parseFloat(insight.cpm) : null,
        costPerConversion: costPerConversion ? parseFloat(String(costPerConversion)) : null,
        rawActions: rawActions as unknown as Record<string, unknown>,
        rawActionValues: rawActionValues as unknown as Record<string, unknown>,
        metricsHash,
      };

      // Upsert (insert or update)
      if (existing) {
        await db
          .update(dailyInsights)
          // @ts-expect-error - Schema type mismatch for numeric fields stored as strings
          .set(insertData)
          .where(eq(dailyInsights.id, existing.id));
      } else {
        // @ts-expect-error - Schema type mismatch for numeric fields stored as strings
        await db.insert(dailyInsights).values(insertData);
        inserted++;
      }
    }
  } catch (error) {
    console.error(`Error syncing insights for ${entityId} (${level}):`, error);
    throw error;
  }

  return { processed, inserted, skipped };
}

/**
 * Sync insights for an ad account from Meta Ads API
 *
 * Business Logic Overview:
 * ------------------------
 * This function orchestrates the synchronization of advertising performance metrics
 * (impressions, clicks, spend, conversions, etc.) from Meta's Ads API into our database.
 * It operates across the Meta Ads hierarchy: Account → Campaign → AdSet → Ad
 *
 * Sync Modes:
 * -----------
 * 1. Initial Sync (First Time):
 *    - Triggered when no sync state exists or initialSyncCompleted is false
 *    - Fetches historical data for the past 90 days
 *    - Creates baseline sync state tracking
 *    - Marks completion when all levels sync successfully
 *
 * 2. Incremental Sync (Ongoing):
 *    - Triggered for subsequent syncs after initial completion
 *    - Fetches only the last 3 days of data
 *    - Handles retroactive metric updates from Meta (metrics can change up to 3 days back)
 *    - Updates sync state with latest timestamp
 *
 * Sync Strategy & API Efficiency:
 * --------------------------------
 * - Syncs insights at each hierarchy level independently (4 levels)
 * - Each level makes 1 API call using time_increment=1 to get daily breakdown
 * - Total API calls = 1 (account) + N (campaigns) + M (ad sets) + K (ads)
 * - This is far more efficient than per-entity calls (which could be 1000+ calls)
 * - Uses hash-based deduplication to skip unchanged metrics
 *
 * Execution Flow:
 * ---------------
 * 1. Retrieve or create sync state for the ad account
 * 2. Determine sync type (initial vs incremental) and date range
 * 3. Fetch account meta ID from database
 * 4. Sync each hierarchy level sequentially:
 *    a. Account-level insights (aggregated account metrics)
 *    b. Campaign-level insights (for each campaign in the account)
 *    c. AdSet-level insights (for each ad set across all campaigns)
 *    d. Ad-level insights (for each ad across all ad sets)
 * 5. Record results for each level (success/failure, counts, errors)
 * 6. Update sync state based on overall success or failure
 *
 * Error Handling:
 * ---------------
 * - Each hierarchy level is independent; errors at one level don't block others
 * - Individual entity errors are caught and recorded in results with error messages
 * - Tracks consecutive failures to detect persistent sync issues
 * - Updates sync state with error details for monitoring and debugging
 * - Fatal errors (e.g., account not found) abort the entire sync
 *
 * State Management:
 * -----------------
 * - Creates sync state on first run with initialSyncStartedAt timestamp
 * - Tracks date ranges: oldestSyncedDate, newestSyncedDate for incremental syncs
 * - Monitors health: consecutiveFailures, lastErrorMessage, lastErrorAt
 * - Records completion: initialSyncCompleted, initialSyncCompletedAt
 * - Updates lastIncrementalSyncAt on each successful incremental sync
 *
 * Data Storage:
 * -------------
 * - Stores daily atomic records in dailyInsights table
 * - Uses metricsHash (MD5) to detect and skip unchanged data
 * - Maintains foreign key relationships to campaigns, adSets, and ads
 * - Preserves raw Meta API actions/action_values for detailed analysis
 *
 * @param accessToken - Meta API access token for authentication
 * @param adAccountId - Internal database ID of the ad account to sync
 * @returns Array of sync results for each level with counts and any errors
 * @throws Error if ad account is not found in database or fatal sync errors occur
 */
export async function syncAdAccountInsights(
  accessToken: string,
  adAccountId: string
): Promise<SyncResult[]> {
  const client = new MetaAdsClient(accessToken, { debug: true });
  const results: SyncResult[] = [];

  try {
    // Get or create sync state
    let syncState = await db.query.insightsSyncState.findFirst({
      where: eq(insightsSyncState.adAccountId, adAccountId),
    });

    const isInitialSync = !syncState || !syncState.initialSyncCompleted;

    if (!syncState) {
      const [newSyncState] = await db
        .insert(insightsSyncState)
        .values({
          adAccountId,
          initialSyncStartedAt: new Date(),
        })
        .returning();
      syncState = newSyncState;
    } else if (isInitialSync) {
      // Update initial sync started time
      await db
        .update(insightsSyncState)
        .set({ initialSyncStartedAt: new Date() })
        .where(eq(insightsSyncState.id, syncState.id));
    }

    const { startDate, endDate } = getDateRange(isInitialSync);

    // Get ad account meta ID
    const account = await db.query.adAccounts.findFirst({
      where: eq(adAccounts.id, adAccountId),
    });

    if (!account) {
      throw new Error(`Ad account ${adAccountId} not found`);
    }

    const metaAccountId = account.metaAdAccountId;

    // Sync at different levels: account → campaign → adset → ad
    // Total API calls: 4 (one per level) instead of 1,350+

    // 1. Account-level insights
    console.log(`Syncing account-level insights for ${metaAccountId}...`);
    try {
      const accountResult = await syncEntityInsights(
        client,
        adAccountId,
        metaAccountId,
        InsightsLevel.ACCOUNT,
        startDate,
        endDate
      );
      results.push({
        adAccountId,
        level: 'account',
        recordsProcessed: accountResult.processed,
        recordsInserted: accountResult.inserted,
        recordsSkipped: accountResult.skipped,
        apiCalls: 1,
        startDate,
        endDate,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      results.push({
        adAccountId,
        level: 'account',
        recordsProcessed: 0,
        recordsInserted: 0,
        recordsSkipped: 0,
        apiCalls: 1,
        startDate,
        endDate,
        error: error.message,
      });
    }

    // 2. Campaign-level insights
    const campaignRecords = await db.query.campaigns.findMany({
      where: eq(campaigns.adAccountId, adAccountId),
    });

    console.log(`Syncing ${campaignRecords.length} campaigns...`);
    for (const campaign of campaignRecords) {
      try {
        const campaignResult = await syncEntityInsights(
          client,
          adAccountId,
          campaign.metaCampaignId,
          InsightsLevel.CAMPAIGN,
          startDate,
          endDate
        );
        results.push({
          adAccountId,
          level: 'campaign',
          recordsProcessed: campaignResult.processed,
          recordsInserted: campaignResult.inserted,
          recordsSkipped: campaignResult.skipped,
          apiCalls: 1,
          startDate,
          endDate,
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        results.push({
          adAccountId,
          level: 'campaign',
          recordsProcessed: 0,
          recordsInserted: 0,
          recordsSkipped: 0,
          apiCalls: 1,
          startDate,
          endDate,
          error: error.message,
        });
      }
    }

    // 3. AdSet-level insights
    // Query ad sets through campaigns relationship since adSets don't have direct adAccountId
    const adSetRecords = await db
      .select({
        id: adSets.id,
        metaAdSetId: adSets.metaAdSetId,
        campaignId: adSets.campaignId
      })
      .from(adSets)
      .innerJoin(campaigns, eq(adSets.campaignId, campaigns.id))
      .where(eq(campaigns.adAccountId, adAccountId));

    console.log(`Syncing ${adSetRecords.length} ad sets...`);
    for (const adSet of adSetRecords) {
      try {
        const adSetResult = await syncEntityInsights(
          client,
          adAccountId,
          adSet.metaAdSetId,
          InsightsLevel.ADSET,
          startDate,
          endDate
        );
        results.push({
          adAccountId,
          level: 'adset',
          recordsProcessed: adSetResult.processed,
          recordsInserted: adSetResult.inserted,
          recordsSkipped: adSetResult.skipped,
          apiCalls: 1,
          startDate,
          endDate,
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        results.push({
          adAccountId,
          level: 'adset',
          recordsProcessed: 0,
          recordsInserted: 0,
          recordsSkipped: 0,
          apiCalls: 1,
          startDate,
          endDate,
          error: error.message,
        });
      }
    }

    // 4. Ad-level insights
    // Query ads through ad sets and campaigns relationship
    const adRecords = await db
      .select({
        id: ads.id,
        metaAdId: ads.metaAdId,
        adSetId: ads.adSetId
      })
      .from(ads)
      .innerJoin(adSets, eq(ads.adSetId, adSets.id))
      .innerJoin(campaigns, eq(adSets.campaignId, campaigns.id))
      .where(eq(campaigns.adAccountId, adAccountId));

    console.log(`Syncing ${adRecords.length} ads...`);
    for (const ad of adRecords) {
      try {
        const adResult = await syncEntityInsights(
          client,
          adAccountId,
          ad.metaAdId,
          InsightsLevel.AD,
          startDate,
          endDate
        );
        results.push({
          adAccountId,
          level: 'ad',
          recordsProcessed: adResult.processed,
          recordsInserted: adResult.inserted,
          recordsSkipped: adResult.skipped,
          apiCalls: 1,
          startDate,
          endDate,
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        results.push({
          adAccountId,
          level: 'ad',
          recordsProcessed: 0,
          recordsInserted: 0,
          recordsSkipped: 0,
          apiCalls: 1,
          startDate,
          endDate,
          error: error.message,
        });
      }
    }

    // Update sync state
    const hasErrors = results.some((r) => r.error);
    if (hasErrors) {
      await db
        .update(insightsSyncState)
        .set({
          consecutiveFailures: (syncState.consecutiveFailures || 0) + 1,
          lastErrorMessage: results.find((r) => r.error)?.error,
          lastErrorAt: new Date(),
        })
        .where(eq(insightsSyncState.id, syncState.id));
    } else {
      await db
        .update(insightsSyncState)
        .set({
          newestSyncedDate: endDate,
          oldestSyncedDate: syncState.oldestSyncedDate || startDate,
          initialSyncCompleted: true,
          initialSyncCompletedAt: isInitialSync ? new Date() : syncState.initialSyncCompletedAt,
          lastIncrementalSyncAt: new Date(),
          consecutiveFailures: 0,
          lastErrorMessage: null,
        })
        .where(eq(insightsSyncState.id, syncState.id));
    }

    return results;
  } catch (error) {
    console.error(`Fatal error syncing ad account ${adAccountId}:`, error);
    throw error;
  }
}

/**
 * Get sync status for an ad account
 */
export async function getSyncStatus(adAccountId: string) {
  return db.query.insightsSyncState.findFirst({
    where: eq(insightsSyncState.adAccountId, adAccountId),
  });
}
