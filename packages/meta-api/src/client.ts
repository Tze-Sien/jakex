import { FacebookAdsApi, AdAccount, User, Campaign, AdSet, Ad } from 'facebook-nodejs-business-sdk';
import {
  MetaAdAccount,
  MetaCampaign,
  MetaAdSet,
  MetaAd,
  MetaInsights,
  MetaInsightsParams,
  InsightsLevel
} from './types';
import { getRateLimiter } from './rate-limiter';
import { withRetry } from './retry';

/**
 * Meta Ads API Client
 * Uses the official Facebook Business SDK to interact with Meta's Graph API
 */
export class MetaAdsClient {
  private accessToken: string;
  private debug: boolean;

  constructor(accessToken: string, options?: { debug?: boolean }) {
    this.accessToken = accessToken;
    this.debug = options?.debug ?? false;
    FacebookAdsApi.init(this.accessToken);
    if (this.debug) {
      console.log('[Meta API] Client initialized');
    }
  }

  /**
   * Logs API call details for debugging
   */
  private logApiCall(method: string, params: Record<string, any>) {
    if (!this.debug) return;
    console.log(`[Meta API] ${method}`, {
      timestamp: new Date().toISOString(),
      params,
    });
  }

  /**
   * Logs API response details
   */
  private logApiResponse(method: string, success: boolean, dataLength?: number, error?: any) {
    if (!this.debug) return;
    if (success) {
      console.log(`[Meta API] ${method} - SUCCESS`, {
        timestamp: new Date().toISOString(),
        recordsReturned: dataLength,
      });
    } else {
      console.error(`[Meta API] ${method} - ERROR`, {
        timestamp: new Date().toISOString(),
        error: error?.message || String(error),
        errorCode: error?.code,
        errorType: error?.type,
        errorFbtraceId: error?.fbtrace_id,
      });
    }
  }

  async getAdAccounts(): Promise<MetaAdAccount[]> {
    const fields = ['id', 'account_id', 'name', 'currency', 'timezone_name', 'account_status', 'amount_spent', 'balance', 'created_time'];
    this.logApiCall('getAdAccounts', { fields });

    try {
      const me = new User('me');
      const accounts = await me.getAdAccounts(fields);

      // @ts-ignore - SDK types can be tricky with their custom array response, but this maps to our interface
      const result = accounts.map(acc => acc._data as MetaAdAccount);
      this.logApiResponse('getAdAccounts', true, result.length);
      return result;
    } catch (error) {
      this.logApiResponse('getAdAccounts', false, undefined, error);
      throw error;
    }
  }

  async getCampaigns(accountId: string): Promise<MetaCampaign[]> {
    const fields = ['id', 'account_id', 'name', 'status', 'objective', 'daily_budget', 'lifetime_budget', 'start_time', 'stop_time'];
    const params = { limit: 50 };
    this.logApiCall('getCampaigns', { accountId, fields, params });

    try {
      const account = new AdAccount(accountId);
      const campaigns = await account.getCampaigns(fields, params);

      // @ts-ignore
      const result = campaigns.map(c => c._data as MetaCampaign);
      this.logApiResponse('getCampaigns', true, result.length);
      return result;
    } catch (error) {
      this.logApiResponse('getCampaigns', false, undefined, error);
      throw error;
    }
  }

  async getAdSets(accountId: string): Promise<MetaAdSet[]> {
    const fields = ['id', 'account_id', 'campaign_id', 'name', 'status', 'optimization_goal', 'billing_event', 'bid_strategy', 'daily_budget', 'lifetime_budget', 'targeting', 'start_time', 'end_time'];
    const params = { limit: 50 };
    this.logApiCall('getAdSets', { accountId, fields, params });

    try {
      const account = new AdAccount(accountId);
      const adSets = await account.getAdSets(fields, params);

      // @ts-ignore
      const result = adSets.map(as => as._data as MetaAdSet);
      this.logApiResponse('getAdSets', true, result.length);
      return result;
    } catch (error) {
      this.logApiResponse('getAdSets', false, undefined, error);
      throw error;
    }
  }

  async getAds(accountId: string): Promise<MetaAd[]> {
    const fields = ['id', 'account_id', 'campaign_id', 'adset_id', 'name', 'status', 'creative'];
    const params = { limit: 50 };
    this.logApiCall('getAds', { accountId, fields, params });

    try {
      const account = new AdAccount(accountId);
      const ads = await account.getAds(fields, params);

      // @ts-ignore
      const result = ads.map(ad => ad._data as MetaAd);
      this.logApiResponse('getAds', true, result.length);
      return result;
    } catch (error) {
      this.logApiResponse('getAds', false, undefined, error);
      throw error;
    }
  }

  /**
   * Get insights for a specific entity (Account, Campaign, AdSet, or Ad)
   * Supports comprehensive query parameters including date ranges, breakdowns, and filtering
   *
   * @param entityId - The entity ID (act_XXX, campaign_id, adset_id, or ad_id)
   * @param params - Insights query parameters
   * @returns Array of insights data
   */
  async getInsights(
    entityId: string,
    params: MetaInsightsParams = {}
  ): Promise<MetaInsights[]> {
    // Set default parameters
    const {
      level = InsightsLevel.CAMPAIGN,
      date_preset,
      time_range,
      fields = [
        'account_id',
        'account_name',
        'campaign_id',
        'campaign_name',
        'adset_id',
        'adset_name',
        'ad_id',
        'ad_name',
        'spend',
        'impressions',
        'clicks',
        'cpc',
        'cpm',
        'cpp',
        'ctr',
        'reach',
        'frequency',
        'actions',
        'action_values',
        'cost_per_action_type',
        'conversions',
        'conversion_values',
        'cost_per_conversion',
        'date_start',
        'date_stop'
      ],
      ...otherParams
    } = params;

    // Build SDK params
    const sdkParams: any = {
      level: level as string,
      ...otherParams
    };

    // Handle date parameters
    if (time_range) {
      sdkParams.time_range = time_range;
    } else if (date_preset) {
      sdkParams.date_preset = date_preset as string;
    }

    // Convert array parameters to proper format
    if (otherParams.breakdowns && Array.isArray(otherParams.breakdowns)) {
      sdkParams.breakdowns = otherParams.breakdowns;
    }
    if (otherParams.action_breakdowns && Array.isArray(otherParams.action_breakdowns)) {
      sdkParams.action_breakdowns = otherParams.action_breakdowns;
    }

    // Determine entity type for logging
    let entityType = 'unknown';
    if (entityId.startsWith('act_')) {
      entityType = 'AdAccount';
    } else if (level === InsightsLevel.CAMPAIGN || (!level && entityId.length > 10)) {
      entityType = 'Campaign';
    } else if (level === InsightsLevel.ADSET) {
      entityType = 'AdSet';
    } else if (level === InsightsLevel.AD) {
      entityType = 'Ad';
    }

    this.logApiCall('getInsights', {
      entityId,
      entityType,
      level,
      date_preset,
      time_range,
      fieldsCount: fields.length,
      fieldsPreview: fields.slice(0, 5).join(', ') + '...',
      sdkParams
    });

    // Additional validation logging
    if (this.debug && !date_preset && !time_range) {
      console.warn('[Meta API] getInsights - WARNING: Neither date_preset nor time_range provided. This may return no data.');
    }

    try {
      // Determine which SDK object to use based on entity ID format
      let insights;
      if (entityId.startsWith('act_')) {
        // AdAccount insights
        const account = new AdAccount(entityId);
        insights = await account.getInsights(fields, sdkParams);
      } else if (level === InsightsLevel.CAMPAIGN || (!level && entityId.length > 10)) {
        // Campaign insights
        const campaign = new Campaign(entityId);
        insights = await campaign.getInsights(fields, sdkParams);
      } else if (level === InsightsLevel.ADSET) {
        // AdSet insights
        const adSet = new AdSet(entityId);
        insights = await adSet.getInsights(fields, sdkParams);
      } else if (level === InsightsLevel.AD) {
        // Ad insights
        const ad = new Ad(entityId);
        insights = await ad.getInsights(fields, sdkParams);
      } else {
        // Default to AdAccount
        const account = new AdAccount(entityId);
        insights = await account.getInsights(fields, sdkParams);
      }

      // @ts-ignore - SDK types can be tricky with their custom array response
      const result = insights.map((i: any) => i._data as MetaInsights);
      this.logApiResponse('getInsights', true, result.length);

      // Log sample of first insight for debugging
      if (this.debug) {
        if (result.length > 0) {
          const firstInsight = result[0];
          console.log('[Meta API] getInsights - Sample data:', {
            entityId,
            entityType,
            sampleInsight: {
              date_start: firstInsight?.date_start,
              date_stop: firstInsight?.date_stop,
              spend: firstInsight?.spend,
              impressions: firstInsight?.impressions,
              clicks: firstInsight?.clicks,
            }
          });
        } else {
          console.warn('[Meta API] getInsights - No insights data returned', {
            entityId,
            entityType,
            level,
            date_preset,
            time_range
          });
        }
      }

      return result;
    } catch (error) {
      this.logApiResponse('getInsights', false, undefined, error);
      throw error;
    }
  }

  /**
   * Get insights with daily breakdown for efficient storage
   * Uses time_increment=1 to get daily data in a single API call
   * Includes rate limiting and retry logic
   *
   * @param entityId - The entity ID (act_XXX, campaign_id, adset_id, or ad_id)
   * @param level - The insights level (account, campaign, adset, ad)
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Array of daily insights data
   */
  async getInsightsWithDailyBreakdown(
    entityId: string,
    level: InsightsLevel,
    startDate: string,
    endDate: string
  ): Promise<MetaInsights[]> {
    const adAccountId = entityId.startsWith('act_')
      ? entityId
      : `act_${entityId.split('_')[0]}`;

    const rateLimiter = getRateLimiter(adAccountId);

    // Wait for rate limit token
    await rateLimiter.acquire();

    const params: MetaInsightsParams = {
      level,
      time_range: {
        since: startDate,
        until: endDate,
      },
      time_increment: 1, // Daily breakdown
      fields: [
        'account_id',
        'account_name',
        'campaign_id',
        'campaign_name',
        'adset_id',
        'adset_name',
        'ad_id',
        'ad_name',
        'spend',
        'impressions',
        'clicks',
        'cpc',
        'cpm',
        'ctr',
        'reach',
        'actions',
        'action_values',
        'cost_per_action_type',
        'conversions',
        'conversion_values',
        'cost_per_conversion',
        'date_start',
        'date_stop',
      ],
    };

    this.logApiCall('getInsightsWithDailyBreakdown', {
      entityId,
      level,
      startDate,
      endDate,
      time_increment: 1,
    });

    try {
      // Use retry logic for transient failures
      const result = await withRetry(
        async () => {
          let insights;

          if (entityId.startsWith('act_')) {
            const account = new AdAccount(entityId);
            insights = await account.getInsights(params.fields!, params as any);
          } else if (level === InsightsLevel.CAMPAIGN) {
            const campaign = new Campaign(entityId);
            insights = await campaign.getInsights(params.fields!, params as any);
          } else if (level === InsightsLevel.ADSET) {
            const adSet = new AdSet(entityId);
            insights = await adSet.getInsights(params.fields!, params as any);
          } else if (level === InsightsLevel.AD) {
            const ad = new Ad(entityId);
            insights = await ad.getInsights(params.fields!, params as any);
          } else {
            const account = new AdAccount(entityId);
            insights = await account.getInsights(params.fields!, params as any);
          }

          // @ts-ignore
          return insights.map((i: any) => i._data as MetaInsights);
        },
        {
          maxAttempts: 3,
          initialDelayMs: 2000,
        }
      );

      this.logApiResponse('getInsightsWithDailyBreakdown', true, result.length);
      return result;
    } catch (error: any) {
      // Handle rate limit errors
      if (error?.status === 429 || error?.error?.code === 80004) {
        const retryAfter = error?.headers?.['retry-after'] || 300;
        await rateLimiter.handleRateLimit(parseInt(retryAfter));
        // Retry once after rate limit
        return this.getInsightsWithDailyBreakdown(entityId, level, startDate, endDate);
      }

      this.logApiResponse('getInsightsWithDailyBreakdown', false, undefined, error);
      throw error;
    }
  }
}
