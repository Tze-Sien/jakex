import { MockMetaAdsClient } from './mock-client';
import { RealMetaAdsClient } from './real-client';
import {
  MetaAdAccount,
  MetaCampaign,
  MetaAdSet,
  MetaAd,
  MetaInsights,
  MetaInsightsParams
} from './types';

/**
 * Interface that both Mock and Real clients implement
 */
export interface IMetaAdsClient {
  getAdAccounts(): Promise<MetaAdAccount[]>;
  getCampaigns(accountId: string): Promise<MetaCampaign[]>;
  getAdSets(accountId: string): Promise<MetaAdSet[]>;
  getAds(accountId: string): Promise<MetaAd[]>;
  getInsights(entityId: string, params?: MetaInsightsParams): Promise<MetaInsights[]>;
}

/**
 * Meta Ads Client Factory
 * Returns either MockMetaAdsClient or RealMetaAdsClient based on environment variable
 */
export class MetaAdsClient implements IMetaAdsClient {
  private client: IMetaAdsClient;

  constructor(accessToken: string) {
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_META_API === 'true';

    if (useMock) {
      this.client = new MockMetaAdsClient(accessToken);
    } else {
      this.client = new RealMetaAdsClient(accessToken);
    }
  }

  async getAdAccounts(): Promise<MetaAdAccount[]> {
    return this.client.getAdAccounts();
  }

  async getCampaigns(accountId: string): Promise<MetaCampaign[]> {
    return this.client.getCampaigns(accountId);
  }

  async getAdSets(accountId: string): Promise<MetaAdSet[]> {
    return this.client.getAdSets(accountId);
  }

  async getAds(accountId: string): Promise<MetaAd[]> {
    return this.client.getAds(accountId);
  }

  async getInsights(entityId: string, params?: MetaInsightsParams): Promise<MetaInsights[]> {
    return this.client.getInsights(entityId, params);
  }
}
