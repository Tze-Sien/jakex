import {
  MetaAdAccount,
  MetaCampaign,
  MetaAdSet,
  MetaAd,
  MetaInsights,
  MetaInsightsParams,
  InsightsLevel,
  InsightsDatePreset
} from './types';
import {
  generateMockAdAccounts,
  generateMockCampaigns,
  generateMockAdSets,
  generateMockAds,
  generateMockInsights
} from './mock-data';

/**
 * Mock Meta Ads API Client
 * Returns generated mock data without making any network requests
 */
export class MockMetaAdsClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    console.log('⚠️ MockMetaAdsClient initialized - using internal generators');
  }

  async getAdAccounts(): Promise<MetaAdAccount[]> {
    // Return mock data directly
    return generateMockAdAccounts();
  }

  async getCampaigns(accountId: string): Promise<MetaCampaign[]> {
    // Generate 15 mock campaigns for the given account
    return generateMockCampaigns(accountId, 15);
  }

  async getAdSets(accountId: string): Promise<MetaAdSet[]> {
    // Generate ad sets for first 3 campaigns
    const campaigns = generateMockCampaigns(accountId, 3);
    const allAdSets = campaigns.flatMap(campaign =>
      generateMockAdSets(accountId, campaign.id, 3)
    );
    return allAdSets;
  }

  async getAds(accountId: string): Promise<MetaAd[]> {
    // Generate ads for campaigns and ad sets
    const campaigns = generateMockCampaigns(accountId, 2);
    const allAds: MetaAd[] = [];

    campaigns.forEach(campaign => {
      const adSets = generateMockAdSets(accountId, campaign.id, 2);
      adSets.forEach(adSet => {
        const ads = generateMockAds(accountId, campaign.id, adSet.id, 3);
        allAds.push(...ads);
      });
    });

    return allAds;
  }

  /**
   * Get insights for a specific entity (Account, Campaign, AdSet, or Ad)
   * @param entityId - The entity ID (act_XXX, campaign_id, adset_id, or ad_id)
   * @param params - Insights query parameters
   * @returns Array of insights data
   */
  async getInsights(
    entityId: string,
    params: MetaInsightsParams = {}
  ): Promise<MetaInsights[]> {
    const {
      level = InsightsLevel.CAMPAIGN,
      date_preset = InsightsDatePreset.LAST_7D,
      time_range,
      time_increment,
      breakdowns,
      ...otherParams
    } = params;

    const accountId = entityId.startsWith('act_') ? entityId : 'act_123456789';
    let insightsData: MetaInsights[] = [];

    // If time_increment is daily or a number, generate multiple data points
    if (time_increment) {
      const increment = time_increment === 'all_days' ? 1 :
                       time_increment === 'monthly' ? 30 :
                       typeof time_increment === 'number' ? time_increment : 1;
      const daysToGenerate = increment === 1 ? 7 : Math.min(increment, 30);

      for (let i = 0; i < daysToGenerate; i++) {
        const dayDate = new Date();
        dayDate.setDate(dayDate.getDate() - (daysToGenerate - i - 1));
        const dayStr = dayDate.toISOString().split('T')[0];

        const dailyInsights = generateMockInsights(
          entityId,
          accountId,
          level as any,
          date_preset as string,
          { since: dayStr!, until: dayStr! }
        );
        insightsData.push(dailyInsights);
      }
    } else if (breakdowns && breakdowns.length > 0) {
      // Generate breakdown data - breakdowns is always an array
      const breakdownStrings = breakdowns.map(b => String(b));

      if (breakdownStrings.includes('age')) {
        const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
        ageGroups.forEach(ageGroup => {
          const insights = generateMockInsights(
            entityId,
            accountId,
            level as any,
            date_preset as string,
            time_range
          );
          insightsData.push({ ...insights, age: ageGroup } as any);
        });
      } else if (breakdownStrings.includes('gender')) {
        ['male', 'female', 'unknown'].forEach(gender => {
          const insights = generateMockInsights(
            entityId,
            accountId,
            level as any,
            date_preset as string,
            time_range
          );
          insightsData.push({ ...insights, gender } as any);
        });
      } else if (breakdownStrings.includes('country')) {
        ['US', 'CA', 'GB', 'AU', 'DE'].forEach(country => {
          const insights = generateMockInsights(
            entityId,
            accountId,
            level as any,
            date_preset as string,
            time_range
          );
          insightsData.push({ ...insights, country } as any);
        });
      } else {
        insightsData.push(
          generateMockInsights(
            entityId,
            accountId,
            level as any,
            date_preset as string,
            time_range
          )
        );
      }
    } else {
      // Default: single insights object
      insightsData = [
        generateMockInsights(
          entityId,
          accountId,
          level as any,
          date_preset as string,
          time_range
        )
      ];
    }

    return insightsData;
  }
}
