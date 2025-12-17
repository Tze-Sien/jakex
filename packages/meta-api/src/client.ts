import { MetaAdAccount, MetaCampaign, MetaAdSet, MetaAd, MetaInsights, MetaResponse } from './types';

export class MetaAdsClient {
  private accessToken: string;
  private baseUrl: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    
    // Check if we should use the Mock API
    // If process.env.META_API_MOCK is 'true' or if the base URL is set to local
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_META_API === 'true';
    
    // Note: Since this runs on the server, we can access internal APIs via localhost
    // But typically this Client is used from Server Actions which are Node environment.
    // If we are mocking, we point to our own Next.js API route.
    this.baseUrl = useMock 
      ? 'http://localhost:3000/api/mock/meta' 
      : 'https://graph.facebook.com/v19.0';
      
    if (useMock) {
        console.log('⚠️ MetaAdsClient initialized in MOCK mode');
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
    return this.fetch<MetaAdAccount>('/me/adaccounts', {
      fields: 'id,account_id,name,currency,timezone_name,account_status,amount_spent,balance,created_time'
    });
  }

  async getCampaigns(accountId: string): Promise<MetaCampaign[]> {
    return this.fetch<MetaCampaign>(`/${accountId}/campaigns`, {
        fields: 'id,account_id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time',
        limit: '50'
    });
  }

  async getAdSets(accountId: string): Promise<MetaAdSet[]> {
    return this.fetch<MetaAdSet>(`/${accountId}/adsets`, {
        fields: 'id,account_id,campaign_id,name,status,optimization_goal,billing_event,bid_strategy,daily_budget,lifetime_budget,targeting,start_time,end_time',
        limit: '50' 
    });
  }

  async getAds(accountId: string): Promise<MetaAd[]> {
    return this.fetch<MetaAd>(`/${accountId}/ads`, {
        fields: 'id,account_id,campaign_id,adset_id,name,status,creative{id,name,title,body,image_url,call_to_action_type}',
        limit: '50'
    });
  }

  async getInsights(
    entityId: string, 
    level: 'campaign' | 'adset' | 'ad' = 'campaign',
    dateRange: 'today' | 'last_7d' | 'last_30d' = 'last_7d'
  ): Promise<MetaInsights[]> {
      // Map simplified string to Meta's date_preset or time_range
      // keeping it simple for now with date_preset
      const presetMap = {
          'today': 'today',
          'last_7d': 'last_7d',
          'last_30d': 'last_30d'
      };

      return this.fetch<MetaInsights>(`/${entityId}/insights`, {
          level,
          date_preset: presetMap[dateRange],
          fields: 'spend,impressions,clicks,cpc,cpm,ctr,actions,date_start,date_stop'
      });
  }
}
