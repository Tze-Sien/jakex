import {
  MetaAdAccount,
  MetaCampaign,
  MetaAdSet,
  MetaAd,
  MetaInsights,
  MetaInsightsParams,
  InsightsLevel,
  InsightsDatePreset,
  AdAccountStatus,
  CampaignStatus,
  CampaignObjective,
  AdSetStatus,
  AdSetOptimizationGoal,
  AdSetBillingEvent,
  AdStatus
} from './types';
import {
  generateMockInsights
} from './mock-data';

// Fixed static mock data - completely consistent
const STATIC_MOCK_DATA = {
  accounts: [
    {
      id: 'act_123456789',
      account_id: '123456789',
      name: 'JakeX Demo Account',
      currency: 'USD',
      timezone_name: 'America/New_York',
      account_status: AdAccountStatus.ACTIVE,
      amount_spent: '15234.50',
      balance: '0',
      created_time: '2023-01-15T10:00:00Z'
    }
  ] as MetaAdAccount[],

  campaigns: [
    {
      id: '1001',
      account_id: '123456789',
      name: 'Sales - Summer Collection',
      status: CampaignStatus.ACTIVE,
      objective: CampaignObjective.OUTCOME_SALES,
      daily_budget: '5000',
      start_time: '2024-01-01T00:00:00Z'
    },
    {
      id: '1002',
      account_id: '123456789',
      name: 'Awareness - Brand Campaign',
      status: CampaignStatus.ACTIVE,
      objective: CampaignObjective.OUTCOME_AWARENESS,
      daily_budget: '3000',
      start_time: '2024-01-10T00:00:00Z'
    },
    {
      id: '1003',
      account_id: '123456789',
      name: 'Traffic - Website Visitors',
      status: CampaignStatus.ACTIVE,
      objective: CampaignObjective.OUTCOME_TRAFFIC,
      daily_budget: '2000',
      start_time: '2024-02-01T00:00:00Z'
    }
  ] as MetaCampaign[],

  adSets: [
    // Campaign 1001 ad sets
    {
      id: '1001_1',
      account_id: '123456789',
      campaign_id: '1001',
      name: 'Broad - US - 25-45',
      status: AdSetStatus.ACTIVE,
      optimization_goal: AdSetOptimizationGoal.OFFSITE_CONVERSIONS,
      billing_event: AdSetBillingEvent.IMPRESSIONS,
      daily_budget: '1500'
    },
    {
      id: '1001_2',
      account_id: '123456789',
      campaign_id: '1001',
      name: 'Retargeting - Engaged Users',
      status: AdSetStatus.ACTIVE,
      optimization_goal: AdSetOptimizationGoal.OFFSITE_CONVERSIONS,
      billing_event: AdSetBillingEvent.IMPRESSIONS,
      daily_budget: '2000'
    },
    // Campaign 1002 ad sets
    {
      id: '1002_1',
      account_id: '123456789',
      campaign_id: '1002',
      name: 'Lookalike - High Value',
      status: AdSetStatus.ACTIVE,
      optimization_goal: AdSetOptimizationGoal.REACH,
      billing_event: AdSetBillingEvent.IMPRESSIONS,
      daily_budget: '1500'
    },
    // Campaign 1003 ad sets
    {
      id: '1003_1',
      account_id: '123456789',
      campaign_id: '1003',
      name: 'Interest - Tech Enthusiasts',
      status: AdSetStatus.ACTIVE,
      optimization_goal: AdSetOptimizationGoal.LINK_CLICKS,
      billing_event: AdSetBillingEvent.IMPRESSIONS,
      daily_budget: '1000'
    }
  ] as MetaAdSet[],

  ads: [
    // AdSet 1001_1 ads
    {
      id: '1001_1_1',
      account_id: '123456789',
      campaign_id: '1001',
      adset_id: '1001_1',
      name: 'Summer Sale - Image Ad 1',
      status: AdStatus.ACTIVE,
      creative: {
        id: 'creative_1001_1_1',
        title: 'Summer Sale - Up to 50% Off',
        body: 'Shop our summer collection now',
        call_to_action_type: 'SHOP_NOW',
        image_url: 'https://picsum.photos/seed/ad1/1200/630'
      }
    },
    {
      id: '1001_1_2',
      account_id: '123456789',
      campaign_id: '1001',
      adset_id: '1001_1',
      name: 'Summer Sale - Image Ad 2',
      status: AdStatus.ACTIVE,
      creative: {
        id: 'creative_1001_1_2',
        title: 'Limited Time Offer',
        body: 'Dont miss out on summer deals',
        call_to_action_type: 'SHOP_NOW',
        image_url: 'https://picsum.photos/seed/ad2/1200/630'
      }
    },
    // AdSet 1001_2 ads
    {
      id: '1001_2_1',
      account_id: '123456789',
      campaign_id: '1001',
      adset_id: '1001_2',
      name: 'Retargeting - Special Offer',
      status: AdStatus.ACTIVE,
      creative: {
        id: 'creative_1001_2_1',
        title: 'Come Back for More',
        body: 'Exclusive offer just for you',
        call_to_action_type: 'SHOP_NOW',
        image_url: 'https://picsum.photos/seed/ad3/1200/630'
      }
    },
    // AdSet 1002_1 ads
    {
      id: '1002_1_1',
      account_id: '123456789',
      campaign_id: '1002',
      adset_id: '1002_1',
      name: 'Brand Awareness - Video Ad',
      status: AdStatus.ACTIVE,
      creative: {
        id: 'creative_1002_1_1',
        title: 'Discover Our Brand',
        body: 'Quality products you can trust',
        call_to_action_type: 'LEARN_MORE',
        image_url: 'https://picsum.photos/seed/ad4/1200/630'
      }
    },
    // AdSet 1003_1 ads
    {
      id: '1003_1_1',
      account_id: '123456789',
      campaign_id: '1003',
      adset_id: '1003_1',
      name: 'Traffic - Blog Article',
      status: AdStatus.ACTIVE,
      creative: {
        id: 'creative_1003_1_1',
        title: 'Read Our Latest Article',
        body: 'Tips and tricks for tech lovers',
        call_to_action_type: 'LEARN_MORE',
        image_url: 'https://picsum.photos/seed/ad5/1200/630'
      }
    }
  ] as MetaAd[]
};

/**
 * Mock Meta Ads API Client
 * Returns fixed static mock data for consistency
 * All calls return the same pre-generated data to maintain referential integrity
 */
export class MockMetaAdsClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getAdAccounts(): Promise<MetaAdAccount[]> {
    return STATIC_MOCK_DATA.accounts;
  }

  async getCampaigns(accountId: string): Promise<MetaCampaign[]> {
    return STATIC_MOCK_DATA.campaigns;
  }

  async getAdSets(accountId: string): Promise<MetaAdSet[]> {
    return STATIC_MOCK_DATA.adSets;
  }

  async getAds(accountId: string): Promise<MetaAd[]> {
    return STATIC_MOCK_DATA.ads;
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

  /**
   * Sync all campaigns with insights for Today, Last 3 Days, and Last 7 Days
   * Returns campaigns with their metadata snapshots embedded in insights
   */
  async syncCampaignsWithInsights(accountId: string): Promise<{
    campaigns: MetaCampaign[];
    insights: Array<MetaInsights & {
      campaign_metadata: MetaCampaign;
      time_range: string;
    }>;
  }> {
    const campaigns = await this.getCampaigns(accountId);
    const allInsights: Array<MetaInsights & {
      campaign_metadata: MetaCampaign;
      time_range: string;
    }> = [];

    const timeRanges = [
      { preset: InsightsDatePreset.TODAY, name: 'today' },
      { preset: InsightsDatePreset.LAST_3D, name: 'last_3d' },
      { preset: InsightsDatePreset.LAST_7D, name: 'last_7d' },
    ];

    for (const campaign of campaigns) {
      for (const timeRange of timeRanges) {
        const insights = await this.getInsights(campaign.id, {
          level: InsightsLevel.CAMPAIGN,
          date_preset: timeRange.preset,
        });

        // Add campaign metadata snapshot to each insight
        for (const insight of insights) {
          allInsights.push({
            ...insight,
            campaign_metadata: { ...campaign }, // Snapshot of campaign settings
            time_range: timeRange.name,
          });
        }
      }
    }

    return {
      campaigns,
      insights: allInsights,
    };
  }

  /**
   * Sync all ad sets with insights for Today, Last 3 Days, and Last 7 Days
   * Returns ad sets with their metadata snapshots embedded in insights
   */
  async syncAdSetsWithInsights(accountId: string): Promise<{
    adSets: MetaAdSet[];
    insights: Array<MetaInsights & {
      adset_metadata: MetaAdSet;
      time_range: string;
    }>;
  }> {
    const adSets = await this.getAdSets(accountId);
    const allInsights: Array<MetaInsights & {
      adset_metadata: MetaAdSet;
      time_range: string;
    }> = [];

    const timeRanges = [
      { preset: InsightsDatePreset.TODAY, name: 'today' },
      { preset: InsightsDatePreset.LAST_3D, name: 'last_3d' },
      { preset: InsightsDatePreset.LAST_7D, name: 'last_7d' },
    ];

    for (const adSet of adSets) {
      for (const timeRange of timeRanges) {
        const insights = await this.getInsights(adSet.id, {
          level: InsightsLevel.ADSET,
          date_preset: timeRange.preset,
        });

        // Add ad set metadata snapshot to each insight
        for (const insight of insights) {
          allInsights.push({
            ...insight,
            adset_metadata: { ...adSet }, // Snapshot of ad set settings
            time_range: timeRange.name,
          });
        }
      }
    }

    return {
      adSets,
      insights: allInsights,
    };
  }

  /**
   * Sync all ads with insights for Today, Last 3 Days, and Last 7 Days
   * Returns ads with their metadata snapshots embedded in insights
   */
  async syncAdsWithInsights(accountId: string): Promise<{
    ads: MetaAd[];
    insights: Array<MetaInsights & {
      ad_metadata: MetaAd;
      time_range: string;
    }>;
  }> {
    const ads = await this.getAds(accountId);
    const allInsights: Array<MetaInsights & {
      ad_metadata: MetaAd;
      time_range: string;
    }> = [];

    const timeRanges = [
      { preset: InsightsDatePreset.TODAY, name: 'today' },
      { preset: InsightsDatePreset.LAST_3D, name: 'last_3d' },
      { preset: InsightsDatePreset.LAST_7D, name: 'last_7d' },
    ];

    for (const ad of ads) {
      for (const timeRange of timeRanges) {
        const insights = await this.getInsights(ad.id, {
          level: InsightsLevel.AD,
          date_preset: timeRange.preset,
        });

        // Add ad metadata snapshot to each insight
        for (const insight of insights) {
          allInsights.push({
            ...insight,
            ad_metadata: { ...ad }, // Snapshot of ad settings and creative
            time_range: timeRange.name,
          });
        }
      }
    }

    return {
      ads,
      insights: allInsights,
    };
  }

  /**
   * Sync all entities (campaigns, ad sets, ads) with their insights
   * This is a comprehensive sync that returns everything with metadata snapshots
   */
  async syncAllWithInsights(accountId: string): Promise<{
    campaigns: {
      entities: MetaCampaign[];
      insights: Array<MetaInsights & { campaign_metadata: MetaCampaign; time_range: string }>;
    };
    adSets: {
      entities: MetaAdSet[];
      insights: Array<MetaInsights & { adset_metadata: MetaAdSet; time_range: string }>;
    };
    ads: {
      entities: MetaAd[];
      insights: Array<MetaInsights & { ad_metadata: MetaAd; time_range: string }>;
    };
  }> {
    const [campaignSync, adSetSync, adSync] = await Promise.all([
      this.syncCampaignsWithInsights(accountId),
      this.syncAdSetsWithInsights(accountId),
      this.syncAdsWithInsights(accountId),
    ]);

    return {
      campaigns: {
        entities: campaignSync.campaigns,
        insights: campaignSync.insights,
      },
      adSets: {
        entities: adSetSync.adSets,
        insights: adSetSync.insights,
      },
      ads: {
        entities: adSync.ads,
        insights: adSync.insights,
      },
    };
  }
}
