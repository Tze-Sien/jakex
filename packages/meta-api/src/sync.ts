import { MetaAdsClient } from './client';
import type { Database } from '@repo/database/client';
import { adAccounts, campaigns, adSets, ads, eq, and } from '@repo/database';
import { SyncJobTracker } from './sync-jobs';

export interface SyncOptions {
  userId: string;
  metaConnectionId: string;
  accessToken: string;
}

export interface SyncResult {
  success: boolean;
  entityType: string;
  synced: number;
  errors: string[];
  syncedAt: Date;
}

export interface FullSyncResult {
  success: boolean;
  jobId: string;
  results: SyncResult[];
  totalSynced: number;
  totalErrors: number;
}

/**
 * MetaSyncService handles synchronization of META API data to PostgreSQL database
 *
 * Features:
 * - Full sync on first connection
 * - Incremental sync using lastSyncedAt timestamps
 * - Upsert logic (update existing, insert new)
 * - Error tracking and reporting
 */
export class MetaSyncService {
  private client: MetaAdsClient;
  private db: Database;
  private metaConnectionId: string;
  private jobTracker: SyncJobTracker;

  constructor(options: {
    client: MetaAdsClient;
    db: Database;
    metaConnectionId: string;
  }) {
    this.client = options.client;
    this.db = options.db;
    this.metaConnectionId = options.metaConnectionId;
    this.jobTracker = new SyncJobTracker(options.db);
  }

  /**
   * Syncs ad accounts from META API to database
   * Uses upsert pattern: updates if exists, inserts if new
   */
  async syncAdAccounts(): Promise<SyncResult> {
    const errors: string[] = [];
    let synced = 0;

    try {
      // Fetch ad accounts from META API
      const metaAccounts = await this.client.getAdAccounts();

      // Upsert each account
      for (const account of metaAccounts) {
        try {
          // Check if account already exists
          const existing = await this.db.query.adAccounts.findFirst({
            where: and(
              eq(adAccounts.metaConnectionId, this.metaConnectionId),
              eq(adAccounts.metaAdAccountId, account.account_id)
            ),
          });

          const accountData = {
            metaConnectionId: this.metaConnectionId,
            metaAdAccountId: account.account_id,
            name: account.name || null,
            currency: account.currency || null,
            timezone: account.timezone_name || null,
            accountStatus: account.account_status || null,
            lastSyncedAt: new Date(),
          };

          if (existing) {
            // Update existing account
            await this.db
              .update(adAccounts)
              .set({
                ...accountData,
                updatedAt: new Date(),
              })
              .where(eq(adAccounts.id, existing.id));
          } else {
            // Insert new account
            await this.db.insert(adAccounts).values(accountData);
          }

          synced++;
        } catch (error) {
          const errorMsg = `Failed to sync account ${account.account_id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      return {
        success: errors.length === 0,
        entityType: 'adAccounts',
        synced,
        errors,
        syncedAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        entityType: 'adAccounts',
        synced,
        errors: [`Failed to fetch ad accounts: ${error instanceof Error ? error.message : 'Unknown error'}`],
        syncedAt: new Date(),
      };
    }
  }

  /**
   * Syncs campaigns for a specific ad account
   */
  async syncCampaigns(adAccountId: string): Promise<SyncResult> {
    const errors: string[] = [];
    let synced = 0;

    try {
      // Get the internal DB ID for this ad account
      const adAccount = await this.db.query.adAccounts.findFirst({
        where: and(
          eq(adAccounts.metaConnectionId, this.metaConnectionId),
          eq(adAccounts.metaAdAccountId, adAccountId)
        ),
      });

      if (!adAccount) {
        return {
          success: false,
          entityType: 'campaigns',
          synced: 0,
          errors: [`Ad account ${adAccountId} not found in database`],
          syncedAt: new Date(),
        };
      }

      // Fetch campaigns from META API
      const metaCampaigns = await this.client.getCampaigns(adAccountId);

      // Upsert each campaign
      for (const campaign of metaCampaigns) {
        try {
          // Check if campaign already exists
          const existing = await this.db.query.campaigns.findFirst({
            where: and(
              eq(campaigns.adAccountId, adAccount.id),
              eq(campaigns.metaCampaignId, campaign.id)
            ),
          });

          const campaignData = {
            adAccountId: adAccount.id,
            metaCampaignId: campaign.id,
            name: campaign.name || null,
            objective: campaign.objective || null,
            status: campaign.status || null,
            dailyBudget: campaign.daily_budget ? Number(campaign.daily_budget) : null,
            lifetimeBudget: campaign.lifetime_budget ? Number(campaign.lifetime_budget) : null,
            lastSyncedAt: new Date(),
          };

          if (existing) {
            // Update existing campaign
            await this.db
              .update(campaigns)
              .set({
                ...campaignData,
                updatedAt: new Date(),
              })
              .where(eq(campaigns.id, existing.id));
          } else {
            // Insert new campaign
            await this.db.insert(campaigns).values(campaignData);
          }

          synced++;
        } catch (error) {
          const errorMsg = `Failed to sync campaign ${campaign.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      return {
        success: errors.length === 0,
        entityType: 'campaigns',
        synced,
        errors,
        syncedAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        entityType: 'campaigns',
        synced,
        errors: [`Failed to fetch campaigns: ${error instanceof Error ? error.message : 'Unknown error'}`],
        syncedAt: new Date(),
      };
    }
  }

  /**
   * Syncs ad sets for a specific ad account
   */
  async syncAdSets(adAccountId: string): Promise<SyncResult> {
    const errors: string[] = [];
    let synced = 0;

    try {
      // Get the internal DB ID for this ad account
      const adAccount = await this.db.query.adAccounts.findFirst({
        where: and(
          eq(adAccounts.metaConnectionId, this.metaConnectionId),
          eq(adAccounts.metaAdAccountId, adAccountId)
        ),
      });

      if (!adAccount) {
        return {
          success: false,
          entityType: 'adSets',
          synced: 0,
          errors: [`Ad account ${adAccountId} not found in database`],
          syncedAt: new Date(),
        };
      }

      // Fetch ad sets from META API
      const metaAdSets = await this.client.getAdSets(adAccountId);

      // Upsert each ad set
      for (const adSet of metaAdSets) {
        try {
          // Find the campaign in DB
          const campaign = await this.db.query.campaigns.findFirst({
            where: and(
              eq(campaigns.adAccountId, adAccount.id),
              eq(campaigns.metaCampaignId, adSet.campaign_id)
            ),
          });

          if (!campaign) {
            errors.push(`Campaign ${adSet.campaign_id} not found for ad set ${adSet.id}`);
            continue;
          }

          // Check if ad set already exists
          const existing = await this.db.query.adSets.findFirst({
            where: and(
              eq(adSets.campaignId, campaign.id),
              eq(adSets.metaAdSetId, adSet.id)
            ),
          });

          const adSetData = {
            campaignId: campaign.id,
            metaAdSetId: adSet.id,
            name: adSet.name || null,
            status: adSet.status || null,
            optimizationGoal: adSet.optimization_goal || null,
            bidStrategy: adSet.bid_strategy || null,
            dailyBudget: adSet.daily_budget ? Number(adSet.daily_budget) : null,
            lifetimeBudget: adSet.lifetime_budget ? Number(adSet.lifetime_budget) : null,
            targeting: adSet.targeting || null,
            lastSyncedAt: new Date(),
          };

          if (existing) {
            // Update existing ad set
            await this.db
              .update(adSets)
              .set({
                ...adSetData,
                updatedAt: new Date(),
              })
              .where(eq(adSets.id, existing.id));
          } else {
            // Insert new ad set
            await this.db.insert(adSets).values(adSetData);
          }

          synced++;
        } catch (error) {
          const errorMsg = `Failed to sync ad set ${adSet.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      return {
        success: errors.length === 0,
        entityType: 'adSets',
        synced,
        errors,
        syncedAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        entityType: 'adSets',
        synced,
        errors: [`Failed to fetch ad sets: ${error instanceof Error ? error.message : 'Unknown error'}`],
        syncedAt: new Date(),
      };
    }
  }

  /**
   * Syncs ads for a specific ad account
   */
  async syncAds(adAccountId: string): Promise<SyncResult> {
    const errors: string[] = [];
    let synced = 0;

    try {
      // Get the internal DB ID for this ad account
      const adAccount = await this.db.query.adAccounts.findFirst({
        where: and(
          eq(adAccounts.metaConnectionId, this.metaConnectionId),
          eq(adAccounts.metaAdAccountId, adAccountId)
        ),
      });

      if (!adAccount) {
        return {
          success: false,
          entityType: 'ads',
          synced: 0,
          errors: [`Ad account ${adAccountId} not found in database`],
          syncedAt: new Date(),
        };
      }

      // Fetch ads from META API
      const metaAds = await this.client.getAds(adAccountId);

      // Upsert each ad
      for (const ad of metaAds) {
        try {
          // Find the ad set in DB
          const adSet = await this.db.query.adSets.findFirst({
            where: eq(adSets.metaAdSetId, ad.adset_id),
          });

          if (!adSet) {
            errors.push(`Ad set ${ad.adset_id} not found for ad ${ad.id}`);
            continue;
          }

          // Check if ad already exists
          const existing = await this.db.query.ads.findFirst({
            where: and(
              eq(ads.adSetId, adSet.id),
              eq(ads.metaAdId, ad.id)
            ),
          });

          // Extract creative data
          const creative = ad.creative;
          const adData = {
            adSetId: adSet.id,
            metaAdId: ad.id,
            name: ad.name || null,
            status: ad.status || null,
            creativeType: creative?.name || null,
            thumbnailUrl: creative?.image_url || null,
            headline: creative?.title || null,
            bodyText: creative?.body || null,
            callToAction: creative?.call_to_action_type || null,
            destinationUrl: null, // Not in current type definition
            creativeMeta: creative || null,
            lastSyncedAt: new Date(),
          };

          if (existing) {
            // Update existing ad
            await this.db
              .update(ads)
              .set({
                ...adData,
                updatedAt: new Date(),
              })
              .where(eq(ads.id, existing.id));
          } else {
            // Insert new ad
            await this.db.insert(ads).values(adData);
          }

          synced++;
        } catch (error) {
          const errorMsg = `Failed to sync ad ${ad.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      return {
        success: errors.length === 0,
        entityType: 'ads',
        synced,
        errors,
        syncedAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        entityType: 'ads',
        synced,
        errors: [`Failed to fetch ads: ${error instanceof Error ? error.message : 'Unknown error'}`],
        syncedAt: new Date(),
      };
    }
  }

  /**
   * Full sync: Syncs all entities for all ad accounts
   * Runs on first connection or manual refresh
   * Creates a sync job and tracks progress
   */
  async fullSync(): Promise<FullSyncResult> {
    // Create sync job
    const jobId = await this.jobTracker.createSyncJob({
      metaConnectionId: this.metaConnectionId,
      type: 'full',
    });

    try {
      // Start the job
      await this.jobTracker.startSyncJob(jobId);

      const results: SyncResult[] = [];

      // Step 1: Sync ad accounts
      const accountsResult = await this.syncAdAccounts();
      results.push(accountsResult);

      if (!accountsResult.success) {
        const totalErrors = accountsResult.errors.length;
        await this.jobTracker.completeSyncJob(jobId, {
          totalSynced: accountsResult.synced,
          totalErrors,
          errorDetails: accountsResult.errors,
        });

        return {
          success: false,
          jobId,
          results,
          totalSynced: accountsResult.synced,
          totalErrors,
        };
      }

      // Step 2: Get all ad accounts from DB to sync their children
      const accounts = await this.db.query.adAccounts.findMany({
        where: eq(adAccounts.metaConnectionId, this.metaConnectionId),
      });

      // Step 3: Sync campaigns, ad sets, and ads for each account
      for (const account of accounts) {
        const campaignsResult = await this.syncCampaigns(account.metaAdAccountId);
        results.push(campaignsResult);

        const adSetsResult = await this.syncAdSets(account.metaAdAccountId);
        results.push(adSetsResult);

        const adsResult = await this.syncAds(account.metaAdAccountId);
        results.push(adsResult);
      }

      // Calculate totals
      const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
      const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
      const allErrors = results.flatMap((r) => r.errors);

      // Complete the job
      await this.jobTracker.completeSyncJob(jobId, {
        totalSynced,
        totalErrors,
        errorDetails: allErrors.length > 0 ? allErrors : undefined,
      });

      return {
        success: totalErrors === 0,
        jobId,
        results,
        totalSynced,
        totalErrors,
      };
    } catch (error) {
      // Fail the job
      await this.jobTracker.failSyncJob(
        jobId,
        error instanceof Error ? error.message : 'Unknown error during full sync'
      );

      throw error;
    }
  }

  /**
   * Incremental sync: Only syncs entities modified since last sync
   * Note: Currently fetches all data, but respects lastSyncedAt timestamps
   * Future optimization: Use META API filtering by modified time
   */
  async incrementalSync(adAccountId: string): Promise<{
    success: boolean;
    results: SyncResult[];
    totalSynced: number;
    totalErrors: number;
  }> {
    const results: SyncResult[] = [];

    // For now, incremental sync is the same as regular sync
    // In the future, we can add date filtering to META API calls
    const campaignsResult = await this.syncCampaigns(adAccountId);
    results.push(campaignsResult);

    const adSetsResult = await this.syncAdSets(adAccountId);
    results.push(adSetsResult);

    const adsResult = await this.syncAds(adAccountId);
    results.push(adsResult);

    const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    return {
      success: totalErrors === 0,
      results,
      totalSynced,
      totalErrors,
    };
  }
}
