import { FacebookAdsApi, AdAccount, User } from 'facebook-nodejs-business-sdk';
import { MetaAdAccount, MetaCampaign, MetaAdSet, MetaAd, MetaInsights, MetaResponse } from './types';

export class MetaAdsClient {
  private accessToken: string;
  private baseUrl: string;
  private useMock: boolean;

  constructor(accessToken: string) {
    this.accessToken = accessToken;

    // Check if we should use the Mock API
    this.useMock = process.env.NEXT_PUBLIC_USE_MOCK_META_API === 'true';

    this.baseUrl = this.useMock
      ? 'http://localhost:3001/api/mock/meta'
      : 'https://graph.facebook.com/v19.0';

    if (this.useMock) {
        console.log('⚠️ MetaAdsClient initialized in MOCK mode');
    } else {
        FacebookAdsApi.init(this.accessToken);
    }
  }

  private async fetch<T>(path: string, params: Record<string, string> = {}): Promise<T[]> {
    // 1. Construct URL
    const url = new URL(`${this.baseUrl}${path}`);
    
    // 2. Add Query Params
    url.searchParams.append('access_token', this.accessToken);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    // 3. Make Request
    const res = await fetch(url.toString());
    
    if (!res.ok) {
      const errorBody = await res.json();
      throw new Error(`Meta API Error: ${errorBody.error?.message || res.statusText}`);
    }

    const json = (await res.json()) as MetaResponse<T>;
    return json.data;
  }

  // --- Public Methods ---

  async getAdAccounts(): Promise<MetaAdAccount[]> {
    if (this.useMock) {
      return this.fetch<MetaAdAccount>('/me/adaccounts', {
        fields: 'id,account_id,name,currency,timezone_name,account_status,amount_spent,balance,created_time'
      });
    }

    // Using SDK
    const me = new User('me');
    const accounts = await me.getAdAccounts([
      'id', 'account_id', 'name', 'currency', 'timezone_name', 'account_status', 'amount_spent', 'balance', 'created_time'
    ]);
    
    // @ts-ignore - SDK types can be tricky with their custom array response, but this maps to our interface
    return accounts.map(acc => acc._data as MetaAdAccount);
  }

  async getCampaigns(accountId: string): Promise<MetaCampaign[]> {
    if (this.useMock) {
      return this.fetch<MetaCampaign>(`/${accountId}/campaigns`, {
          fields: 'id,account_id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time',
          limit: '50'
      });
    }

    const account = new AdAccount(accountId);
    const campaigns = await account.getCampaigns([
      'id', 'account_id', 'name', 'status', 'objective', 'daily_budget', 'lifetime_budget', 'start_time', 'stop_time'
    ], { limit: 50 });

    // @ts-ignore
    return campaigns.map(c => c._data as MetaCampaign);
  }

  async getAdSets(accountId: string): Promise<MetaAdSet[]> {
    if (this.useMock) {
      return this.fetch<MetaAdSet>(`/${accountId}/adsets`, {
          fields: 'id,account_id,campaign_id,name,status,optimization_goal,billing_event,bid_strategy,daily_budget,lifetime_budget,targeting,start_time,end_time',
          limit: '50' 
      });
    }

    const account = new AdAccount(accountId);
    const adSets = await account.getAdSets([
      'id', 'account_id', 'campaign_id', 'name', 'status', 'optimization_goal', 'billing_event', 'bid_strategy', 'daily_budget', 'lifetime_budget', 'targeting', 'start_time', 'end_time'
    ], { limit: 50 });

    // @ts-ignore
    return adSets.map(as => as._data as MetaAdSet);
  }

  async getAds(accountId: string): Promise<MetaAd[]> {
    if (this.useMock) {
      return this.fetch<MetaAd>(`/${accountId}/ads`, {
          fields: 'id,account_id,campaign_id,adset_id,name,status,creative{id,name,title,body,image_url,call_to_action_type}',
          limit: '50'
      });
    }

    const account = new AdAccount(accountId);
    const ads = await account.getAds([
      'id', 'account_id', 'campaign_id', 'adset_id', 'name', 'status', 'creative'
    ], { limit: 50 });

    // @ts-ignore
    return ads.map(ad => ad._data as MetaAd);
  }

  async getInsights(
    entityId: string, 
    level: 'campaign' | 'adset' | 'ad' = 'campaign',
    dateRange: 'today' | 'last_7d' | 'last_30d' = 'last_7d'
  ): Promise<MetaInsights[]> {
      const presetMap = {
          'today': 'today',
          'last_7d': 'last_7d',
          'last_30d': 'last_30d'
      };

      if (this.useMock) {
        return this.fetch<MetaInsights>(`/${entityId}/insights`, {
            level,
            date_preset: presetMap[dateRange],
            fields: 'spend,impressions,clicks,cpc,cpm,ctr,actions,date_start,date_stop'
        });
      }

      // Using SDK for Insights
      // Note: In Meta SDK, insights are often fetched via the specific object (Campaign, AdSet, Ad)
      // or via the AdAccount for all objects at a certain level.
      // Here we use a generic approach if possible, but the SDK usually expects an ID.
      // We'll use AdAccount as a generic entry point if entityId is an account, 
      // but if entityId is a specific campaign/adset/ad, we use its own getInsights.
      
      const account = new AdAccount(entityId); // Assuming entityId is account/campaign etc.
      const insights = await account.getInsights([
        'spend', 'impressions', 'clicks', 'cpc', 'cpm', 'ctr', 'actions', 'date_start', 'date_stop'
      ], {
        level,
        date_preset: presetMap[dateRange]
      });

      // @ts-ignore
      return insights.map(i => i._data as MetaInsights);
  }
}
