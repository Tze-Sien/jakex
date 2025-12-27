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

/**
 * Real Meta Ads API Client
 * Uses the official Facebook Business SDK to interact with Meta's Graph API
 */
export class RealMetaAdsClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    FacebookAdsApi.init(this.accessToken);
  }

  async getAdAccounts(): Promise<MetaAdAccount[]> {
    const me = new User('me');
    const accounts = await me.getAdAccounts([
      'id', 'account_id', 'name', 'currency', 'timezone_name', 'account_status', 'amount_spent', 'balance', 'created_time'
    ]);

    // @ts-ignore - SDK types can be tricky with their custom array response, but this maps to our interface
    return accounts.map(acc => acc._data as MetaAdAccount);
  }

  async getCampaigns(accountId: string): Promise<MetaCampaign[]> {
    const account = new AdAccount(accountId);
    const campaigns = await account.getCampaigns([
      'id', 'account_id', 'name', 'status', 'objective', 'daily_budget', 'lifetime_budget', 'start_time', 'stop_time'
    ], { limit: 50 });

    // @ts-ignore
    return campaigns.map(c => c._data as MetaCampaign);
  }

  async getAdSets(accountId: string): Promise<MetaAdSet[]> {
    const account = new AdAccount(accountId);
    const adSets = await account.getAdSets([
      'id', 'account_id', 'campaign_id', 'name', 'status', 'optimization_goal', 'billing_event', 'bid_strategy', 'daily_budget', 'lifetime_budget', 'targeting', 'start_time', 'end_time'
    ], { limit: 50 });

    // @ts-ignore
    return adSets.map(as => as._data as MetaAdSet);
  }

  async getAds(accountId: string): Promise<MetaAd[]> {
    const account = new AdAccount(accountId);
    const ads = await account.getAds([
      'id', 'account_id', 'campaign_id', 'adset_id', 'name', 'status', 'creative'
    ], { limit: 50 });

    // @ts-ignore
    return ads.map(ad => ad._data as MetaAd);
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
    return insights.map((i: any) => i._data as MetaInsights);
  }
}
